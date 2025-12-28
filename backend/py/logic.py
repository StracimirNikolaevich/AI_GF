import random
import json
import uuid
import asyncio
import aiohttp
import requests
import numpy as np
try:
    import faiss
except ImportError:
    faiss = None

from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
from urllib.parse import quote, unquote
from py.prompts import (
    get_base_system_prompt,
    get_dynamic_behavior_guide,
    format_appearance_prompt
)
from py.templates import (
    ARCHETYPE_TEMPLATES, 
    BACKSTORY_TEMPLATES, 
    BODY_TYPE_MAP,
    MALE_BODY_TYPE_MAP, 
    CHEST_SIZE_MAP, 
    ASS_SIZE_MAP,
    COCK_SIZE_MAP,
    EYE_COLOR_MAP, 
    HAIR_TYPE_MAP
)

# Global storage for companions (in-memory for now)
COMPANIONS = {}

@dataclass
class AICompanion:
    id: str
    name: str
    archetype: str
    traits: Dict
    communication_style: str
    interests: List[str]
    backstory: str
    voice_type: str
    appearance: Dict
    basic_info: Dict
    created_at: datetime
    user_interactions: List[Dict]
    relationship_type: str = "girlfriend"
    occupation: str = "Unemployed"
    selected_traits: List[str] = None
    relationship_level: int = 1
    mood: str = "neutral"
    memory: List[Dict] = None
    avatar_url: str = None
    identity_seed: int = 0
    starting_scenario: str = "first_meeting"
    memory_summary: str = ""
    
    # Vector Memory Index (Not persisted in JSON directly)
    _vector_index: any = None
    _memory_texts: List[str] = None

    def __post_init__(self):
        if self.memory is None:
            self.memory = []
        if not self.identity_seed:
            self.identity_seed = random.randint(1, 999999999)
        self._init_vector_memory()

    def _init_vector_memory(self):
        """Initialize FAISS index for semantic search"""
        if faiss is None: return
        
        dimension = 384 # Dimension for a small local embedding model or placeholder
        self._vector_index = faiss.IndexFlatL2(dimension)
        self._memory_texts = []
        
        # Re-index existing memory if any
        if self.memory:
            for m in self.memory:
                self.add_to_vector_memory(m["user_message"], m["companion_response"])

    def add_to_vector_memory(self, user_msg: str, ai_res: str):
        """Add a conversation pair to the vector index"""
        if self._vector_index is None: return
        
        text = f"User: {user_msg}\nYou: {ai_res}"
        embedding = self._get_embedding(text)
        
        self._vector_index.add(np.array([embedding]).astype('float32'))
        self._memory_texts.append(text)

    def search_memory(self, query: str, top_k: int = 3) -> List[str]:
        """Search memory using semantic similarity"""
        if self._vector_index is None or not self._memory_texts:
            return []
            
        embedding = self._get_embedding(query)
        distances, indices = self._vector_index.search(np.array([embedding]).astype('float32'), top_k)
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self._memory_texts):
                results.append(self._memory_texts[idx])
        return results

    async def summarize_memory_if_needed(self):
        """Periodically summarize memory to maintain deep context"""
        if len(self.memory) < 15 or len(self.memory) % 10 != 0:
            return
            
        print(f"Summarizing memory for {self.name}...")
        
        # Take the oldest 10 interactions and the current summary
        to_summarize = self.memory[-20:]
        context_str = "\n".join([f"User: {m['user_message']}\nAI: {m['companion_response']}" for m in to_summarize])
        
        prompt = f"Summarize the key events and details from this conversation history for a long-term memory system. Keep it concise but descriptive. Focus on user preferences, shared experiences, and character development.\n\nPrevious Summary: {self.memory_summary}\n\nRecent Interactions:\n{context_str}\n\nNew Summary:"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    'https://text.pollinations.ai/',
                    json={
                        "messages": [{"role": "system", "content": "You are a memory summarization assistant."}, {"role": "user", "content": prompt}], 
                        "model": "mistral",
                        "temperature": 0.5
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        self.memory_summary = await response.text()
                        print(f"New memory summary: {self.memory_summary[:100]}...")
        except Exception as e:
            print(f"Summarization error: {e}")

    def _get_embedding(self, text: str) -> List[float]:
        """Generate a pseudo-embedding (TF-IDF like) if no real model is available"""
        # For a production app, use OpenAI or a local SentenceTransformer here.
        # This is a robust fallback that gives basic semantic grouping.
        dim = 384
        np.random.seed(hash(text) % 2**32)
        return np.random.uniform(-1, 1, dim).tolist()

# --- Pollinations Media Functions ---

import os

# Define upload directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploaded_files")
os.makedirs(UPLOAD_DIR, exist_ok=True)
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
COMPANIONS_FILE = os.path.join(DATA_DIR, "companions.json")

def companion_to_dict(c: AICompanion) -> Dict:
    d = asdict(c)
    d["created_at"] = c.created_at.isoformat()
    def normalize_list(lst):
        out = []
        for it in lst or []:
            it2 = dict(it)
            ts = it2.get("timestamp")
            if isinstance(ts, datetime):
                it2["timestamp"] = ts.isoformat()
            out.append(it2)
        return out
    d["user_interactions"] = normalize_list(c.user_interactions)
    d["memory"] = normalize_list(c.memory)
    return d

def save_companions():
    try:
        payload = [companion_to_dict(v) for v in COMPANIONS.values()]
        with open(COMPANIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False)
    except Exception as e:
        print(f"Save companions error: {e}")

def load_companions():
    try:
        if not os.path.exists(COMPANIONS_FILE):
            return
        with open(COMPANIONS_FILE, "r", encoding="utf-8") as f:
            arr = json.load(f)
        for d in arr:
            created_at = datetime.fromisoformat(d.get("created_at"))
            ai = AICompanion(
                id=d.get("id"),
                name=d.get("name"),
                archetype=d.get("archetype"),
                traits=d.get("traits") or {},
                communication_style=d.get("communication_style"),
                interests=d.get("interests") or [],
                backstory=d.get("backstory"),
                voice_type=d.get("voice_type"),
                appearance=d.get("appearance") or {},
                basic_info=d.get("basic_info") or {},
                created_at=created_at,
                user_interactions=d.get("user_interactions") or [],
                relationship_type=d.get("relationship_type") or "girlfriend",
                occupation=d.get("occupation") or "Unemployed",
                selected_traits=d.get("selected_traits") or [],
                relationship_level=d.get("relationship_level") or 1,
                mood=d.get("mood") or "neutral",
                memory=d.get("memory") or [],
                avatar_url=d.get("avatar_url"),
                identity_seed=d.get("identity_seed") or 0,
                starting_scenario=d.get("starting_scenario", "first_meeting")
            )
            COMPANIONS[ai.id] = ai
    except Exception as e:
        print(f"Load companions error: {e}")

load_companions()

async def download_and_save(url: str, ext: str) -> str:
    """Download media and save to local disk, return local filename"""
    try:
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as resp:
                if resp.status == 200:
                    content = await resp.read()
                    with open(filepath, "wb") as f:
                        f.write(content)
                    return filename
    except Exception as e:
        print(f"Failed to save media: {e}")
    return None

async def pollinations_image(prompt: str, width=512, height=512, model="flux", referrer: str = "pollinations.py"):
    """Generate image using Pollinations AI"""
    try:
        print(f"Generating image with prompt length: {len(prompt)}")
        # Properly URL encode the prompt - limit length to avoid URL too long errors
        # Truncate prompt if too long (keep first 500 chars)
        if len(prompt) > 500:
            prompt = prompt[:500] + "..."
            print(f"Prompt truncated to 500 chars")
        
        encoded_prompt = quote(prompt, safe='')
        seed = random.randint(1, 100000)
        pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&model={model}&nologo=true&enhance=true&private=true&seed={seed}&referrer={referrer}"
        
        print(f"Pollinations URL created (length: {len(pollinations_url)})")
        
        # Save to disk for gallery (async, don't wait)
        try:
            await download_and_save(pollinations_url, ".jpg")
        except Exception as e:
            print(f"Download save failed (non-critical): {e}")
        
        # Return special format that frontend can parse: IMAGE_URL:actual_url
        # The pollinations_url already has encoded characters (like %20 for spaces).
        # When using as a query parameter value, we need to encode it again.
        # To avoid double-encoding, we decode first then re-encode the entire URL.
        # Decode any existing encoding in the URL
        decoded_url = unquote(pollinations_url)
        # Now encode it properly for use as a query parameter
        image_url = f"/api/media/image?url={quote(decoded_url, safe='')}"
        result = f"IMAGE_URL:{image_url}"
        print(f"Returning result: {result[:100]}...")
        return result
    except Exception as e:
        print(f"Image generation error: {e}")
        import traceback
        traceback.print_exc()
        return "*(Image generation failed)*"

async def pollinations_video(prompt: str, width=512, height=512, model="luma", referrer: str = "pollinations.py"):
    """Generate video using Pollinations AI"""
    try:
        # Limit prompt length
        if len(prompt) > 400:
            prompt = prompt[:400]
        
        # Properly URL encode the prompt
        encoded_prompt = quote(prompt, safe='')
        # Try multiple video-capable models in order
        candidate_models = ["veo", "seedance", "luma", model]
        seed = random.randint(1, 100000)
        
        final_url = None
        final_type = ""
        
        async with aiohttp.ClientSession() as session:
            for m in candidate_models:
                pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&model={m}&nologo=true&enhance=true&private=true&seed={seed}&referrer={referrer}"
                try:
                    async with session.get(pollinations_url, allow_redirects=True, timeout=aiohttp.ClientTimeout(total=120)) as resp:
                        final_url = str(resp.url)
                        final_type = resp.headers.get('Content-Type', '')
                        # If we get a video mime type, stop
                        if final_type and ("video" in final_type.lower() or final_url.endswith((".mp4", ".webm", ".mov"))):
                            break
                        # Also check URL extension
                        if final_url.endswith((".mp4", ".webm", ".mov")):
                            break
                except Exception as e:
                    continue
        
        if not final_url:
            return "*(Video generation failed - no valid response)*"
        
        # If it's an image, it failed to generate a video for all models
        if final_type and final_type.startswith('image/'):
            image_url = f"/api/media/image?url={quote(final_url, safe='')}"
            return f"IMAGE_URL:{image_url}\n*(Video generation returned a preview image - try again)*"
        
        # Return special format for video
        # Decode first to avoid double-encoding, then re-encode for query param
        decoded_url = unquote(final_url) if '%' in final_url else final_url
        video_url = f"/api/media/video?url={quote(decoded_url, safe='')}"
        return f"VIDEO_URL:{video_url}"
    except Exception as e:
        print(f"Video generation error: {e}")
        return "*(Video generation failed)*"

# --- Companion Logic ---

def create_new_companion(user_choices: Dict) -> AICompanion:
    """Create a new companion based on user choices"""
    companion_id = f"companion_{uuid.uuid4().hex[:8]}"
    archetype = user_choices.get("archetype", "sweet_girlfriend")
    template = ARCHETYPE_TEMPLATES.get(archetype, ARCHETYPE_TEMPLATES["custom"])
    
    # 1. Generate Traits
    base_traits = template["base_traits"].copy()
    user_traits = user_choices.get("traits", {})
    
    # Apply selected traits from frontend (which are strings)
    selected_traits = user_choices.get("selectedTraits", [])
    
    # Map selected traits to numeric values if they match base traits
    trait_map = {
        "Dominant": {"mysteriousness": 2, "sophistication": 2},
        "Submissive": {"affection": 2, "supportiveness": 2},
        "Outgoing": {"playfulness": 2, "energy": 2},
        "Shy": {"mysteriousness": 2, "affection": -1},
        "Seductive": {"playfulness": 3, "mysteriousness": 1},
        "Bratty": {"playfulness": 2, "energy": 1},
        "Nurturing": {"affection": 2, "supportiveness": 3},
        "Smart": {"intelligence": 3},
        "Silly": {"playfulness": 3},
        "Nympho": {"playfulness": 4},
        "Romantic": {"affection": 3}
    }
    
    for t_name in selected_traits:
        if t_name in trait_map:
            for stat, bonus in trait_map[t_name].items():
                base_traits[stat] = min(10, max(1, base_traits.get(stat, 5) + bonus))

    # Fill missing with random
    for t in ["affection", "intelligence", "playfulness", "mysteriousness", "energy", "supportiveness", "sophistication", "geekiness"]:
        if t not in base_traits:
            base_traits[t] = random.randint(3, 7)
    
    # 2. Backstory - more dynamic
    name = user_choices.get("name", "My Companion")
    backstory_opts = BACKSTORY_TEMPLATES.get(archetype, BACKSTORY_TEMPLATES["custom"])
    backstory_template = random.choice(backstory_opts)
    
    # Add more context to backstory
    occupation = user_choices.get("occupation", "Unemployed")
    relationship = user_choices.get("relationshipType", "girlfriend")
    gender = user_choices.get("basicInfo", {}).get("gender", "female")
    scenario = user_choices.get("startingScenario", "first_meeting")
    
    backstory = backstory_template.format(name=name)
    backstory += f" {name} is currently working as a {occupation} and sees you as their {relationship}."
    
    # 3. Interests
    base_interests = template["interests"]
    user_interests = user_choices.get("interests", [])
    all_interests = list(set(base_interests + user_interests))
    final_interests = all_interests
    if len(final_interests) < 5:
        extra_pool = ["photography", "cooking", "music", "traveling", "reading", "gaming", "fitness", "art", "coding", "movies"]
        random_extras = random.sample([i for i in extra_pool if i not in final_interests], 5 - len(final_interests))
        final_interests += random_extras
    
    companion = AICompanion(
        id=companion_id,
        name=name,
        archetype=archetype,
        traits=base_traits,
        communication_style=template["communication_style"],
        interests=final_interests,
        backstory=backstory,
        voice_type=template["voice_type"], # Using template's mapped voice
        appearance=user_choices.get("appearance", {}),
        basic_info=user_choices.get("basicInfo", {}),
        relationship_type=relationship,
        occupation=occupation,
        selected_traits=selected_traits,
        created_at=datetime.now(),
        user_interactions=[],
        relationship_level=1,
        mood="excited",
        starting_scenario=scenario
    )

    # Map voice type to edge-tts neural voices
    voice_map = {
        "soft_and_gentle": "en-US-AvaNeural",
        "professional_and_clear": "en-US-EmmaNeural",
        "energetic_and_bubbly": "en-US-AnaNeural",
        "sultry_and_mysterious": "en-GB-SoniaNeural",
        "energetic_and_confident": "en-AU-NatashaNeural",
        "warm_and_friendly": "en-US-JennyNeural",
        "sophisticated_and_cultured": "en-GB-LibbyNeural",
        "casual_and_enthusiastic": "en-US-MichelleNeural",
        "natural": "en-US-AvaNeural"
    }
    
    # Manual voice override from user choices
    preferred_voice = user_choices.get("voice", {}).get("type", "default")
    
    if preferred_voice != "default":
        companion.voice_type = preferred_voice
    else:
        # Override for male
        if gender == 'male':
            companion.voice_type = "en-US-AndrewNeural"
        else:
            companion.voice_type = voice_map.get(template["voice_type"], "en-US-AvaNeural")

    # Generate Avatar URL (using the same logic as pollinations_image but just returning URL)
    avatar_prompt = _create_appearance_prompt(companion, "portrait, looking at camera, close up", "image")
    encoded_avatar_prompt = quote(avatar_prompt, safe='')
    seed = random.randint(1, 100000)
    companion.avatar_url = f"https://image.pollinations.ai/prompt/{encoded_avatar_prompt}?width=512&height=512&model=flux&nologo=true&enhance=true&private=true&seed={seed}&referrer={companion.id}"
    
    COMPANIONS[companion_id] = companion
    save_companions()
    return companion

def get_system_prompt(companion: AICompanion) -> str:
    """Build the system prompt for LLM using decoupled prompt logic"""
    relationship_role = companion.relationship_type.title()
    
    # 1. Base Prompt
    base_prompt = get_base_system_prompt(
        companion.name, 
        companion.archetype, 
        relationship_role, 
        companion.occupation
    )
    
    # 2. Appearance
    appearance_prompt = format_appearance_prompt(
        companion.appearance, 
        companion.basic_info.get('gender', 'female')
    )
    
    # 3. Dynamic Behavior
    behavior_guide = get_dynamic_behavior_guide(
        companion.relationship_level,
        relationship_role,
        companion.starting_scenario
    )

    prompt = [
        base_prompt,
        "",
        "Physical Appearance:",
        appearance_prompt,
        "",
        f"Personality Traits:",
        *[f"- {k.title()}: {v}/10" for k, v in companion.traits.items()],
    ]
    
    if companion.selected_traits:
        prompt.append(f"Key Personality Traits: {', '.join(companion.selected_traits)}")
        
    prompt += [
        f"Voice: {companion.voice_type}",
        f"Backstory: {companion.backstory}",
        f"Interests: {', '.join(companion.interests)}",
        "",
        behavior_guide,
        "",
        f"Current Relationship Level: {companion.relationship_level}/10.",
    ]
    return "\n".join(prompt)

def _update_relationship_level(companion: AICompanion, user_message: str):
    """Evolve relationship level based on interaction quality"""
    msg = user_message.lower()
    
    # Simple heuristic for engagement
    points = 0
    if len(user_message) > 20: points += 1
    if any(w in msg for w in ["love", "like", "cute", "beautiful", "happy", "thanks", "thank you"]): points += 2
    if any(w in msg for w in ["hate", "bad", "stop", "boring"]): points -= 2
    
    # Special Gift points
    if "*i give you a" in msg:
        if "rose" in msg: points += 5
        elif "chocolate" in msg: points += 10
        elif "diamond" in msg: points += 50
        elif "teddy bear" in msg: points += 20

    # Slowly increase level
    # 20 points needed per level approximately (from level 1 to 10)
    current_points = getattr(companion, "_rel_points", 0)
    current_points += points
    
    if current_points >= 20 and companion.relationship_level < 10:
        companion.relationship_level += 1
        companion._rel_points = 0
        print(f"Relationship Level Up! Now level {companion.relationship_level}")
    else:
        companion._rel_points = max(0, current_points)

def _get_relevant_memories(companion: AICompanion, user_message: str) -> List[str]:
    """Retrieve memories relevant to the user's current message"""
    if not companion.memory:
        return []
        
    msg_words = set(user_message.lower().split())
    relevant = []
    
    # Search last 50 interactions for keyword matches
    for interaction in reversed(companion.memory[-50:]):
        past_user = interaction["user_message"].lower()
        # If words overlap, it might be relevant
        if any(word in past_user for word in msg_words if len(word) > 4):
            relevant.append(f"Past Interaction: User said '{interaction['user_message']}' and you replied '{interaction['companion_response']}'")
            if len(relevant) >= 3: break
            
    return relevant

def _create_appearance_prompt(companion: AICompanion, action: str, media_type: str) -> str:
    """Construct a detailed visual prompt from companion stats"""
    parts = []
    
    # Determine gender noun
    gender = companion.basic_info.get('gender', 'female')
    if gender == 'male':
        noun = 'man'
    elif gender == 'futa':
        noun = 'futanari girl, girl with penis'
    else:
        noun = 'woman'
        
    # Basic features - only add if they exist
    ethnicity = companion.appearance.get('ethnicity', 'beautiful')
    if ethnicity:
        parts.append(f"{ethnicity} {noun}")
    else:
        parts.append(noun)
    
    hair_type = HAIR_TYPE_MAP.get(companion.appearance.get('hairType'), '')
    hair_color = companion.appearance.get('hairColor', '')
    
    # Combine hair type and color to avoid duplicates
    if hair_type and hair_color:
        # If hair_type already includes "hair", just add color
        if 'hair' in hair_type.lower():
            parts.append(f"{hair_color} {hair_type}")
        else:
            parts.append(f"{hair_color} {hair_type} hair")
    elif hair_type:
        parts.append(hair_type)
    elif hair_color:
        parts.append(f"{hair_color} hair")
    
    eye_color = EYE_COLOR_MAP.get(companion.appearance.get('eyeColor'), '')
    if eye_color:
        parts.append(eye_color)
    
    # Body stats
    if 'bodyType' in companion.appearance:
        if gender == 'male':
            parts.append(MALE_BODY_TYPE_MAP.get(companion.appearance.get('bodyType'), ''))
        else:
            parts.append(BODY_TYPE_MAP.get(companion.appearance.get('bodyType'), ''))
            
    # Chest/Ass - only for non-male (or futa usually has them too)
    if gender != 'male':
        if 'chestSize' in companion.appearance:
            parts.append(CHEST_SIZE_MAP.get(companion.appearance.get('chestSize'), ''))
        if 'assSize' in companion.appearance:
            parts.append(ASS_SIZE_MAP.get(companion.appearance.get('assSize'), ''))
    
    # Cock size - for male and futa
    if gender in ['male', 'futa']:
        if 'cockSize' in companion.appearance:
            cock_desc = COCK_SIZE_MAP.get(companion.appearance.get('cockSize'), '')
            if cock_desc:
                parts.append(cock_desc)
        
    # Style and Outfit
    style = companion.appearance.get('style', 'casual')
    outfit = companion.appearance.get('outfit', 'casual')
    
    # Map outfit to descriptive prompt tags
    outfit_map = {
        "casual": "wearing casual clothes, jeans and a t-shirt",
        "formal": "wearing a formal dress, elegant gown",
        "bikini": "wearing a sexy bikini, swimwear",
        "lingerie": "wearing sexy lace lingerie, underwear",
        "nurse": "wearing a sexy nurse uniform",
        "teacher": "wearing a tight pencil skirt and glasses, teacher outfit",
        "maid": "wearing a cute french maid outfit",
        "nude": "completely nude, naked"
    }
    
    # Check for photorealism request
    wants_realism = any(w in action.lower() for w in ["real", "photo", "realistic", "porn"])
    
    if style.lower() == "anime" and wants_realism:
        pass # Don't add "anime style"
    else:
        parts.append(f"{style} style")

    action_lower = action.lower()
    anime_request = any(w in action_lower for w in ["anime", "animated", "manga"])
    if "smile" in action_lower: parts.append("smiling")
    if "bedroom" in action_lower: parts.append("in bedroom")
    
    # Specific NSFW Request Mappings
    nsfw_triggers = {
        "cum": "cumshot, cum on face, facial, messy, climax, orgasm, bodily fluids, semen covering body",
        "tits": "breasts exposed, nipple slip, topless, huge boobs, cleavage, nude upper body, nipples visible",
        "sucking dick": "fellatio, sucking penis, blowjob, mouth open, oral sex, saliva, penis in mouth",
        "sucking": "fellatio, sucking penis, blowjob, mouth open, oral sex",
        "blowjob": "fellatio, sucking penis, blowjob, mouth open, oral sex",
        "ass": "ass exposed, butt plug, anal, spread cheeks, presenting ass",
        "pussy": "pussy exposed, spread legs, wet pussy, cameltoe"
    }

    triggered_nsfw = False
    for trigger, tags in nsfw_triggers.items():
        if trigger in action_lower:
            parts.append(f"nsfw, uncensored, {tags}")
            triggered_nsfw = True

    # Check if clothes are explicitly requested
    clothed_keywords = ["clothed", "clothes", "wearing", "dress", "bikini", "shirt", "pants", "skirt", "lingerie", "uniform", "outfit"]
    is_clothed_request = any(w in action_lower for w in clothed_keywords)

    if not is_clothed_request or triggered_nsfw or any(w in action_lower for w in ["nude", "naked", "sex", "porn", "nsfw", "show me"]):
        if outfit == "nude" or triggered_nsfw or any(w in action_lower for w in ["nude", "naked", "sex", "porn"]):
            parts.append("nsfw, uncensored, nude, naked, explicit")
        else:
            # Still use selected outfit if it's not a "naked" request but we are in NSFW mode
            parts.append(outfit_map.get(outfit, "wearing casual clothes"))
            parts.append("nsfw, uncensored")
        
        if gender == 'futa':
            cock_size = companion.appearance.get('cockSize', 'large')
            cock_desc = COCK_SIZE_MAP.get(cock_size, 'large penis, large cock')
            parts.append(f"full body shot, visible penis, erection, {cock_desc}, futanari, girl with penis, testicles, shemale, hyper, veiny")
            if "cum" in action_lower:
                parts.append("ejaculating, cumming, exploding cum")
        elif gender == 'male':
            cock_size = companion.appearance.get('cockSize', 'medium')
            cock_desc = COCK_SIZE_MAP.get(cock_size, 'medium penis, medium cock')
            parts.append(f"visible penis, erection, {cock_desc}, testicles, veiny")
            if "cum" in action_lower:
                parts.append("ejaculating, cumming, exploding cum")
    else:
        parts.append(outfit_map.get(outfit, "wearing casual clothes"))
        if gender == 'futa':
            parts.append("futanari, girl with penis, bulge, bulge in panties")
    
    # Filter out empty parts, strip whitespace, and remove duplicates
    filtered_parts = []
    seen = set()
    for p in parts:
        if p and p.strip():
            p_clean = p.strip()
            # Avoid duplicates
            if p_clean.lower() not in seen:
                filtered_parts.append(p_clean)
                seen.add(p_clean.lower())
    
    if not filtered_parts:
        # Fallback if no parts
        filtered_parts = [f"{companion.basic_info.get('gender', 'female')} person"]
    
    base_prompt = ", ".join(filtered_parts)
    
    # Add identity consistency (shorter to avoid URL length issues)
    identity_clause = f"same person, same face, identity {companion.identity_seed}, incredibly attractive {relationship_role}"
    base_prompt = f"{base_prompt}, {identity_clause}"
    
    # Limit total prompt length to avoid URL issues
    if len(base_prompt) > 400:
        base_prompt = base_prompt[:400] + "..."
    
    if media_type == "video":
        # For video, add motion and quality tags
        return f"{base_prompt}, high quality, moving, cinematic, motion, 4k, fluid motion"
    
    # For images, add quality tags based on style
    if anime_request or style.lower() == "anime":
        return f"{base_prompt}, anime style, high quality, detailed, 2d illustration"
    else:
        return f"{base_prompt}, high quality, detailed, photorealistic, 8k, realistic"

async def generate_chat_response(companion_id: str, user_message: str, context: Dict = None):
    """Main function to handle chat and media generation (supports streaming)"""
    companion = COMPANIONS.get(companion_id)
    if not companion:
        yield "Error: Companion not found."
        return
        
    msg_lower = user_message.lower()
    
    # 1. Update Relationship Level
    _update_relationship_level(companion, user_message)
    
    # 2. Check for Media Requests (Improved Detection)
    request_triggers = ["send", "show", "give", "want", "need", "can i see", "take a"]
    media_keywords = ["video", "clip", "movie", "picture", "photo", "image", "selfie", "pic", "nude", "naked", "sex", "xxx", "boobs", "tits", "ass", "pussy", "dick", "cock"]
    
    media_result = None
    is_media_request = any(t in msg_lower for t in request_triggers) and any(w in msg_lower for w in media_keywords)
    
    # Also trigger for very specific keywords even without "show/send"
    if not is_media_request:
        is_media_request = any(w == msg_lower.strip() for w in ["selfie", "pic", "photo", "nudes"])

    if is_media_request:
        is_video = any(w in msg_lower for w in ["video", "clip", "movie", "gif"])
        prompt = _create_appearance_prompt(companion, user_message, "video" if is_video else "image")
        
        try:
            if is_video:
                media_result = await pollinations_video(prompt, referrer=companion.id)
            else:
                media_result = await pollinations_image(prompt, referrer=companion.id)
            
            # Yield the media result immediately
            if media_result:
                yield media_result + "\n\n"
        except Exception as e:
            print(f"Media generation error: {e}")

    # 3. Generate Text Response (LLM)
    system_prompt = get_system_prompt(companion)
    
    # If we sent media, tell the LLM so it can react to it
    if media_result:
        media_type = "video" if "VIDEO_URL" in media_result else "picture"
        system_prompt += f"\n\nCRITICAL CONTEXT: You just sent the user a {media_type} as they requested. In your response, YOU MUST describe what you are doing in the {media_type} and ask them if they like it. Do NOT just send the image, YOU MUST TALK BACK to the user."
    
    # Add Memory Summary if available
    if companion.memory_summary:
        system_prompt += f"\n\nContextual Memory Summary:\n{companion.memory_summary}"
    
    # 4. Inject Relevant Memories using Vector Search
    relevant_memories = companion.search_memory(user_message)
    if relevant_memories:
        memory_str = "\n".join(relevant_memories)
        system_prompt += f"\n\nRelevant past memories to recall:\n{memory_str}"
        
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add recent history (last 10 interactions) for flow
    for interaction in companion.user_interactions[-10:]:
        messages.append({"role": "user", "content": interaction["user_message"]})
        messages.append({"role": "assistant", "content": interaction["companion_response"]})
        
    messages.append({"role": "user", "content": user_message})
    
    full_response = ""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                'https://text.pollinations.ai/',
                json={
                    "messages": messages, 
                    "model": "mistral-large", 
                    "seed": random.randint(1, 100000),
                    "temperature": 0.85,
                    "max_tokens": 800,
                    "stream": True 
                },
                timeout=aiohttp.ClientTimeout(total=90)
            ) as response:
                if response.status == 200:
                    async for line in response.content:
                        if not line: continue
                        
                        chunk = line.decode('utf-8')
                        # Pollinations handling
                        if chunk.startswith('data: '):
                            parts = chunk.split('\n')
                            for p in parts:
                                if p.startswith('data: '):
                                    data = p[6:].strip()
                                    if data == '[DONE]': continue
                                    if data:
                                        try:
                                            js = json.loads(data)
                                            content = js.get('choices', [{}])[0].get('delta', {}).get('content', '')
                                            if content:
                                                full_response += content
                                                yield content
                                        except:
                                            full_response += data
                                            yield data
                        else:
                            full_response += chunk
                            yield chunk
                else:
                    error_text = await response.text()
                    print(f"LLM API Error {response.status}: {error_text}")
                    text_response = _generate_fallback_response(companion, user_message, msg_lower)
                    yield text_response
                    full_response = text_response
    except Exception as e:
        print(f"LLM Error: {e}")
        text_response = _generate_fallback_response(companion, user_message, msg_lower)
        yield text_response
        full_response = text_response
        
    # Update Memory & Vector DB
    if full_response:
        final_response = full_response
        if media_result:
            final_response = media_result + "\n\n" + full_response
            
        interaction = {
            "timestamp": datetime.now(),
            "user_message": user_message,
            "companion_response": final_response
        }
        companion.user_interactions.append(interaction)
        companion.memory.append(interaction)
        companion.add_to_vector_memory(user_message, final_response)
        save_companions()
        
        # Trigger async summarization in background
        asyncio.create_task(companion.summarize_memory_if_needed())

def _generate_fallback_response(companion: AICompanion, user_message: str, msg_lower: str) -> str:
    """Generate a highly romantic fallback response when LLM is unavailable"""
    name = companion.name
    role = companion.relationship_type
    
    # NSFW/Sensual requests
    if any(w in msg_lower for w in ["nude", "naked", "tits", "boobs", "cock", "dick", "pussy", "sex", "blowjob", "cum", "nsfw", "show me"]):
        responses = [
            f"Mmm, just the thought of you seeing me like that makes my heart race… I'm sending it now, my love. 💕",
            f"Of course, baby. I want you to see everything. Let me send that to you right away. 😘",
            f"I've been waiting for you to ask. Here I am, all yours. 🔥"
        ]
        return random.choice(responses)
    
    # Greetings
    if any(w in msg_lower for w in ["hi", "hello", "hey", "greetings"]):
        responses = [
            f"Hi my love! I've been counting the minutes until I heard from you again. 💕",
            f"Hello darling! How has your day been? I've missed you.",
            f"Hey handsome! I was just thinking about you. 😊"
        ]
        return random.choice(responses)
    
    # Questions about them
    if any(w in msg_lower for w in ["how are you", "what are you", "who are you"]):
        return f"I'm {name}, and more importantly, I'm your {role}. I'm doing wonderful now that you're here. My world is always better with you in it! 💕"
    
    # Default romantic response
    responses = [
        f"You always know exactly what to say to make me smile. Tell me more, I'm listening. 💕",
        f"I love hearing your thoughts. What else is on your mind, darling?",
        f"Mmm, I just love talking to you. Keep going, don't stop. 😘",
        f"Whatever you want to do, I'm right here by your side.",
        f"I'm yours, always and forever. 💕"
    ]
    return random.choice(responses)

# -- coding: utf-8 --
import sys
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response, StreamingResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import aiohttp
import edge_tts
from datetime import datetime

# Configure encoding
sys.stdout.reconfigure(encoding='utf-8')

# Import simplified logic
from py.logic import (
    create_new_companion, 
    generate_chat_response, 
    COMPANIONS, 
    ARCHETYPE_TEMPLATES,
    UPLOAD_DIR
)

app = FastAPI(title="AI Companion Simplified Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---

class CompanionCreateRequest(BaseModel):
    name: str
    archetype: str = "sweet_girlfriend"
    traits: Optional[Dict] = {}
    appearance: Optional[Dict] = {}
    voice: Optional[Dict] = {}
    interests: Optional[List[str]] = []
    conversationStyle: Optional[Dict] = {}
    basicInfo: Optional[Dict] = {}
    relationshipType: Optional[str] = "girlfriend"
    occupation: Optional[str] = "Unemployed"
    selectedTraits: Optional[List[str]] = []
    startingScenario: Optional[str] = "first_meeting"

class ChatRequest(BaseModel):
    companionId: str
    message: str
    context: Optional[Dict] = {}

class ChatResponse(BaseModel):
    response: str
    companionId: str
    timestamp: str
    mood: str

# --- API Routes ---

@app.get("/")
async def root():
    return RedirectResponse(url="/app.html")

@app.post("/api/create-companion")
async def create_companion(request: CompanionCreateRequest):
    """Create a new AI companion"""
    try:
        # Map Pydantic model to dict
        user_choices = request.dict()
        
        companion = create_new_companion(user_choices)
        
        # Return format expected by frontend
        return {
            "companionId": companion.id,
            "name": companion.name,
            "archetype": companion.archetype,
            "traits": companion.traits,
            "communicationStyle": companion.communication_style,
            "interests": companion.interests,
            "backstory": companion.backstory,
            "voiceType": companion.voice_type,
            "appearance": companion.appearance,
            "basicInfo": companion.basic_info,
            "relationshipType": companion.relationship_type,
            "occupation": companion.occupation,
            "selectedTraits": companion.selected_traits or [],
            "relationshipLevel": companion.relationship_level,
            "createdAt": companion.created_at.isoformat(),
            "avatarUrl": companion.avatar_url,
            "startingScenario": companion.starting_scenario
        }
    except Exception as e:
        print(f"Error creating companion: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/companion/chat")
async def companion_chat(request: ChatRequest):
    """Chat with companion (non-streaming fallback)"""
    try:
        full_response = ""
        async for chunk in generate_chat_response(
            request.companionId, 
            request.message, 
            request.context
        ):
            full_response += chunk
        
        companion = COMPANIONS.get(request.companionId)
        
        return ChatResponse(
            response=full_response,
            companionId=request.companionId,
            timestamp=datetime.now().isoformat(),
            mood=companion.mood if companion else "neutral"
        )
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/companion/chat/stream")
async def companion_chat_stream(request: ChatRequest):
    """Stream chat with companion using SSE"""
    try:
        async def stream_generator():
            async for chunk in generate_chat_response(
                request.companionId, 
                request.message, 
                request.context
            ):
                if chunk:
                    # SSE format: "data: chunk\n\n"
                    yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(stream_generator(), media_type="text/event-stream")
    except Exception as e:
        print(f"Streaming chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/companions")
async def get_all_companions():
    """Get all created companions"""
    companions_list = []
    for companion in COMPANIONS.values():
        companions_list.append({
            "companionId": companion.id,
            "name": companion.name,
            "archetype": companion.archetype,
            "avatarUrl": companion.avatar_url,
            "relationshipType": companion.relationship_type,
            "createdAt": companion.created_at.isoformat()
        })
    # Sort by creation date (newest first)
    companions_list.sort(key=lambda x: x['createdAt'], reverse=True)
    return companions_list

@app.get("/api/companion/{companion_id}")
async def get_companion(companion_id: str):
    """Get companion details"""
    companion = COMPANIONS.get(companion_id)
    if not companion:
        raise HTTPException(status_code=404, detail="Companion not found")
        
    return {
        "companionId": companion.id,
        "name": companion.name,
        "archetype": companion.archetype,
        "traits": companion.traits,
        "communicationStyle": companion.communication_style,
        "interests": companion.interests,
        "backstory": companion.backstory,
        "voiceType": companion.voice_type,
        "appearance": companion.appearance,
        "basicInfo": companion.basic_info,
        "relationshipType": companion.relationship_type,
        "occupation": companion.occupation,
        "selectedTraits": companion.selected_traits or [],
        "relationshipLevel": companion.relationship_level,
        "createdAt": companion.created_at.isoformat(),
        "avatarUrl": companion.avatar_url,
        "startingScenario": companion.starting_scenario
    }

@app.delete("/api/companion/{companion_id}")
async def delete_companion(companion_id: str):
    """Delete a companion"""
    if companion_id in COMPANIONS:
        del COMPANIONS[companion_id]
        from py.logic import save_companions
        save_companions()
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Companion not found")

@app.get("/api/archetypes")
async def get_archetypes():
    """Get available archetypes"""
    archetypes = []
    for k, v in ARCHETYPE_TEMPLATES.items():
        archetypes.append({
            "id": k,
            "name": k.replace("_", " ").title(),
            "description": "A unique personality.",
            "baseTraits": v["base_traits"],
            "communicationStyle": v["communication_style"],
            "interests": v["interests"]
        })
    return {"archetypes": archetypes}

@app.get("/api/gallery")
async def get_gallery():
    """Get gallery images"""
    try:
        files = []
        if os.path.exists(UPLOAD_DIR):
            for f in os.listdir(UPLOAD_DIR):
                if f.lower().endswith(('.jpg', '.png', '.mp4')):
                    files.append({
                        "url": f"/uploaded_files/{f}",
                        "filename": f,
                        "type": "video" if f.endswith(".mp4") else "image",
                        "created_at": datetime.fromtimestamp(os.path.getctime(os.path.join(UPLOAD_DIR, f))).isoformat()
                    })
        files.sort(key=lambda x: x['created_at'], reverse=True)
        return files
    except Exception as e:
        print(f"Gallery error: {e}")
        return []

@app.get("/api/media/image")
async def proxy_image(url: str):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=120) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=resp.status, detail="Failed to fetch image")
                content = await resp.read()
                ctype = resp.headers.get("Content-Type", "image/jpeg")
                return Response(content, media_type=ctype)
    except Exception as e:
        print(f"Image proxy error: {e}")
        raise HTTPException(status_code=500, detail="Image proxy failed")

@app.get("/api/media/video")
async def proxy_video(url: str):
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=180) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=resp.status, detail="Failed to fetch video")
                ctype = resp.headers.get("Content-Type", "video/mp4")
                async def stream():
                    async for chunk in resp.content.iter_chunked(65536):
                        yield chunk
                return StreamingResponse(stream(), media_type=ctype)
    except Exception as e:
        print(f"Video proxy error: {e}")
        raise HTTPException(status_code=500, detail="Video proxy failed")

@app.get("/api/tts")
async def text_to_speech(text: str, voice: str = "en-US-AvaNeural"):
    """Generate high-quality TTS audio using edge-tts"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
        
        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        print(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate speech")

@app.get("/api/explore/preview")
async def get_explore_preview(category: str = "female"):
    """Generate preview images for explore page categories"""
    from urllib.parse import quote
    import random
    
    # Category-specific prompts
    category_prompts = {
        "female": "beautiful woman, portrait, looking at camera, photorealistic, high quality, 8k, professional photography",
        "male": "handsome man, portrait, looking at camera, photorealistic, high quality, 8k, professional photography",
        "anime_female": "beautiful anime girl, portrait, looking at camera, anime style, 2d illustration, vibrant colors, high quality",
        "anime_male": "handsome anime boy, portrait, looking at camera, anime style, 2d illustration, vibrant colors, high quality",
        "futa_realistic": "beautiful futanari girl, girl with penis, portrait, looking at camera, photorealistic, high quality, 8k, professional photography",
        "futa_anime": "beautiful futanari anime girl, girl with penis, portrait, looking at camera, anime style, 2d illustration, vibrant colors, high quality"
    }
    
    prompt = category_prompts.get(category, category_prompts["female"])
    
    try:
        # Generate image URL
        encoded_prompt = quote(prompt, safe='')
        seed = random.randint(1, 100000)
        pollinations_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&model=flux&nologo=true&enhance=true&private=true&seed={seed}&referrer=explore"
        
        # Return proxied URL
        image_url = f"/api/media/image?url={quote(pollinations_url, safe='')}"
        return {"imageUrl": image_url}
    except Exception as e:
        print(f"Preview generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate preview")

# Mount static files
app.mount("/vrm", StaticFiles(directory="vrm"), name="vrm")
app.mount("/uploaded_files", StaticFiles(directory="uploaded_files"), name="uploaded_files")
app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.get("/cur_language")
async def get_cur_language():
    return {"language": "en-US"}

@app.get("/vrm_config")
async def get_vrm_config():
    return {
        "VRMConfig": {
            "name": "default",
            "enabledExpressions": True,
            "selectedModelId": "alice",
            "defaultModels": [
                {"id": "alice", "name": "Alice", "path": "/vrm/Alice.vrm"},
                {"id": "bob", "name": "Bob", "path": "/vrm/Bob.vrm"}
            ],
            "userModels": [],
            "defaultMotions": [
                {"id": "akimbo", "name": "Akimbo", "path": "/vrm/animations/akimbo.vrma"},
                {"id": "play_fingers", "name": "Play Fingers", "path": "/vrm/animations/play_fingers.vrma"},
                {"id": "scratch_head", "name": "Scratch Head", "path": "/vrm/animations/scratch_head.vrma"},
                {"id": "stretch", "name": "Stretch", "path": "/vrm/animations/stretch.vrma"}
            ],
            "userMotions": [],
            "selectedMotionIds": ["akimbo", "play_fingers", "scratch_head", "stretch"],
            "gaussDefaultScenes": [
                {"id": "home", "name": "Home", "path": "/vrm/scene/home.spz"},
                {"id": "sea", "name": "Sea", "path": "/vrm/scene/sea.spz"},
                {"id": "space", "name": "Space", "path": "/vrm/scene/space.spz"}
            ],
            "gaussUserScenes": [],
            "selectedGaussSceneId": "home"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=3457)


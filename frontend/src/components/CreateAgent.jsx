import React, { useState } from 'react';
import { Upload, X, Sparkles, ChevronRight, ChevronLeft, Heart, Wand2 } from 'lucide-react';
import { api } from '../services/api';

const STYLES = [
    { id: 'realistic', name: 'Realistic', color: 'from-pink-500 to-rose-500', img: 'https://images.unsplash.com/photo-1620524490808-b7db0a02737c?q=80&w=200&auto=format&fit=crop' },
    { id: 'anime', name: 'Anime 2.5D', color: 'from-violet-500 to-purple-500', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop' },
    { id: 'artistic', name: 'Artistic', color: 'from-cyan-500 to-blue-500', img: 'https://images.unsplash.com/photo-1558235613-2d68962624d4?q=80&w=200&auto=format&fit=crop' },
    { id: 'fantasy', name: 'Fantasy', color: 'from-emerald-500 to-teal-500', img: 'https://images.unsplash.com/photo-1635467008775-680456108154?q=80&w=200&auto=format&fit=crop' }
];

const ETHNICITIES = [
    { id: 'white', name: 'White', img: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=200&auto=format&fit=crop' },
    { id: 'latina', name: 'Latina', img: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=200&auto=format&fit=crop' },
    { id: 'middle_eastern', name: 'Middle Eastern', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop' },
    { id: 'asian', name: 'Asian', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
    { id: 'black', name: 'Black', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=200&auto=format&fit=crop' }
];

const BODY_TYPES = [
    { id: 'petite', name: 'Petite', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&auto=format&fit=crop' },
    { id: 'slim', name: 'Slim', img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=200&auto=format&fit=crop' },
    { id: 'athletic', name: 'Athletic', img: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=200&auto=format&fit=crop' },
    { id: 'voluptuous', name: 'Voluptuous', img: 'https://images.unsplash.com/photo-1604135558066-db18742b8744?q=80&w=200&auto=format&fit=crop' },
    { id: 'curvy', name: 'Curvy', img: 'https://images.unsplash.com/photo-1628151016666-2a99d9b62615?q=80&w=200&auto=format&fit=crop' }
];

const HAIR_STYLES = [
    { id: 'straight', name: 'Straight' }, { id: 'curly', name: 'Curly' },
    { id: 'ponytail', name: 'Pony Tail' }, { id: 'braids', name: 'Braids' },
    { id: 'bun', name: 'Messy Bun' }, { id: 'pixie', name: 'Pixie' }
];

const HAIR_COLORS = ['Black', 'Blonde', 'Brown', 'Pink', 'Red'];
const EYE_COLORS = ['Brown', 'Blue', 'Green'];
const SIZES = ['Flat', 'Small', 'Medium', 'Large', 'Huge'];

// --- Wizard Constants ---

const PERSONALITIES = [
    { id: 'dominant', name: 'Dominant', icon: '👑', desc: 'Takes charge in every situation and commands respect' },
    { id: 'submissive', name: 'Submissive', icon: '🌺', desc: 'Gentle and agreeable, prefers to let others lead' },
    { id: 'seductive', name: 'Seductive', icon: '💋', desc: 'Naturally sensual and alluring with magnetic charm' },
    { id: 'flirty', name: 'Flirty', icon: '😉', desc: 'Playful and charming with a teasing personality' },
    { id: 'nurturing', name: 'Nurturing', icon: '🤱', desc: 'Caring and supportive with a natural desire to help others' },
    { id: 'innocent', name: 'Innocent', icon: '🐣', desc: 'Pure-hearted and optimistic with childlike wonder' },
    { id: 'silly', name: 'Silly', icon: '🤪', desc: 'Fun-loving and goofy with endless energy and humor' },
    { id: 'truelove', name: 'True Love', icon: '💖', desc: 'Devoted and loyal with deep capacity for genuine love' },
    { id: 'bratty', name: 'Bratty', icon: '😈', desc: 'Spoiled and demanding with a dramatic flair' },
    { id: 'stalker', name: 'Stalker', icon: '🕵️', desc: 'Obsessive and persistent with intense fixation' },
    { id: 'bimbo', name: 'Bimbo', icon: '💁‍♀️', desc: 'Bubbly and fashion-obsessed with a carefree attitude' },
    { id: 'bitch', name: 'Bitch', icon: '🔥', desc: 'Strong-willed and assertive with no tolerance for nonsense' }
];

const OCCUPATIONS = [
    "Massage Therapist", "Model", "Nurse", "Artist", "Teacher", "Spy", "Flight Attendant", "Fashion Designer",
    "Interior Decorator", "Writer", "Personal Trainer", "Bartender", "Chef", "Engineer", "Doctor", "Therapist",
    "Gynecologist", "Photographer", "Musician", "Dentist", "Veterinarian", "Pharmacist", "Lawyer",
    "Secretary", "Real Estate Agent", "Police Officer", "Event Planner", "Makeup Artist", "Florist", "Journalist",
    "Architect", "Entrepreneur", "Research Scientist"
];

const HOBBIES = [
    "Dancing", "Gardening", "Photography", "Painting", "Pilates", "Traveling", "Cooking", "Manga and Anime",
    "Singing", "DIY Crafting", "Reading", "Writing", "Hiking", "Biking", "Swimming", "Yoga", "Cosplay", "Cars",
    "Fishing", "Netflix and Chill", "Gaming", "Knitting", "Scrapbooking", "Stand-Up Comedy", "Magic",
    "Origami", "Gym", "Wine Tasting", "Brewing Beer", "Archery"
];

const RELATIONSHIPS = [
    { id: 'girlfriend', name: 'Girlfriend', icon: '💑', desc: 'Supportive and loving romantic partner' },
    { id: 'bully', name: 'Bully', icon: '👊', desc: 'Antagonistic and intimidating personality' },
    { id: 'colleague', name: 'Colleague', icon: '🏢', desc: 'Professional workplace relationship' },
    { id: 'bestfriend', name: 'Best Friend', icon: '👯‍♀️', desc: 'Close platonic friendship with deep bond' },
    { id: 'spouse', name: 'Spouse', icon: '💍', desc: 'Married partner with deep commitment' },
    { id: 'stranger', name: 'Stranger', icon: '🚶', desc: 'A mysterious person youve just met who wants to get to know you' },
    { id: 'sexfriend', name: 'Sexfriend', icon: '🔥', desc: 'A close friend with benefits who shares a passionate connection' },
    { id: 'caregiver', name: 'Caregiver', icon: '👶', desc: 'A nurturing person who takes care of you' },
    { id: 'classmate', name: 'Classmate', icon: '🎒', desc: 'A fellow student who shares your academic journey' }
];

const CreateAgent = ({ onClose, onCreate }) => {
    const [step, setStep] = useState(1);
    const [style, setStyle] = useState(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [avatar, setAvatar] = useState(null);

    // --- State ---
    // Appearance
    const [ethnicity, setEthnicity] = useState('white');
    const [age, setAge] = useState(21);
    const [bodyType, setBodyType] = useState('slim');
    const [hairStyle, setHairStyle] = useState('straight');
    const [hairColor, setHairColor] = useState('Black');
    const [eyeColor, setEyeColor] = useState('Blue');
    const [chestSize, setChestSize] = useState('Medium');
    const [buttSize, setButtSize] = useState('Medium');

    // Personality & Review
    const [personality, setPersonality] = useState(null);
    const [occupation, setOccupation] = useState(null);
    const [hobbies, setHobbies] = useState([]);
    const [relationship, setRelationship] = useState(null);

    const toggleHobby = (hobby) => {
        if (hobbies.includes(hobby)) {
            setHobbies(hobbies.filter(h => h !== hobby));
        } else {
            if (hobbies.length < 5) setHobbies([...hobbies, hobby]);
        }
    };

    const handleCreate = async () => {
        try {
            // Aggregate all rich traits
            const pObj = PERSONALITIES.find(p => p.id === personality);
            const rObj = RELATIONSHIPS.find(r => r.id === relationship);

            const allTraits = [
                ...(pObj ? [pObj.name] : []),
                ...(occupation ? [occupation] : []),
                ...hobbies,
                ...(rObj ? [rObj.name] : []),
                `${age} years old`,
                ethnicity,
                bodyType
            ];

            const data = await api.createAgent({
                name,
                description: desc,
                style,
                traits: allTraits, // Sends rich traits list for backend personality generation
                tags: allTraits // Fallback
            });
            console.log("Agent created:", data);
            onCreate({ ...data, avatar });
            onClose();
        } catch (e) {
            console.error("Error creating agent", e);
            onCreate({ name, desc, style, traits: [], avatar });
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f12]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-[90vh] bg-[#1a1a1f] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden">

                {/* Left Panel - Wizard */}
                <div className="w-2/3 flex flex-col border-r border-white/5 relative">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-violet-500/5 to-transparent">
                        <div>
                            <div className="flex items-center space-x-2 text-violet-400 mb-1">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold tracking-wider uppercase">Luvr Studio</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Create Companion</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-10 py-6 border-b border-white/5">
                        <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]' : 'bg-white/10'}`} />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            <span>Style</span>
                            <span>Looks</span>
                            <span>Persona</span>
                            <span>Identity</span>
                            <span>Relation</span>
                            <span>Finish</span>
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
                        {/* Step 1: Style */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <h3 className="text-xl font-semibold text-white">Choose an Archetype</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {STYLES.map(s => (
                                        <div key={s.id} onClick={() => setStyle(s.id)} className={`relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${style === s.id ? 'border-violet-500 scale-105 shadow-xl shadow-violet-500/20' : 'border-transparent hover:border-white/20'}`}>
                                            <div className="aspect-[3/4] bg-gray-800"><img src={s.img} alt={s.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent"><span className="font-bold text-white">{s.name}</span></div>
                                            {style === s.id && <div className="absolute top-3 right-3 bg-violet-600 rounded-full p-1"><Heart size={14} className="text-white fill-current" /></div>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Appearance */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div><h3 className="text-lg font-semibold text-white mb-4">Select Ethnicity</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{ETHNICITIES.map(item => (
                                        <div key={item.id} onClick={() => setEthnicity(item.id)} className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${ethnicity === item.id ? 'border-violet-500 shadow-md ring-1 ring-violet-500' : 'border-transparent hover:border-white/20'}`}>
                                            <div className="aspect-[3/4] bg-gray-800"><img src={item.img} alt={item.name} className="w-full h-full object-cover" /></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-center"><span className="text-xs font-bold text-white">{item.name}</span></div>
                                        </div>
                                    ))}</div></div>

                                <div><div className="flex justify-between mb-2"><h3 className="text-lg font-semibold text-white">Age</h3><span className="text-2xl font-bold text-violet-400">{age}</span></div>
                                    <input type="range" min="18" max="60" value={age} onChange={(e) => setAge(e.target.value)} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500" /></div>

                                <div><h3 className="text-lg font-semibold text-white mb-4">Body Type</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{BODY_TYPES.map(item => (
                                        <div key={item.id} onClick={() => setBodyType(item.id)} className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${bodyType === item.id ? 'border-violet-500 shadow-md' : 'border-transparent hover:border-white/20'}`}>
                                            <div className="aspect-[3/4] bg-gray-800"><img src={item.img} alt={item.name} className="w-full h-full object-cover" /></div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 text-center"><span className="text-xs font-bold text-white">{item.name}</span></div>
                                        </div>
                                    ))}</div></div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div><h3 className="text-lg font-semibold text-white mb-4">Hair</h3>
                                        <div className="flex flex-wrap gap-2 mb-4">{HAIR_COLORS.map(c => (<button key={c} onClick={() => setHairColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${hairColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c.toLowerCase() === 'blonde' ? '#F3E5AB' : c.toLowerCase() }} />))}</div>
                                        <div className="grid grid-cols-3 gap-2">{HAIR_STYLES.map(h => (<button key={h.id} onClick={() => setHairStyle(h.id)} className={`px-2 py-2 rounded-lg text-[10px] font-medium border transition-all ${hairStyle === h.id ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}`}>{h.name}</button>))}</div></div>
                                    <div><h3 className="text-lg font-semibold text-white mb-4">Eyes</h3>
                                        <div className="grid grid-cols-3 gap-2">{EYE_COLORS.map(c => (<div key={c} onClick={() => setEyeColor(c)} className={`h-10 rounded-lg cursor-pointer border-2 transition-all ${eyeColor === c ? 'border-white' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c.toLowerCase() }} />))}</div></div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    {['Chest', 'Butt'].map(part => (
                                        <div key={part}>
                                            <h3 className="text-lg font-semibold text-white mb-4">{part} Size</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {SIZES.map(s => (
                                                    <button key={s} onClick={() => part === 'Chest' ? setChestSize(s) : setButtSize(s)} className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${((part === 'Chest' ? chestSize : buttSize) === s) ? 'bg-fuchsia-600/30 border-fuchsia-500 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Personality */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                                <h3 className="text-xl font-semibold text-white">Select Persona</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {PERSONALITIES.map(p => (
                                        <div key={p.id} onClick={() => setPersonality(p.id)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-white/5 ${personality === p.id ? 'bg-violet-600/10 border-violet-500' : 'border-white/5 bg-white/5'}`}>
                                            <div className="text-3xl mb-3">{p.icon}</div>
                                            <div className="font-bold text-white mb-1">{p.name}</div>
                                            <div className="text-[10px] text-gray-400 leading-tight">{p.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 4: Identity */}
                        {step === 4 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Select Occupation</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {OCCUPATIONS.map(occ => (
                                            <button key={occ} onClick={() => setOccupation(occ)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${occupation === occ ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                                {occ}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-4">Select Hobbies ({hobbies.length}/5)</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {HOBBIES.map(hobby => (
                                            <button key={hobby} onClick={() => toggleHobby(hobby)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${hobbies.includes(hobby) ? 'bg-violet-600 text-white border-violet-500' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                                                {hobby}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Relationship */}
                        {step === 5 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                                <h3 className="text-xl font-semibold text-white">Select Relationship</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {RELATIONSHIPS.map(rel => (
                                        <div key={rel.id} onClick={() => setRelationship(rel.id)} className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:bg-white/5 flex flex-col items-center text-center ${relationship === rel.id ? 'bg-pink-600/10 border-pink-500 shadow-lg shadow-pink-500/10' : 'border-white/5 bg-white/5'}`}>
                                            <div className="text-4xl mb-4">{rel.icon}</div>
                                            <div className="font-bold text-white text-lg mb-2">{rel.name}</div>
                                            <div className="text-xs text-gray-400">{rel.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 6: Finalize */}
                        {step === 6 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div className="flex items-start space-x-6">
                                    <div className="w-40 space-y-3">
                                        <div className="w-40 h-56 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                            {avatar ? (<img src={typeof avatar === 'string' ? avatar : URL.createObjectURL(avatar)} className="w-full h-full object-cover" />) : (<div className="text-center p-4"><div className="mb-2 text-4xl">📸</div><div className="text-xs text-gray-500">Wait for Gen</div></div>)}
                                        </div>
                                        <button onClick={async () => {
                                            try {
                                                const pObj = PERSONALITIES.find(p => p.id === personality);
                                                const rObj = RELATIONSHIPS.find(r => r.id === relationship);
                                                // Detailed prompt
                                                const prompt = `Best quality, masterpiece, ultra high res, ${style} portrait of a ${age} year old ${ethnicity} woman, ${occupation}, ${bodyType} body, ${chestSize} chest, ${buttSize} butt, ${hairColor} ${hairStyle} hair, ${eyeColor} eyes, wearing appropriate clothing for ${occupation}, looking at viewer, ${pObj?.name || 'neutral'} expression, derived from ${rObj?.name || 'unknown'} relationship, detailed background`;

                                                const result = await api.generateImage(prompt, style === 'anime' ? 'wan' : 'ddpm');
                                                setAvatar(result.image);
                                            } catch (e) { console.error(e); }
                                        }} className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg flex items-center justify-center space-x-2"><Wand2 size={16} /><span>Generate Photo</span></button>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none" placeholder="Name your companion..." /></div>
                                        <div className="space-y-2"><label className="text-sm font-medium text-gray-300">Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-violet-500/50 outline-none resize-none" placeholder="Describe them..." /></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-8 border-t border-white/5 flex justify-between items-center bg-[#15151a]">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-xl text-gray-400 hover:text-white flex items-center space-x-2 hover:bg-white/5 transition-colors">
                                <ChevronLeft size={18} />
                                <span>Back</span>
                            </button>
                        ) : <div />}

                        {step < 6 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={(step === 1 && !style) || (step === 3 && !personality) || (step === 4 && !occupation) || (step === 5 && !relationship)}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${(step === 1 && !style) || (step === 3 && !personality) || (step === 4 && !occupation) || (step === 5 && !relationship) ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:scale-105'}`}
                            >
                                <span>Next Step</span>
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreate}
                                disabled={!name}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all shadow-lg ${name ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:shadow-violet-500/40 hover:-translate-y-1' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
                            >
                                <Sparkles size={18} />
                                <span>Create Companion</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Right Panel - Live Preview */}
                <div className="w-1/3 bg-black/40 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 z-10" />
                    {/* Background Image based on Style */}
                    <img
                        src={style ? STYLES.find(s => s.id === style).img : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm transition-all duration-700"
                    />

                    <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 space-y-4">
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="px-2 py-1 rounded bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                    {style ? STYLES.find(s => s.id === style).name : 'Preview'}
                                </span>
                                {occupation && (
                                    <span className="px-2 py-1 rounded bg-violet-600/30 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-violet-200 border border-violet-500/20">
                                        {occupation}
                                    </span>
                                )}
                                {personality && (
                                    <span className="px-2 py-1 rounded bg-pink-600/30 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-pink-200 border border-pink-500/20">
                                        {PERSONALITIES.find(p => p.id === personality)?.name}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl font-bold text-white leading-tight">
                                {name || "Your Companion"}
                            </h1>
                            <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
                                {desc || "Select options to see your companion come to life..."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                                    AI
                                </div>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/30" style={{ width: `${(step / 6) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreateAgent;

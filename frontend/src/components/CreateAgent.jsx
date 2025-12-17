import React, { useState } from 'react';
import { Upload, X, Mic, Sparkles, ChevronRight, ChevronLeft, Heart, Wand2 } from 'lucide-react';
import { api } from '../services/api';

const STYLES = [
    { id: 'realistic', name: 'Realistic', color: 'from-pink-500 to-rose-500', img: 'https://images.unsplash.com/photo-1620524490808-b7db0a02737c?q=80&w=200&auto=format&fit=crop' },
    { id: 'anime', name: 'Anime 2.5D', color: 'from-violet-500 to-purple-500', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=200&auto=format&fit=crop' },
    { id: 'artistic', name: 'Artistic', color: 'from-cyan-500 to-blue-500', img: 'https://images.unsplash.com/photo-1558235613-2d68962624d4?q=80&w=200&auto=format&fit=crop' },
    { id: 'fantasy', name: 'Fantasy', color: 'from-emerald-500 to-teal-500', img: 'https://images.unsplash.com/photo-1635467008775-680456108154?q=80&w=200&auto=format&fit=crop' }
];

const TAGS = [
    "Romance", "Roleplay", "Dominant", "Submissive", "Outgoing", "Softspoken",
    "Funny", "Intelligent", "Yandere", "Tsundere", "Shy", "Energetic",
    "Goth", "Nerd", "Office Lady", "Teacher", "Nurse", "Maid"
];

const CreateAgent = ({ onClose, onCreate }) => {
    const [step, setStep] = useState(1);
    const [style, setStyle] = useState(null);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [avatar, setAvatar] = useState(null);

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 5) setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleCreate = async () => {
        try {
            const data = await api.createAgent({ name, description: desc, style, tags: selectedTags });
            console.log("Agent created:", data);
            onCreate({ ...data, avatar });
            onClose();
        } catch (e) {
            console.error("Error creating agent", e);
            onCreate({ name, desc, style, tags: selectedTags, avatar });
            onClose();
        }
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f12]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-[90vh] bg-[#1a1a1f] border border-white/10 rounded-3xl shadow-2xl flex overflow-hidden">

                {/* Left Panel - Builder Controls */}
                <div className="w-2/3 flex flex-col border-r border-white/5 relative">
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-violet-500/5 to-transparent">
                        <div>
                            <div className="flex items-center space-x-2 text-violet-400 mb-1">
                                <Sparkles size={16} />
                                <span className="text-xs font-bold tracking-wider uppercase">Character Studio</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Build Your AI Partner</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Choose an Archetype</h3>
                                    <p className="text-gray-400">Select the visual style for your companion.</p>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {STYLES.map(s => (
                                        <div
                                            key={s.id}
                                            onClick={() => setStyle(s.id)}
                                            className={`
                                                relative group cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300
                                                ${style === s.id ? 'border-violet-500 scale-105 shadow-xl shadow-violet-500/20' : 'border-transparent hover:border-white/20'}
                                            `}
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-t ${s.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                                            <div className="aspect-[3/4] bg-gray-800">
                                                <img src={s.img} alt={s.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="font-bold text-white">{s.name}</span>
                                            </div>
                                            {style === s.id && (
                                                <div className="absolute top-3 right-3 bg-violet-600 rounded-full p-1">
                                                    <Heart size={14} className="text-white fill-current" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right-8 fade-in duration-300">
                                <div className="flex items-start space-x-6">
                                    <div className="w-32">
                                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center cursor-pointer hover:border-violet-500/50 transition-all group relative overflow-hidden">
                                            {avatar ? (
                                                <img
                                                    src={typeof avatar === 'string' ? avatar : URL.createObjectURL(avatar)}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Upload size={32} className="text-gray-500 group-hover:text-white transition-colors" />
                                            )}
                                            <input type="file" className="hidden" onChange={(e) => setAvatar(e.target.files[0])} accept="image/*" />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const result = await api.generateImage('', 'ddpm');
                                                    setAvatar(result.image); // base64 data URL
                                                } catch (e) {
                                                    console.error('Image gen failed:', e);
                                                    // Fallback to local assets
                                                    const styles = ["/assets/Avatar.png", "/assets/cover.png"];
                                                    setAvatar(styles[Math.floor(Math.random() * styles.length)]);
                                                }
                                            }}
                                            className="mt-2 w-full py-1.5 text-xs text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/10 flex items-center justify-center space-x-1"
                                        >
                                            <Wand2 size={12} />
                                            <span>Generate</span>
                                        </button>
                                    </div>
                                    <div className="flex-1 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Name</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-all"
                                                placeholder="Give them a name..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Persona</label>
                                            <textarea
                                                value={desc}
                                                onChange={(e) => setDesc(e.target.value)}
                                                rows={3}
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                                                placeholder="Who are they? What do they like?"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 block">Personality Traits ({selectedTags.length}/5)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`
                                                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                                    ${selectedTags.includes(tag)
                                                        ? 'bg-violet-600/20 border-violet-500 text-violet-200 shadow-lg shadow-violet-500/10'
                                                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'}
                                                `}
                                            >
                                                {tag}
                                            </button>
                                        ))}
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

                        {step < 2 ? (
                            <button
                                onClick={() => style && setStep(2)}
                                disabled={!style}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all ${style ? 'bg-white text-black hover:scale-105' : 'bg-white/10 text-gray-500 cursor-not-allowed'}`}
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
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 rounded bg-white/20 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                                    {style ? STYLES.find(s => s.id === style).name : 'Preview'}
                                </span>
                                {selectedTags.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded bg-violet-600/30 backdrop-blur text-[10px] font-bold uppercase tracking-widest text-violet-200 border border-violet-500/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-4xl font-bold text-white leading-tight">
                                {name || "Your Companion"}
                            </h1>
                            <p className="text-gray-300 line-clamp-3 text-sm leading-relaxed">
                                {desc || "Select a style and personality to see your companion come to life..."}
                            </p>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-xs font-bold text-white">
                                    AI
                                </div>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white/30 w-2/3" />
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

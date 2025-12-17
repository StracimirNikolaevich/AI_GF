import React from 'react';
import { X, Heart, MessageSquare, Zap } from 'lucide-react';

const MOCK_AGENTS = [
    { id: 1, name: "Seraphina", tag: "Fantasy", desc: "A mystic elf healer who loves nature.", img: "/assets/Avatar.png" },
    { id: 2, name: "Aiko", tag: "Anime", desc: "Your energetic childhood friend.", img: "/assets/cover.png" },
    { id: 3, name: "Marcus", tag: "Realistic", desc: "A stoic philosopher and coffee lover.", img: "/assets/Avatar.png" },
    { id: 4, name: "Luna", tag: "Artistic", desc: "A creative spirit living in a digital dream.", img: "/assets/cover.png" },
    { id: 5, name: "Blade", tag: "Cyberpunk", desc: "Neon-soaked runner from the future.", img: "/assets/Avatar.png" },
    { id: 6, name: "Isabella", tag: "Romance", desc: "Looking for a true connection.", img: "/assets/cover.png" }
];

const Explore = ({ onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f12]/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-[90vh] bg-[#1a1a1f] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-violet-500/5 to-transparent">
                    <div>
                        <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                            <Zap size={16} />
                            <span className="text-xs font-bold tracking-wider uppercase">Discover</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white">Explore Agents</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_AGENTS.map(agent => (
                            <div key={agent.id} className="group relative bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all hover:-translate-y-1">
                                <div className="aspect-video relative">
                                    <img src={agent.img} alt={agent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1f] to-transparent opacity-80" />
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur rounded-full px-2 py-1 text-[10px] font-bold uppercase text-white border border-white/10">
                                        {agent.tag}
                                    </div>
                                </div>
                                <div className="p-5 relative">
                                    <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{agent.desc}</p>

                                    <div className="flex items-center justify-between">
                                        <button className="flex items-center space-x-2 text-xs font-bold text-violet-300 hover:text-white transition-colors">
                                            <MessageSquare size={14} />
                                            <span>Chat Now</span>
                                        </button>
                                        <button className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-pink-500 transition-colors">
                                            <Heart size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;

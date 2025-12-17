import React, { useState } from 'react';
import { X, Heart, MessageSquare, Zap, Search, Plus, User, Wand2 } from 'lucide-react';

const MOCK_AGENTS = [
    { id: 1, name: "Abigail Smith", tag: "Realistic", desc: "Abigail is a free-spirited and easy-going soul.", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400" },
    { id: 2, name: "Adalinda Chumana", tag: "Fantasy", desc: "Yesterday she was merely a baby red dragon...", img: "https://images.unsplash.com/photo-1635467008775-680456108154?q=80&w=400" },
    { id: 3, name: "Adrian Chen", tag: "Realistic", desc: "Adrian Chen is an awkwardly charming coder.", img: "https://images.unsplash.com/photo-1542327666-4191316b206f?q=80&w=400" },
    { id: 4, name: "Aera Myung", tag: "Anime", desc: "Aera Myung is the most popular girl in class.", img: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400" },
    { id: 5, name: "Seraphina", tag: "Fantasy", desc: "A mystic elf healer who loves nature.", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400" },
    { id: 6, name: "Luna", tag: "Artistic", desc: "A creative spirit living in a digital dream.", img: "https://images.unsplash.com/photo-1558235613-2d68962624d4?q=80&w=400" }
];

const Explore = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('Anime');

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f0f12] overflow-hidden">
            <div className="flex-1 h-full flex flex-col relative overflow-hidden">

                {/* Close Button (Overlay) */}
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20">
                    <X size={20} />
                </button>

                {/* Top Nav */}
                <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0f0f12]">
                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full bg-[#1a1a1f] border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 bg-[#1a1a1f] border border-white/5 rounded-full px-3 py-1.5">
                            <div className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">C</div>
                            <span className="text-sm font-bold text-white">0</span>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5">
                            <Plus size={16} />
                            <span className="text-sm font-medium">Create</span>
                        </button>
                        <button className="px-6 py-2 rounded-lg bg-[#f04f43] hover:bg-[#d03f33] text-white text-sm font-bold">
                            Sign Up
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Banner */}
                    <div className="relative h-64 w-full bg-[#1a1a1f] overflow-hidden group items-center justify-center flex">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20" />

                        {/* Mock Banner Image/Content */}
                        <div className="relative z-10 text-center">
                            <h1 className="text-6xl font-black text-white mb-2 drop-shadow-lg tracking-tighter">GENERATOR</h1>
                            <button className="mt-4 px-12 py-3 bg-[#6d28d9] hover:bg-[#5b21b6] text-white font-bold rounded-lg transform hover:scale-105 transition-all flex items-center space-x-2 mx-auto shadow-xl shadow-violet-900/50">
                                <Wand2 size={20} />
                                <span>TRY NOW</span>
                            </button>
                        </div>

                        {/* Decor Image Left */}
                        <div className="absolute left-0 bottom-0 h-full w-1/3 opacity-50">
                            <img src="https://images.unsplash.com/photo-1620524490808-b7db0a02737c?q=80&w=400" className="w-full h-full object-cover mask-gradient-right" />
                        </div>
                        {/* Decor Image Right */}
                        <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-50">
                            <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=400" className="w-full h-full object-cover mask-gradient-left" />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-8 mt-6 mb-4">
                        <div className="flex space-x-8 border-b border-white/10">
                            {['Girls', 'Anime', 'Guys'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-medium transition-all ${activeTab === tab ? 'text-[#f04f43] border-b-2 border-[#f04f43]' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="p-8 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {MOCK_AGENTS.map(agent => (
                                <div key={agent.id} className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer">
                                    <img src={agent.img} alt={agent.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                                    {/* Coin Badge */}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur rounded-full w-8 h-8 flex items-center justify-center border border-[#f04f43]">
                                        <span className="text-white text-xs font-bold">50</span>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f04f43] rounded-full" />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{agent.name}</h3>
                                        <p className="text-xs text-gray-300 line-clamp-2">{agent.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Explore;

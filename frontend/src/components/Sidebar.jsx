import React from 'react';
import {
    Users, MessageSquare, Plus, Zap, Heart, Search,
    Globe, Shield, HelpCircle, User, Bot, Menu, Sparkles,
    Flame, Crown, Swords, Clock, Wand2, ScrollText
} from 'lucide-react';

const MENU_ITEMS = [
    { id: 'explore', icon: Globe, label: 'Explore', active: true },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'create_char', icon: Wand2, label: 'Create Character', action: true },
    { id: 'create_scenario', icon: ScrollText, label: 'Create Scenario' },
    { id: 'my_ai', icon: Bot, label: 'My AI' },
    { id: 'daily', icon: Clock, label: 'Daily Challenges', badge: '23h 55m' },
];

const EXPLORE_FILTERS = [
    { icon: '👩', label: 'Female' },
    { icon: '👱‍♂️', label: 'Male' },
    { icon: '🎨', label: 'Realistic' },
    { icon: '🫦', label: 'Busty' },
    { icon: '🎌', label: 'Anime' },
    { icon: '🔞', label: '22-30' },
    { icon: '👑', label: 'Dominant' },
    { icon: '🗣️', label: 'Outgoing' },
    { icon: '🐣', label: '18-21' },
    { icon: '💘', label: 'Romance' },
    { icon: '🎭', label: 'Roleplay' },
    { icon: '🥺', label: 'Submissive' },
];

const Sidebar = ({ isOpen, toggleSidebar, onOpenCreator, onOpenSettings, onOpenExplore }) => {
    return (
        <div className={`
      fixed inset-y-0 left-0 z-50 
      ${isOpen ? 'w-64' : 'w-0'} 
      transition-all duration-300 ease-in-out
      bg-[#0f0f12] border-r border-[#ffffff10]
      flex flex-col
      overflow-hidden font-sans
    `}>
            {/* Header */}
            <div className="h-20 flex items-center px-6">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <MessageSquare className="text-white fill-white" size={28} />
                        <Heart size={14} className="absolute -top-1 -right-1 text-red-500 fill-red-500" />
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter">LUVR</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                <div className="space-y-1 mb-8">
                    {MENU_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.id === 'create_char') onOpenCreator();
                                else if (item.id === 'explore') onOpenExplore();
                            }}
                            className={`
                                w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${item.active ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">{item.badge}</span>
                            )}
                        </button>
                    ))}

                    {/* Premium Button */}
                    <button className="w-full mt-4 flex items-center space-x-2 px-3 py-2.5 rounded-lg bg-[#2a2a1f] text-[#ffd700] border border-[#ffd700]/20 hover:bg-[#3a3a2f] transition-all">
                        <Flame size={16} className="fill-current" />
                        <span className="font-bold text-sm">Premium</span>
                    </button>
                </div>

                {/* Explore Filters */}
                <div className="mb-6">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Explore</span>
                        <Search size={12} className="text-gray-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {EXPLORE_FILTERS.map(filter => (
                            <button key={filter.label} className="flex items-center space-x-2 px-2 py-2 rounded text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-left">
                                <span>{filter.icon}</span>
                                <span>{filter.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Links */}
                <div className="space-y-1 pt-4 border-t border-white/5">
                    <button className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-white w-full">
                        <Globe size={14} />
                        <span>Discord</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-white w-full">
                        <HelpCircle size={14} />
                        <span>Contact Us</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-white w-full">
                        <Users size={14} />
                        <span>Affiliate</span>
                    </button>
                    <button className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-white w-full">
                        <Shield size={14} />
                        <span>Legal</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

import React from 'react';
import { Settings, Users, MessageSquare, Plus, Zap } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, onOpenCreator, onOpenSettings, onOpenExplore }) => {
    return (
        <div className={`
      fixed inset-y-0 left-0 z-50 
      ${isOpen ? 'w-72' : 'w-0'} 
      transition-all duration-300 ease-in-out
      bg-[#1a1a1f]/90 backdrop-blur-xl border-r border-[#ffffff15]
      flex flex-col
      overflow-hidden
    `}>
            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <h2 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 truncate flex items-center gap-2">
                    <img src="/assets/logo.png" alt="Luvr" className="w-8 h-8 rounded-full" />
                    Luvr
                </h2>
                <div className="px-2 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                    Beta
                </div>
            </div>

            {/* Create New Action */}
            <div className="px-4 mb-6">
                <button
                    onClick={onOpenCreator}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                >
                    <Plus size={18} />
                    <span>New Chat</span>
                </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 pl-2">Menu</div>

                <button className="flex items-center space-x-3 w-full p-3 rounded-xl bg-white/5 border border-white/5 text-white shadow-sm">
                    <MessageSquare size={18} className="text-violet-400" />
                    <span className="truncate font-medium">Messages</span>
                </button>

                <button
                    onClick={onOpenCreator}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
                >
                    <Users size={18} className="group-hover:text-fuchsia-400 transition-colors" />
                    <span className="truncate">My Agents</span>
                </button>

                <button
                    onClick={onOpenExplore}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
                >
                    <Zap size={18} className="group-hover:text-yellow-400 transition-colors" />
                    <span className="truncate">Explore</span>
                </button>

                <button
                    onClick={onOpenSettings}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group"
                >
                    <Settings size={18} className="group-hover:text-cyan-400 transition-colors" />
                    <span className="truncate">Settings</span>
                </button>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10 mx-4 mb-4 mt-2">
                <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white">U</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">User</p>
                        <p className="text-xs text-violet-300 truncate">Pro Plan</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

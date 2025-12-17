import React, { useState } from 'react';
import { X, Save, Moon, Sun, Volume2, Key } from 'lucide-react';

const Settings = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [voiceVol, setVoiceVol] = useState(80);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold text-white">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Appearance */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Appearance</label>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center space-x-3 text-white">
                                <Moon size={18} />
                                <span className="text-sm font-medium">Dark Mode</span>
                            </div>
                            <div className="w-10 h-6 rounded-full bg-violet-600 relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Audio */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audio</label>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center space-x-3">
                                    <Volume2 size={18} />
                                    <span className="text-sm font-medium">Master Volume</span>
                                </div>
                                <span className="text-xs text-gray-400">{voiceVol}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={voiceVol}
                                onChange={(e) => setVoiceVol(e.target.value)}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                            />
                        </div>
                    </div>

                    {/* API */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">System</label>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-sm text-gray-300">
                                <Key size={16} />
                                <span>OpenAI / Router Key</span>
                            </div>
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                        <Save size={16} />
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;

import React, { useState } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import CreateAgent from './components/CreateAgent';
import Settings from './components/Settings';
import Explore from './components/Explore';
import { Menu } from 'lucide-react';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showCreator, setShowCreator] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showExplore, setShowExplore] = useState(false);

    return (
        <div className="flex h-screen bg-[#0f0f12] text-white overflow-hidden relative selection:bg-violet-500/30">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none" />

            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onOpenCreator={() => setShowCreator(true)}
                onOpenSettings={() => setShowSettings(true)}
                onOpenExplore={() => setShowExplore(true)}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'} relative z-10`}>
                <header className="h-16 flex items-center px-6 absolute top-0 left-0 right-0 z-20 pointer-events-none">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="pointer-events-auto p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                    >
                        <Menu size={20} />
                    </button>
                </header>
                <main className="flex-1 relative">
                    <Chat />
                </main>
            </div>

            {/* Modals */}
            {showCreator && (
                <CreateAgent
                    onClose={() => setShowCreator(false)}
                    onCreate={(data) => {
                        console.log("Created agent:", data);
                        setShowCreator(false);
                    }}
                />
            )}

            {showSettings && (
                <Settings onClose={() => setShowSettings(false)} />
            )}

            {showExplore && (
                <Explore onClose={() => setShowExplore(false)} />
            )}
        </div>
    );
}

export default App;

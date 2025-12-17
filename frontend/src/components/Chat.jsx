import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Sparkles, Image as ImageIcon, Mic, X } from 'lucide-react';
import { api } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);
    const audioRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [settings, setSettings] = useState({});
    const [enableAudio, setEnableAudio] = useState(true);

    useEffect(() => {
        // WebSocket logic remains same
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws`);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
            socket.send(JSON.stringify({ type: 'get_settings' }));
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'settings') {
                    setSettings(data.data);
                }
            } catch (e) { console.error(e); }
        };

        setWs(socket);
        // Add welcome message for demo
        setMessages([{
            role: 'assistant',
            content: "Hello! I'm your AI companion. How can I brighten your day?"
        }]);

        return () => { socket.close(); };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    const [selectedFile, setSelectedFile] = useState(null);

    // ... (useEffect remains)

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || isTyping) return;

        let content = input;
        // If there's a file, we might want to upload it first or send it as base64
        // For this cycle, let's append a notification about the file to the prompt
        if (selectedFile) {
            content += `\n[Attached File: ${selectedFile.name}]`;
        }

        const userMsg = { role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setSelectedFile(null); // Clear file after send
        setIsTyping(true);

        const newMessages = [...messages, userMsg];

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            await api.chat(newMessages, settings.mainAgent, (chunk) => {
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last.role === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
                    }
                    return prev;
                });
            });
        } catch (error) {
            setMessages(prev => {
                const last = prev[prev.length - 1];
                return [...prev.slice(0, -1), { ...last, content: "I'm having trouble connecting to my brain right now. Is the backend running?" }];
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <div className="flex flex-col h-full relative">
            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pt-20 pb-32">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`
                            max-w-2xl px-6 py-4 rounded-3xl shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none'
                                : 'bg-[#1a1a1f] border border-white/5 text-gray-100 rounded-bl-none shadow-lg'}
                        `}>
                            <ReactMarkdown
                                components={{
                                    code({ node, inline, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={materialDark}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        )
                                    }
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-center space-x-2 text-violet-400 text-sm ml-4 animate-pulse">
                        <Sparkles size={16} />
                        <span>Agent is thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Floating Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0f12] via-[#0f0f12] to-transparent">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#1a1a1f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl flex items-end gap-2 ring-1 ring-white/5 focus-within:ring-violet-500/50 transition-all">
                        <button
                            className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            onClick={() => document.getElementById('file-upload').click()}
                        >
                            <Upload size={20} />
                        </button>
                        <input type="file" id="file-upload" className="hidden" onChange={handleFileSelect} />

                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            disabled={isTyping}
                            className="flex-1 bg-transparent text-white placeholder-gray-500 py-3 px-2 focus:outline-none resize-none max-h-32 min-h-[48px]"
                            rows={1}
                        />

                        {selectedFile && (
                            <div className="absolute bottom-full mb-4 left-4 bg-[#1a1a1f] border border-white/10 rounded-xl p-3 flex items-center space-x-3 shadow-xl animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-2 bg-violet-500/20 rounded-lg">
                                    <ImageIcon size={16} className="text-violet-400" />
                                </div>
                                <div className="max-w-[150px]">
                                    <p className="text-xs font-medium text-white truncate">{selectedFile.name}</p>
                                    <p className="text-[10px] text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={14} className="text-gray-400" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-1">
                            <button
                                className={`p-3 rounded-xl transition-colors ${enableAudio ? 'text-violet-400 bg-violet-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                onClick={() => setEnableAudio(!enableAudio)}
                            >
                                <Mic size={20} />
                            </button>
                            <button
                                onClick={sendMessage}
                                disabled={isTyping}
                                className={`
                                    p-3 rounded-xl transition-all duration-300
                                    ${input.trim()
                                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                                        : 'bg-white/10 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                <Send size={20} className={input.trim() ? 'fill-current' : ''} />
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-3 text-xs text-gray-600">
                        AI can make mistakes. Please verify important information.
                    </div>
                </div>
            </div>
            {/* Audio Player */}
            <audio ref={audioRef} className="hidden" />
        </div>
    );
};

export default Chat;

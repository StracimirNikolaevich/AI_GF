const API_BASE = '/v1';

export const api = {
    // Chat Completions
    chat: async (messages, model, onChunk) => {
        try {
            const response = await fetch(`${API_BASE}/chat/completions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages,
                    stream: true,
                    model: model || 'gpt-3.5-turbo',
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6).trim();
                        if (jsonStr === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) onChunk(content);
                        } catch (e) { console.error('Error parsing chunk', e); }
                    }
                }
            }
        } catch (error) {
            console.error('API Chat Error:', error);
            throw error;
        }
    },

    // Agent Management
    createAgent: async (agentData) => {
        const response = await fetch(`${API_BASE}/agent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agentData),
        });
        if (!response.ok) throw new Error('Failed to create agent');
        return await response.json();
    },

    getAgents: async () => {
        const response = await fetch(`${API_BASE}/agents`);
        if (!response.ok) return []; // Fallback empty
        return await response.json();
    }
};

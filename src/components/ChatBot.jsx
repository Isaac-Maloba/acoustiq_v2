import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../utils/api';
import '../css/ChatBot.css';

const INITIAL_MESSAGE = {
    role: 'assistant',
    content: "Hey! 👋 Welcome to Acoustiq. Ask me anything about our instruments, M-Pesa checkout, or your orders."
};

const QUICK_CHIPS = [
    "What instruments do you sell?",
    "How does M-Pesa checkout work?",
    "Can I sell my own gear?",
    "Do you deliver upcountry?"
];

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chipsVisible, setChipsVisible] = useState(true);
    const bottomRef = useRef();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const send = async (text) => {
        const content = text || input.trim();
        if (!content) return;

        setInput('');
        setChipsVisible(false);
        setLoading(true);

        const userMessage = { role: 'user', content };
        const updated = [...messages, userMessage];
        setMessages(updated);

        const data = await sendChatMessage(updated);
        const reply = data.reply || "Sorry, I couldn't get a response. Please try again.";

        setMessages([...updated, { role: 'assistant', content: reply }]);
        setLoading(false);
    };

    return (
        <>
            {/* Floating button */}
            <button className="chat-fab" onClick={() => setOpen(o => !o)}>
                {open ? '✕' : '💬'}
            </button>

            {open && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-avatar">AS</div>
                        <div className="chat-header-info">
                            <span className="chat-header-name">Acoustiq Assistant</span>
                            <span className="chat-header-sub">Powered by Groq</span>
                        </div>
                        <div className="chat-online-dot" />
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-bubble ${m.role}`}>
                                {m.content}
                            </div>
                        ))}

                        {/* Quick chips — only shown at start */}
                        {chipsVisible && (
                            <div className="chat-chips">
                                {QUICK_CHIPS.map((chip, i) => (
                                    <button key={i} className="chat-chip" onClick={() => send(chip)}>
                                        {chip}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="chat-bubble assistant typing">
                                <span /><span /><span />
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input row */}
                    <div className="chat-input-row">
                        <input
                            className="chat-input"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && send()}
                            placeholder="Ask about instruments, payments…"
                            disabled={loading}
                        />
                        <button className="chat-send" onClick={() => send()} disabled={loading}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
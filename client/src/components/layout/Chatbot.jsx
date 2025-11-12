import React, { useState } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hi there! How can I help you with your style today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { from: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // TODO: Replace with an actual API call to your backend chat endpoint
        // Your backend will then call the Gemini API.
        // For now, we simulate a response.
        setTimeout(() => {
            const botResponse = { from: 'bot', text: `I received your message: "${inputValue}". I am still in training, but soon I'll be able to give you great fashion advice!` };
            setMessages(prev => [...prev, botResponse]);
            setIsLoading(false);
        }, 1500);
    };

    if (!isOpen) {
        return (
            <button
                onClick={toggleChat}
                className="fixed bottom-5 right-5 bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-transform hover:scale-110"
                aria-label="Open chatbot"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        );
    }

    return (
        <div className="fixed bottom-5 right-5 w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50">
            {/* Header */}
            <div className="bg-indigo-600 text-white p-3 flex justify-between items-center rounded-t-lg">
                <h3 className="font-semibold">Aether Stylist</h3>
                <button onClick={toggleChat} className="text-white hover:text-gray-200">&times;</button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`mb-3 flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`rounded-lg px-3 py-2 ${msg.from === 'bot' ? 'bg-gray-200 text-gray-800' : 'bg-indigo-500 text-white'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="rounded-lg px-3 py-2 bg-gray-200 text-gray-500">...</div></div>}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-2 border-t">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a style question..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </form>
        </div>
    );
};

export default Chatbot;


import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Mic, MicOff, X, Minimize2, User, Bot, Volume2, VolumeX } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your Hotel Assistant. How can I help you manage your dashboard today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const scrollRef = useRef(null);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const toggleListening = () => {
    if (!recognition) return alert('Voice recognition not supported in this browser.');
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        handleSend(transcript);
      };
      recognition.onerror = () => setIsListening(false);
    }
  };

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simulate AI response logic
    setTimeout(() => {
      let response = "I'm still learning about the hotel's data, but I can help you navigate to the Booking or Room Management tabs!";
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('room')) response = "Opening Room Management... Oh wait, you can just click the 'Rooms' tab on your left!";
      else if (lowerText.includes('staff')) response = "I can see all 12 staff members are currently active.";
      else if (lowerText.includes('hello') || lowerText.includes('hi')) response = "Hello! I am ready for your commands. Try saying 'Status of rooms' or 'How many bookings today?'";

      const botMsg = { id: Date.now() + 1, text: response, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
      speak(response);
    }, 600);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 animate-bounce-subtle"
      >
        <div className="relative">
          <MessageSquare size={28} />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-100 z-50 animate-slide-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <p className="text-sm font-bold">Hotel Assistant</p>
            <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online & Listening</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="opacity-70 hover:opacity-100 transition-opacity">
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
        <button 
          onClick={toggleListening}
          className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type or speak a command..."
          className="flex-1 bg-gray-50 border-none px-4 py-3 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none font-medium"
        />
        <button 
          onClick={() => handleSend()}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

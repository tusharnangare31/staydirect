import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Hostel } from '../types';

interface ChatViewProps {
  hostel?: Hostel;
  recipientName?: string;
  recipientRole?: string;
  onBack: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  hostel,
  recipientName = 'Sunil Patil',
  recipientRole = 'Owner, Sunrise PG',
  onBack,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'owner',
      senderName: recipientName,
      text: `Hello! Thanks for your interest in ${hostel ? hostel.name : 'Sunrise PG'}. How can I help you today?`,
      timestamp: '10:15 AM',
      isMe: false,
    },
    {
      id: 'msg-2',
      senderId: 'student',
      senderName: 'Rahul',
      text: 'Hi! Is double sharing available from next Monday? Also wanted to check if 3 meals are included.',
      timestamp: '10:17 AM',
      isMe: true,
    },
    {
      id: 'msg-3',
      senderId: 'owner',
      senderName: recipientName,
      text: 'Yes, 2 double sharing beds are open right now. Homely breakfast, lunch, and dinner are included with unlimited Wi-Fi and laundry.',
      timestamp: '10:19 AM',
      isMe: false,
    },
  ]);

  const [input, setInput] = useState('');
  const [callBanner, setCallBanner] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Rahul',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput('');

    // Simulate direct owner response
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'owner',
        senderName: recipientName,
        text: "Understood! You are welcome to visit any time between 10 AM and 7 PM. I'll personally show you around the room.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-lg mx-auto bg-[#F9F9FF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#F0F3FF]"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#DEE8FF] overflow-hidden">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLy40qH75ZgK0W1_iA4aIu7YJ21Vf061vM-9QvB9iT6aL2r-z6l7J_Q0x-x9O_t-3UvX5"
                alt={recipientName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback avatar
                  e.currentTarget.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuBvZgbPa_ovWnFYtRM2V2ETPgVe__fVKmbQGvcBMUFW8346ltYVyoGTNXiMKDHCPAVH6g9peeSZWJPUUjR8md_blLZxnG9w5hD5J4pakjz1mKRyZKeCfWSiKWJdnLQx4oQWYaMfcRlY-c0TsdgiaNL20iBgXI8DWUMaHN8lH_hoCK1p1QyGzqeHYXvyV-k9oMuWv67EtralAJbFmhuHVHsK9GxFEGwxuSq0T9NCn-ehj4rHJFdy3OaJ';
                }}
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full ring-2 ring-white" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-[#111C2D]">{recipientName}</h2>
            <p className="text-[10px] text-[#006C49] font-medium flex items-center gap-1">
              <span>{recipientRole}</span>
              <span>•</span>
              <span className="text-[#10B981]">Active now</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCallBanner(true)}
            aria-label="Direct Call"
            className="w-9 h-9 rounded-full bg-[#F0F3FF] text-[#00362A] flex items-center justify-center hover:bg-[#DEE8FF] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </button>
        </div>
      </div>

      {callBanner && (
        <div className="bg-[#E8F5EE] border-b border-[#B4EFDA] px-4 py-2 flex items-center justify-between text-xs text-[#006C49]">
          <span className="font-semibold">Dialing +91 98220 44551 with 0% Brokerage...</span>
          <button
            onClick={() => setCallBanner(false)}
            className="text-[11px] font-bold text-[#BA1A1A]"
          >
            End
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="flex justify-center">
          <span className="text-[10px] font-semibold text-[#707975] bg-white px-2.5 py-1 rounded-full border border-[#E2E8F0] shadow-xs">
            Direct Connect • Zero Brokerage Guaranteed
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                msg.isMe
                  ? 'bg-[#00362A] text-white rounded-br-none'
                  : 'bg-white text-[#111C2D] border border-[#E2E8F0] rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
            <span className="text-[9px] text-[#94A3B8] px-1 mt-1 font-medium">
              {msg.timestamp}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="bg-white p-3 border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          aria-label="Add attachment"
          onClick={() => alert('Photo & ID attachment ready.')}
          className="w-9 h-9 rounded-full bg-[#F0F3FF] text-[#404945] flex items-center justify-center hover:text-[#00362A]"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message to owner..."
          className="flex-1 h-10 px-3 bg-[#F0F3FF] rounded-xl text-xs text-[#111C2D] border border-[#E2E8F0] focus:outline-none focus:bg-white focus:border-[#006C49]"
        />

        <button
          type="submit"
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-[#00362A] text-white flex items-center justify-center hover:bg-[#124E3F] transition-colors shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
};

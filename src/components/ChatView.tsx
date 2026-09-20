import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Hostel, UserProfile } from '../types';

interface ChatViewProps {
  hostel?: Hostel;
  recipientName?: string;
  recipientRole?: string;
  onBack: () => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (role?: 'student' | 'owner', context?: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  hostel,
  recipientName = 'Sunil Patil',
  recipientRole = 'Owner, Sunrise PG',
  onBack,
  currentUser,
  onOpenAuth,
}) => {
  const currentUserName = currentUser?.name || 'Student';
  const isGuest = !currentUser;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      senderId: 'owner',
      senderName: recipientName,
      text: `Hello! Thanks for your interest in ${hostel ? hostel.name : 'Sunrise PG'}. How can I help you with rooms, rent, or visit timing?`,
      timestamp: '10:15 AM',
      isMe: false,
    },
    {
      id: 'msg-2',
      senderId: 'student',
      senderName: currentUserName,
      text: 'Hi! Is twin sharing available from next Monday? Also wanted to verify if 3 meals are included in the zero-brokerage rent.',
      timestamp: '10:17 AM',
      isMe: true,
    },
    {
      id: 'msg-3',
      senderId: 'owner',
      senderName: recipientName,
      text: 'Yes! 2 twin sharing beds are open right now. Homely breakfast, lunch, and dinner are included along with high-speed Wi-Fi and laundry. No brokerage at all.',
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

    if (isGuest && onOpenAuth) {
      onOpenAuth('student', 'Sign in as a student to send direct messages to hostel owners.');
      return;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: currentUserName,
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
        text: "Got your message! You are welcome to visit any time between 10 AM and 7 PM. I'll personally show you around the room and hostel premises.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000);
  };

  const handleCallClick = () => {
    if (isGuest && onOpenAuth) {
      onOpenAuth('student', 'Sign in to access direct verified owner phone contact.');
      return;
    }
    setCallBanner(true);
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-lg mx-auto bg-white border border-[#E5E3D8] rounded-3xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-[#E5E3D8] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#111C2D] hover:bg-[#F1EFE6] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center font-bold text-sm shadow-xs">
              {recipientName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10B981] rounded-full ring-2 ring-white" />
          </div>

          <div className="flex flex-col">
            <h2 className="text-xs font-black text-[#111C2D]">{recipientName}</h2>
            <p className="text-[10px] text-[#15803D] font-bold flex items-center gap-1">
              <span>{recipientRole}</span>
              <span>•</span>
              <span className="text-[#10B981]">Active now</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCallClick}
            aria-label="Direct Call"
            className="w-9 h-9 rounded-xl bg-[#F1EFE6] text-[#173B2C] flex items-center justify-center hover:bg-[#E5E3D8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </button>
        </div>
      </div>

      {isGuest && (
        <div className="bg-[#FEF3C7] border-b border-[#FDE68A] px-4 py-2 flex items-center justify-between text-xs text-[#B45309]">
          <span className="text-[11px] font-semibold">Guest preview mode. Sign in to chat directly.</span>
          <button
            type="button"
            onClick={() => onOpenAuth?.('student', 'Sign in as a student to unlock real-time direct owner chat.')}
            className="text-[11px] font-black underline cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}

      {callBanner && (
        <div className="bg-[#DCFCE7] border-b border-[#B8CEAA] px-4 py-2.5 flex items-center justify-between text-xs text-[#15803D]">
          <span className="font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">call</span>
            Dialing {hostel?.owner?.phone || '+91 98220 44551'} (Zero Brokerage)...
          </span>
          <button
            onClick={() => setCallBanner(false)}
            className="text-[11px] font-black text-rose-600 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F7F1]/50">
        <div className="flex justify-center">
          <span className="px-3 py-1 rounded-full bg-white text-[10px] font-bold text-[#8E95A2] border border-[#E5E3D8] shadow-2xs">
            Verified Direct Chat • Zero Brokerage Guarantee
          </span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                msg.isMe
                  ? 'bg-[#173B2C] text-white rounded-br-xs'
                  : 'bg-white text-[#111C2D] border border-[#E5E3D8] rounded-bl-xs'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-[#8E95A2] mt-0.5 px-1">{msg.timestamp}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        className="bg-white p-3 border-t border-[#E5E3D8] flex items-center gap-2 shrink-0"
      >
        <button
          type="button"
          aria-label="Add attachment"
          onClick={() => alert('Photo & Student ID attachment verified.')}
          className="w-9 h-9 rounded-xl bg-[#F1EFE6] text-[#5C6470] flex items-center justify-center hover:text-[#173B2C] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isGuest ? 'Sign in to reply to owner...' : 'Type message to owner...'}
          className="flex-1 h-10 px-3 bg-[#F8F7F1] rounded-xl text-xs text-[#111C2D] border border-[#E5E3D8] focus:outline-none focus:bg-white focus:border-[#173B2C]"
        />

        <button
          type="submit"
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-[#173B2C] text-white flex items-center justify-center hover:bg-[#24523F] transition-colors shadow-xs active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </form>
    </div>
  );
};

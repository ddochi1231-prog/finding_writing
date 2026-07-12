import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: '안녕! 나는 궁금한 모든 것을 알려주는 숲속의 **AI 생물 박사**야! 🍀\n궁금한 꽃, 나무, 곤충, 동물 친구들에 대해 나한테 질문해 볼래? 다정하게 답해줄게!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      const modelMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: data.reply || '미안해, 다시 한 번 상상력을 발휘해서 말해줄래?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        content: '앗, 잠시 숲속 네트워크가 흐린가 봐! ☁️ 다시 한번 속삭여줄래?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="bg-white border-4 border-[#c2ebd1] rounded-3xl w-80 md:w-96 h-[500px] bubbly-shadow flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-[#e8f5ed] border-b-4 border-[#c2ebd1] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white border-2 border-[#87d3a1] rounded-full flex items-center justify-center text-[#39a060]">
                  <Sprout size={20} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2a6d45] flex items-center gap-1">
                    AI 생물 박사 🍀
                    <span className="text-[9px] bg-white border border-[#87d3a1] text-[#39a060] font-bold px-1.5 py-0.5 rounded-full">
                      실시간 대화
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#528d69] font-medium">지혜가 쑥쑥 자라나요!</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 transition-colors cursor-pointer"
                style={{ minHeight: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages Pane */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-xl bg-[#d1eedb] border-2 border-[#87d3a1] flex items-center justify-center text-[#39a060] shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`max-w-[75%] space-y-1`}>
                    <div
                      className={`text-xs px-3.5 py-2.5 rounded-2xl whitespace-pre-line leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#39a060] text-white rounded-tr-none font-medium bubbly-shadow-sm'
                          : 'bg-white border-2 border-[#c2ebd1] text-slate-700 rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`block text-[9px] text-gray-400 font-bold ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Message Loading bubble */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-[#d1eedb] border-2 border-[#87d3a1] flex items-center justify-center text-[#39a060] shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border-2 border-[#c2ebd1] text-gray-400 rounded-2xl rounded-tl-none px-4 py-2 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#39a060] rounded-full animate-bounce delay-75" />
                    <span className="w-1.5 h-1.5 bg-[#39a060] rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-[#39a060] rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#e8f5ed] border-t-4 border-[#c2ebd1] flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="생물 친구에 대해 질문해봐요..."
                className="flex-1 bg-white border-2 border-[#c2ebd1] rounded-2xl px-3.5 py-2 text-xs outline-none focus:border-[#39a060] text-slate-800"
                style={{ minHeight: '38px' }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-[#39a060] text-white rounded-xl flex items-center justify-center hover:bg-[#2e834e] disabled:bg-gray-200 disabled:text-gray-400 transition-colors shrink-0 cursor-pointer"
                style={{ minHeight: '40px' }}
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#39a060] hover:bg-[#2e834e] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white bubbly-shadow cursor-pointer relative"
        style={{ minHeight: '56px', minWidth: '56px' }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <span className="absolute -top-1.5 -right-1.5 bg-[#ffa45b] text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold border-2 border-white animate-bounce">
            AI질문
          </span>
        )}
      </motion.button>
    </div>
  );
}

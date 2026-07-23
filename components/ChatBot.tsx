// components/ChatBot.tsx - Version moderne avec design app-like et IA premium
'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  ChevronDown,
  ChevronUp,
  Sprout,
  Droplets,
  Leaf,
  Bug,
  CloudSun,
  TrendingUp,
  HelpCircle,
  Mic,
  Paperclip,
  Smile,
  CornerDownLeft,
  Zap,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

const COLORS = {
  SOLEIL: '#FFF3DA',
  DOUCEUR: '#FFC490',
  NATURE: '#3C6C5F',
  JOIE_DE_VIVRE: '#29453E',
  PRINTEMPS: '#9DAE7A',
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Quick replies suggestions
  const quickReplies = [
    { icon: Sprout, label: 'Conseils culture' },
    { icon: Droplets, label: 'Gestion eau' },
    { icon: Leaf, label: 'Fertilisation' },
    { icon: Bug, label: 'Ravageurs' },
    { icon: CloudSun, label: 'Météo' },
    { icon: TrendingUp, label: 'Récoltes' },
  ];

  const suggestedQuestions = [
    "Comment planter des tomates ?",
    "Quel engrais naturel utiliser ?",
    "Identifier les maladies courantes",
    "Arrosage optimal pour mes cultures",
    "Météo agricole cette semaine"
  ];

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Bonjour ! Je suis l'assistant IA de Smart Ferme.\n\nJe suis là pour vous accompagner dans la gestion de votre exploitation agricole. Que puis-je faire pour vous aujourd'hui ?",
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status}`);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.reply || "Je n'ai pas pu traiter votre demande.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Erreur:', error);
      
      const fallbackResponses = [
        "**Astuce Smart Ferme**\n\nPour des tomates parfaites, arrosez au pied le matin et paillez le sol pour conserver l'humidité.",
        "**Conseil de rotation**\n\nLa rotation des cultures préserve la fertilité du sol et limite naturellement les maladies.",
        "**Gestion de l'eau**\n\nL'arrosage goutte-à-goutte permet d'économiser jusqu'à 60% d'eau tout en évitant les maladies foliaires.",
        "**Prévention**\n\nInspectez régulièrement vos plantes. Une détection précoce des ravageurs permet une intervention ciblée.",
        "**Smart Ferme**\n\nL'analyse du sol est essentielle avant chaque plantation. Faites tester votre sol tous les 2-3 ans."
      ];
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        sender: 'bot',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(() => sendMessage(), 100);
  };

  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parseInline = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-extrabold text-[#29453E] dark:text-[#9DAE7A]">{part.slice(2, -2)}</strong>;
          }
          return part;
        });
      };

      if (line.startsWith('•')) {
        return <li key={i} className="ml-4 list-disc my-1 pl-1 text-[#29453E]/90 dark:text-gray-200">{parseInline(line.substring(1).trim())}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i} className="block text-base font-extrabold text-[#29453E] dark:text-white mb-2 mt-3">{line.slice(2, -2)}</strong>;
      }
      if (line.match(/^[0-9]\./)) {
        return <li key={i} className="ml-4 list-decimal my-1 pl-1 text-[#29453E]/90 dark:text-gray-200">{parseInline(line)}</li>;
      }
      return line ? <p key={i} className="mb-1.5 text-[#29453E]/90 dark:text-gray-200 leading-relaxed">{parseInline(line)}</p> : <div key={i} className="h-2" />;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group transition-all duration-300"
        >
          <div className="absolute inset-0 bg-[#3C6C5F]/20 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FFC490] via-[#9DAE7A] to-[#3C6C5F] rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-[#FFC490] rounded-full border-2 border-white animate-bounce"></span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`
          fixed bottom-6 right-6 z-50 
          bg-white/95 dark:bg-[#111c18]/95 
          backdrop-blur-md
          rounded-3xl shadow-[0_20px_60px_rgba(41,69,62,0.25)] 
          flex flex-col 
          border border-[#3C6C5F]/25 dark:border-[#9DAE7A]/20
          transition-all duration-300 ease-in-out overflow-hidden
          ${isFullScreen ? 'inset-4 rounded-3xl' : 'w-[calc(100%-2rem)] sm:w-[450px] h-[85vh] sm:h-[700px]'}
          ${isMinimized ? 'h-[76px]' : ''}
        `}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#3C6C5F]/10 dark:border-white/10 bg-gradient-to-r from-[#29453E] to-[#3C6C5F] text-white rounded-t-3xl shadow-sm">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                {/* Slow spinning gradient border */}
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-[#FFC490] via-[#9DAE7A] to-white animate-slow-spin opacity-80 blur-[1px]"></div>
                <div className="relative w-11 h-11 rounded-xl bg-[#29453E] flex items-center justify-center text-white border border-white/20 shadow-md">
                  <Bot className="w-5.5 h-5.5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-[#29453E] rounded-full shadow-sm"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight flex items-center gap-1.5 text-white">
                  Smart Ferme AI
                  <span className="bg-[#FFF3DA]/20 text-[#FFF3DA] text-[9px] font-black px-1.5 py-0.5 rounded-full border border-[#FFF3DA]/10 tracking-widest uppercase">2.0</span>
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-[10px] text-white/80 font-medium">Disponible</span>
                  <span className="text-[10px] text-white/40">•</span>
                  <span className="text-[10px] text-white/70 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-[#FFC490]" /> IA Active
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-white/80 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#FAFAFA] to-[#F5F8F6] dark:from-[#0b1210] dark:to-[#080d0c] scrollbar-thin">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                  >
                    <div className={`
                      max-w-[85%] 
                      ${msg.sender === 'user' 
                        ? 'bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white rounded-3xl rounded-tr-sm shadow-lg shadow-[#3C6C5F]/20' 
                        : 'bg-white dark:bg-[#15241f] text-gray-800 dark:text-gray-100 rounded-3xl rounded-tl-sm shadow-md border border-[#3C6C5F]/10 dark:border-[#3C6C5F]/20'
                      }
                    `}>
                      {msg.sender === 'bot' && (
                        <div className="flex items-center gap-2 px-4 pt-3 pb-1 border-b border-[#3C6C5F]/5 dark:border-white/5">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center text-white">
                            <Bot className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#29453E]/60 dark:text-gray-400">Assistant Smart Ferme</span>
                          <span className="text-[9px] text-[#3C6C5F]/60 dark:text-gray-500 ml-auto font-medium">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      <div className={`px-4 pb-3.5 ${msg.sender === 'user' ? 'pt-3' : 'pt-2'}`}>
                        <div className="text-sm leading-relaxed">
                          {msg.sender === 'bot' ? formatMessage(msg.text) : <p className="font-medium">{msg.text}</p>}
                        </div>
                      </div>
                      {msg.sender === 'user' && (
                        <div className="px-4 pb-2.5 flex justify-end">
                          <span className="text-[9px] text-white/70 font-semibold">
                            {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                      {msg.sender === 'bot' && index === messages.length - 1 && !isLoading && (
                        <div className="flex items-center gap-3 px-4 py-2 border-t border-[#3C6C5F]/5 dark:border-white/5 bg-gray-50/50 dark:bg-[#121e1a]/30 rounded-b-3xl">
                          <button 
                            onClick={() => {}} 
                            className="p-1 rounded-lg hover:bg-[#FFF3DA] dark:hover:bg-[#3C6C5F]/40 transition-colors text-gray-400 hover:text-[#3C6C5F] dark:hover:text-[#9DAE7A]"
                          >
                            <ThumbsUp size={13} />
                          </button>
                          <button 
                            onClick={() => {}} 
                            className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-gray-400 hover:text-red-500"
                          >
                            <ThumbsDown size={13} />
                          </button>
                          <button 
                            onClick={() => handleCopy(msg.text)} 
                            className="p-1 rounded-lg hover:bg-[#FFF3DA] dark:hover:bg-[#3C6C5F]/40 transition-colors text-gray-400 hover:text-[#3C6C5F] dark:hover:text-[#9DAE7A]"
                          >
                            <Copy size={13} />
                          </button>
                          <button 
                            onClick={sendMessage} 
                            className="p-1 rounded-lg hover:bg-[#FFF3DA] dark:hover:bg-[#3C6C5F]/40 transition-colors text-gray-400 hover:text-[#3C6C5F] dark:hover:text-[#9DAE7A] ml-auto"
                          >
                            <RefreshCw size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="bg-white dark:bg-[#15241f] rounded-3xl rounded-tl-sm shadow-md border border-[#3C6C5F]/10 dark:border-[#3C6C5F]/20 p-4 max-w-[85%]">
                      <div className="flex items-center gap-3.5">
                        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center text-white shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="flex space-x-1.5 items-center py-1">
                          <span className="w-2.5 h-2.5 bg-gradient-to-br from-[#9DAE7A] to-[#3C6C5F] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2.5 h-2.5 bg-gradient-to-br from-[#9DAE7A] to-[#3C6C5F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2.5 h-2.5 bg-gradient-to-br from-[#9DAE7A] to-[#3C6C5F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions panels */}
              {showSuggestions && messages.length < 3 && (
                <div className="bg-white dark:bg-[#121f1b] border-t border-[#3C6C5F]/10 dark:border-white/10 shadow-inner">
                  {/* Quick Actions */}
                  <div className="px-4 py-3 border-b border-[#3C6C5F]/5 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Zap className="w-3.5 h-3.5 text-[#FFC490]" />
                      <span className="text-xs font-bold text-[#29453E] dark:text-gray-300 uppercase tracking-wider">Actions rapides</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map(({ icon: Icon, label }, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(label)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#162722] hover:bg-[#FFF3DA]/45 dark:hover:bg-[#3C6C5F]/35 border border-[#3C6C5F]/15 dark:border-[#3C6C5F]/30 hover:border-[#FFC490] dark:hover:border-[#FFC490] rounded-full text-xs text-[#29453E] dark:text-[#9DAE7A] font-bold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow"
                        >
                          <Icon className="w-3.5 h-3.5 text-[#3C6C5F] dark:text-[#9DAE7A]" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Frequently Asked */}
                  <div className="px-4 py-3 bg-gray-50/50 dark:bg-[#0f1916]/50">
                    <div className="flex items-center gap-2 mb-2.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#3C6C5F]/50" />
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions fréquentes</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedQuestions.map((q, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(q)}
                          className="px-3.5 py-1.5 bg-white dark:bg-[#162722] hover:bg-[#FFF3DA]/45 dark:hover:bg-[#3C6C5F]/30 border border-[#3C6C5F]/15 dark:border-[#3C6C5F]/20 rounded-2xl text-xs text-gray-600 dark:text-gray-300 font-semibold transition-all hover:border-[#FFC490]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white dark:bg-[#111c18] border-t border-[#3C6C5F]/10 dark:border-white/10">
                <div className="relative flex items-end gap-2.5">
                  <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-[#162722] rounded-2xl border border-transparent focus-within:border-[#3C6C5F]/40 focus-within:ring-2 focus-within:ring-[#3C6C5F]/15 transition-all">
                    {/* Add-ons */}
                    <div className="absolute left-3 bottom-2.5 flex items-center gap-1.5 z-10">
                      <button className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#20362f] transition text-gray-400 hover:text-[#3C6C5F]">
                        <Paperclip className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-[#20362f] transition text-gray-400 hover:text-[#3C6C5F]">
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Textarea */}
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Posez votre question..."
                      className="w-full pl-18 pr-11 py-3 border-0 bg-transparent rounded-2xl focus:outline-none resize-none text-gray-800 dark:text-gray-100 min-h-[44px] max-h-[120px] text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 font-semibold"
                      rows={1}
                      disabled={isLoading}
                    />
                    
                    {/* Voice input */}
                    <div className="absolute right-2 bottom-2 z-10">
                      <button className="p-1.5 rounded-xl hover:bg-gray-200 dark:hover:bg-[#20362f] transition text-gray-400 hover:text-[#3C6C5F]">
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-br from-[#3C6C5F] to-[#29453E] hover:from-[#29453E] hover:to-[#3C6C5F] disabled:opacity-40 disabled:scale-100 text-white p-3 rounded-2xl transition-all flex items-center justify-center min-w-[48px] min-h-[48px] shadow-lg shadow-[#3C6C5F]/30 hover:shadow-xl hover:scale-105 active:scale-95"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {/* Footer Badges */}
                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500 font-semibold select-none">
                  <span className="flex items-center gap-1 hover:text-[#3C6C5F] transition-colors">
                    <CornerDownLeft className="w-3 h-3 text-[#3C6C5F]" />
                    Entrée pour envoyer
                  </span>
                  <span className="w-px h-3 bg-gray-200 dark:bg-gray-800"></span>
                  <span className="flex items-center gap-1 hover:text-[#3C6C5F] transition-colors">
                    <Shield className="w-3 h-3 text-[#3C6C5F]" />
                    Sécurisé
                  </span>
                  <span className="w-px h-3 bg-gray-200 dark:bg-gray-800"></span>
                  <span className="flex items-center gap-1 hover:text-[#3C6C5F] transition-colors">
                    <Sparkles className="w-3 h-3 text-[#FFC490]" />
                    IA avancée
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Styles personnalisés */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 8s linear infinite;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
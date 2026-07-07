// components/MessagerieModal.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, MessageCircle, CheckCheck, Loader2 } from "lucide-react";

interface Message {
  id: number;
  contenu: string;
  lu: boolean;
  createdAt: string;
  expediteur: { id: number; nom: string; prenom: string; image?: string | null; role: string };
  destinataire: { id: number; nom: string; prenom: string; image?: string | null; role: string };
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  image?: string | null;
  role: string;
}

interface MessagerieModalProps {
  currentUser: User;
  interlocuteur: User;
  onClose: () => void;
}

export function MessagerieModal({ currentUser, interlocuteur, onClose }: MessagerieModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?with=${interlocuteur.id}`);
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [interlocuteur.id]);

  useEffect(() => {
    fetchMessages();
    // Polling toutes les 5 secondes
    intervalRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinataireId: interlocuteur.id, contenu: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  const getInitials = (nom: string, prenom: string) =>
    `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();

  // Grouper les messages par date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const dateKey = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg h-[600px] flex flex-col bg-white dark:bg-[#1a2e28] rounded-2xl shadow-2xl border border-[#FFC490]/20 overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#3C6C5F] to-[#29453E] text-white shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm overflow-hidden">
            {interlocuteur.image ? (
              <img src={interlocuteur.image} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials(interlocuteur.nom, interlocuteur.prenom)
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#29453E]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{interlocuteur.prenom} {interlocuteur.nom}</p>
            <p className="text-xs text-white/60 capitalize">{(interlocuteur.role || "").toLowerCase()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#FAFAFA] dark:bg-[#0d1a15]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#3C6C5F]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#3C6C5F]/40">
              <MessageCircle size={40} />
              <p className="text-sm">Aucun message. Commencez la conversation !</p>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-[#3C6C5F]/10" />
                  <span className="text-xs text-[#3C6C5F]/40 font-medium px-2">{group.date}</span>
                  <div className="flex-1 h-px bg-[#3C6C5F]/10" />
                </div>
                {group.messages.map((msg) => {
                  const isMe = msg.expediteur.id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 mb-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white text-xs flex items-center justify-center font-bold shrink-0">
                          {getInitials(msg.expediteur.nom, msg.expediteur.prenom)}
                        </div>
                      )}
                      <div className={`max-w-[70%] group`}>
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? "bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white rounded-br-sm"
                              : "bg-white dark:bg-[#1a2e28] text-[#29453E] dark:text-white border border-[#3C6C5F]/10 rounded-bl-sm"
                          }`}
                        >
                          {msg.contenu}
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"}`}>
                          <span className="text-[10px] text-[#3C6C5F]/40">{formatTime(msg.createdAt)}</span>
                          {isMe && (
                            <CheckCheck size={12} className={msg.lu ? "text-emerald-400" : "text-[#3C6C5F]/30"} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-[#3C6C5F]/10 bg-white dark:bg-[#1a2e28] shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrire un message..."
            disabled={sending}
            className="flex-1 px-4 py-2 rounded-xl bg-[#FAFAFA] dark:bg-[#0d1a15] border border-[#3C6C5F]/15 text-[#29453E] dark:text-white placeholder:text-[#3C6C5F]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#3C6C5F]/40 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2.5 rounded-xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}

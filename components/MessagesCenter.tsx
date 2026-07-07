// components/MessagesCenter.tsx
"use client";

import { useState } from "react";
import { MessageCircle, Mail, User, ArrowRight } from "lucide-react";
import { MessagerieModal } from "./MessagerieModal";

interface UserItem {
  id: number;
  nom: string;
  prenom: string;
  image?: string | null;
  role: string;
  email?: string;
}

interface MessagesCenterProps {
  currentUser: UserItem;
  contacts: UserItem[];
}

export default function MessagesCenter({ currentUser, contacts }: MessagesCenterProps) {
  const [selectedContact, setSelectedContact] = useState<UserItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 shadow-md p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] flex items-center justify-center text-white shadow-lg">
            <MessageCircle size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#29453E] dark:text-white">Messagerie</h1>
            <p className="text-sm text-[#3C6C5F]/60 dark:text-[#9DAE7A]/60">
              Contactez vos interlocuteurs depuis un seul endroit.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6 mt-6">
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#3C6C5F]/15 p-6 text-sm text-[#3C6C5F]/60 bg-[#FAFAFA] dark:bg-[#0d1a15]">
                Aucun contact disponible pour le moment.
              </div>
            ) : (
              contacts.map((contact) => {
                const isActive = selectedContact?.id === contact.id;
                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      isActive
                        ? "border-[#3C6C5F]/30 bg-[#DDF3E8] dark:bg-[#2a3f38]"
                        : "border-[#3C6C5F]/10 bg-white dark:bg-[#1a2e28] hover:border-[#3C6C5F]/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white flex items-center justify-center overflow-hidden font-bold shrink-0">
                        {contact.image ? (
                          <img src={contact.image} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          `${contact.prenom?.[0] ?? ""}${contact.nom?.[0] ?? ""}`
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#29453E] dark:text-white truncate">
                          {contact.prenom} {contact.nom}
                        </p>
                        <p className="text-xs text-[#3C6C5F]/60 capitalize truncate">{contact.role?.toLowerCase()}</p>
                      </div>
                      <ArrowRight size={16} className={isActive ? "text-[#3C6C5F]" : "text-[#3C6C5F]/30"} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-2xl border border-[#3C6C5F]/10 bg-[#FAFAFA] dark:bg-[#0d1a15] p-6 flex flex-col justify-center min-h-[280px]">
            {selectedContact ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3C6C5F] to-[#29453E] text-white flex items-center justify-center font-bold overflow-hidden">
                    {selectedContact.image ? (
                      <img src={selectedContact.image} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      `${selectedContact.prenom?.[0] ?? ""}${selectedContact.nom?.[0] ?? ""}`
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#29453E] dark:text-white">
                      {selectedContact.prenom} {selectedContact.nom}
                    </p>
                    <p className="text-sm text-[#3C6C5F]/60 capitalize">{selectedContact.role?.toLowerCase()}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white dark:bg-[#1a2e28] border border-[#3C6C5F]/10 p-4 text-sm text-[#3C6C5F]/70 dark:text-[#9DAE7A]/70">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={14} />
                    <span className="font-medium text-[#29453E] dark:text-white">Conversation privée</span>
                  </div>
                  Cliquez sur un contact pour ouvrir le fil de discussion en temps réel.
                </div>
              </div>
            ) : (
              <div className="text-center text-[#3C6C5F]/50">
                <User size={32} className="mx-auto mb-2" />
                Sélectionnez un contact pour commencer.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedContact && (
        <MessagerieModal
          currentUser={currentUser}
          interlocuteur={selectedContact}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  );
}
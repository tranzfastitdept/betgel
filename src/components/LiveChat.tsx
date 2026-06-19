/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatRoom, ChatMessage } from '../types';
import { MessageSquare, Send, CheckSquare, Image, Shield, AlertCircle, RefreshCw } from 'lucide-react';

interface LiveChatProps {
  rooms: ChatRoom[];
  messages: ChatMessage[];
  onSendMessage: (roomId: string, text: string, attachedUrl?: string) => void;
  onResolveRoom: (roomId: string) => void;
  currentUserRole: 'admin' | 'user';
  currentUserId: string;
  currentUsername: string;
}

export default function LiveChat({
  rooms,
  messages,
  onSendMessage,
  onResolveRoom,
  currentUserRole,
  currentUserId,
  currentUsername
}: LiveChatProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    currentUserRole === 'admin' ? (rooms[0]?.id || null) : (rooms.find(r => r.userId === currentUserId)?.id || null)
  );
  
  const [typedMessage, setTypedMessage] = useState('');
  const [attachedUrl, setAttachedUrl] = useState('');
  const [showScreenshotInput, setShowScreenshotInput] = useState(false);

  const getActiveRoom = () => {
    if (currentUserRole === 'admin') {
      return rooms.find(r => r.id === selectedRoomId);
    }
    return rooms.find(r => r.userId === currentUserId);
  };

  const getFilteredMessages = () => {
    const activeRoom = getActiveRoom();
    if (!activeRoom) return [];
    return messages.filter(m => m.roomId === activeRoom.id);
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeRoom = getActiveRoom();
    if (!activeRoom) return;
    if (!typedMessage.trim() && !attachedUrl.trim()) return;

    onSendMessage(activeRoom.id, typedMessage.trim(), attachedUrl.trim() || undefined);
    setTypedMessage('');
    setAttachedUrl('');
    setShowScreenshotInput(false);
  };

  // Pre-configured automated quick inquiries to boost UI fidelity and simulate real-time operations
  const triggerQuickMessage = (text: string) => {
    const activeRoom = getActiveRoom();
    if (!activeRoom) return;
    onSendMessage(activeRoom.id, text);
  };

  const activeRoom = getActiveRoom();
  const activeMessages = getFilteredMessages();

  return (
    <div className="bg-[#141414] p-6 rounded-2xl border border-white/5 shadow-2xl h-[550px] flex flex-col justify-between" id="support-live-chat">
      {/* Header Panel */}
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold animate-pulse" />
          <div>
            <h3 className="text-md font-sans font-black text-slate-100 uppercase tracking-wide">
              Live Chat Support Node
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              {currentUserRole === 'admin' ? 'Bettor Communication Desk' : '24/7 Manual GCash & Sports Assistance'}
            </p>
          </div>
        </div>
        {currentUserRole === 'admin' && (
          <span className="flex items-center gap-1 bg-gold/10 text-gold border border-gold/20 text-[10px] px-2.5 py-1 rounded-full font-mono">
            <Shield className="w-3.5 h-3.5" />
            Operator Portal
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-hidden py-4">
        {/* Admin Sidebar Room List */}
        {currentUserRole === 'admin' ? (
          <div className="md:col-span-1 border-r border-white/5 pr-2 flex flex-col gap-2 overflow-y-auto max-h-full">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Active Tickets:</span>
            {rooms.length === 0 ? (
              <span className="text-xs text-slate-500 italic block py-2">No active inquiries.</span>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-2.5 rounded border transition flex flex-col gap-1 cursor-pointer ${selectedRoomId === room.id ? 'bg-gold/10 border-gold/40 text-gold font-bold shadow-gold-sm' : 'bg-black/30 border-white/5 hover:bg-black/50 text-slate-350'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-semibold truncate max-w-[80px]">{room.username}</span>
                    {room.status === 'open' ? (
                      <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/20 uppercase tracking-widest font-mono">
                        OPEN
                      </span>
                    ) : (
                      <span className="text-[8px] bg-[#1A1A1A] text-slate-500 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-widest font-mono font-bold">
                        CLOSED
                      </span>
                    )}
                  </div>
                  <span className="text-[8px] text-slate-550 block font-mono">
                    Last active: {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </button>
              ))
            )}
          </div>
        ) : (
          /* User Help Topics Panel */
          <div className="md:col-span-1 border-r border-white/5 pr-2 flex flex-col gap-2 overflow-y-auto justify-start max-h-full">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block mb-1">Quick Inquiries:</span>
            <button
              onClick={() => triggerQuickMessage("Please send me the live GCash deposit payment number.")}
              className="p-2 text-left bg-black/40 border border-white/10 text-[10px] text-slate-300 rounded hover:border-gold/40 transition cursor-pointer leading-tight font-mono"
            >
              • Need Deposit Number
            </button>
            <button
              onClick={() => triggerQuickMessage("I have uploaded my GCash receipt, please approve my deposit.")}
              className="p-2 text-left bg-black/40 border border-white/10 text-[10px] text-slate-300 rounded hover:border-gold/40 transition cursor-pointer leading-tight font-mono"
            >
              • Check Deposit Receipt
            </button>
            <button
              onClick={() => triggerQuickMessage("My withdrawal request is still pending, please review.")}
              className="p-2 text-left bg-black/40 border border-white/10 text-[10px] text-slate-300 rounded hover:border-gold/40 transition cursor-pointer leading-tight font-mono"
            >
              • Expedite GCash payout
            </button>
            <div className="bg-gold/5 rounded p-2.5 border border-gold/20 flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
              <p className="text-[9px] text-gold/80 leading-normal font-sans">
                Avoid sharing GCash OTPs here. Support will never request passwords.
              </p>
            </div>
          </div>
        )}

        {/* Chat Messages Log Area */}
        <div className="md:col-span-3 flex flex-col justify-between bg-black/40 border border-white/10 rounded-2xl p-3.5 h-full">
          {activeRoom ? (
            <>
              {/* Top Support Title */}
              <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-2">
                <span className="text-xs font-mono text-slate-400">
                  Room ID: {activeRoom.id.substring(0, 8)}... ({activeRoom.status})
                </span>
                {currentUserRole === 'admin' && activeRoom.status === 'open' && (
                  <button
                    onClick={() => onResolveRoom(activeRoom.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] rounded border border-emerald-500/30 uppercase font-mono cursor-pointer transition"
                  >
                    <CheckSquare className="w-3 h-3" /> Mark Resolved
                  </button>
                )}
              </div>

              {/* Message scroll list */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[300px]">
                {activeMessages.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 italic text-xs">
                    No support logs loaded yet. Type below to converse.
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isSelf = msg.senderId === currentUserId || (currentUserRole === 'admin' && msg.senderRole === 'admin');
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${isSelf ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] text-slate-450 font-bold font-sans">{msg.senderName}</span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-xl border text-xs leading-normal select-all ${isSelf ? 'bg-gradient-to-r from-gold to-gold-dark border-gold/20 text-black font-extrabold shadow-gold-sm' : 'bg-neutral-900 border-white/5 text-slate-200'}`}
                        >
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          {msg.attachedUrl && (
                            <div className="mt-2 text-center rounded overflow-hidden max-w-[180px] bg-black/20 p-1 border border-white/10">
                              <span className="block text-[8px] text-slate-400 mb-1 font-sans">Receipt attachment</span>
                              <img
                                src={msg.attachedUrl}
                                alt="Attachment"
                                referrerPolicy="no-referrer"
                                className="object-cover max-h-32 w-full rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sending Console */}
              <form onSubmit={handleSendSubmit} className="mt-3.5 space-y-2 border-t border-white/5 pt-3">
                {showScreenshotInput && (
                  <div className="bg-black/95 rounded-xl p-2.5 border border-gold/30 flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="Paste receipt or screenshot image URL..."
                      value={attachedUrl}
                      onChange={(e) => setAttachedUrl(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg p-1.5 text-[11px] text-white focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowScreenshotInput(false)}
                      className="text-xs text-slate-500 hover:text-slate-300 px-2 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowScreenshotInput(!showScreenshotInput)}
                    className="p-2.5 bg-black border border-white/10 rounded-xl text-slate-400 hover:text-gold transition cursor-pointer"
                    title="Upload Receipt Mock URL"
                  >
                    <Image className="w-4 h-4" />
                  </button>
                  <input
                    id="support-chat-input"
                    type="text"
                    placeholder="Enter support correspondence here..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold"
                  />
                  <button
                    type="submit"
                    id="send-chat-message-btn"
                    className="px-4.5 bg-gradient-to-r from-gold to-gold-dark text-black rounded-xl transition flex items-center justify-center font-extrabold cursor-pointer hover:opacity-90 shadow-gold-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500 italic text-xs flex flex-col justify-center items-center gap-2">
              <RefreshCw className="w-8 h-8 text-neutral-800 animate-spin" />
              Select a bettor room on the left side directory to interact!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

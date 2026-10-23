import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  User,
  ShoppingBag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onToggle,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onOpenProfile,
  orderCount = 0,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#0B0E14] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-3.5 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Agent<span className="text-sky-400">Pay</span>
              </span>
            </div>

            <button
              onClick={onToggle}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 shadow-md shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Shopping Search</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2 py-1.5">
            Recent Shopping Chats
          </div>

          {sessions.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-8 px-3 leading-relaxed">
              No previous chats.<br />Your shopping sessions will be saved here automatically.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span className="truncate">{session.title || 'Shopping Search'}</span>
                  </div>

                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity rounded"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Profile & Orders Button */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/30">
          <button
            onClick={onOpenProfile}
            className="w-full p-2 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between text-left group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0">
                SB
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                  Sandbox Buyer
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Orders & Profile</span>
                </div>
              </div>
            </div>

            {orderCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                {orderCount}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

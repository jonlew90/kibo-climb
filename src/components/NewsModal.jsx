import React from 'react';
import { X, Sparkles, Megaphone, CalendarDays, Hourglass } from 'lucide-react';

export default function NewsModal({ isOpen, onClose, newsItems = [] }) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200 cursor-default"
      >

        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 p-6 flex flex-col items-center justify-center border-b border-amber-300">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-amber-950"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="bg-white p-3 rounded-full shadow-sm mb-3">
            <Megaphone className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-amber-950 tracking-tight text-center">
            Kibo News
          </h2>
          <p className="text-amber-900/80 text-sm font-medium mt-1">
            What's new in the world of Kibo!
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] bg-slate-50 space-y-4">
          {newsItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>You're all caught up!</p>
              <p className="text-sm">Check back later for more updates.</p>
            </div>
          ) : (
            newsItems.map((news, index) => {
              const Icon = news.type === 'event_start' ? Sparkles
                         : news.type === 'event_ending' ? Hourglass
                         : CalendarDays;

              const bgColors = news.type === 'event_start' ? 'bg-emerald-50 border-emerald-200'
                             : news.type === 'event_ending' ? 'bg-rose-50 border-rose-200'
                             : 'bg-sky-50 border-sky-200';

              const iconColors = news.type === 'event_start' ? 'text-emerald-500 bg-emerald-100'
                               : news.type === 'event_ending' ? 'text-rose-500 bg-rose-100'
                               : 'text-sky-500 bg-sky-100';

              const titleColors = news.type === 'event_start' ? 'text-emerald-900'
                                : news.type === 'event_ending' ? 'text-rose-900'
                                : 'text-sky-900';

              return (
                <div
                  key={news.id || index}
                  className={`p-4 rounded-2xl border flex items-start gap-4 transition-all ${bgColors}`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${iconColors}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 ${titleColors}`}>
                      <span>{news.icon}</span> {news.title}
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      {news.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
          >
            Got it!
          </button>
        </div>

      </div>
    </div>
  );
}

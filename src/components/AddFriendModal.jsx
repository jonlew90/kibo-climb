import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { leaderboardService } from '../services/leaderboardService';
import { storageService } from '../services/storageService';

export default function AddFriendModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query.trim().length < 3) {
      setError('Please enter at least 3 characters.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await leaderboardService.searchUsername(query);
      setResults(res);
      if (res.length === 0) {
        setError('No climbers found with that name.');
      }
    } catch (err) {
      setError('Failed to search. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = (friendId, username) => {
    const success = storageService.addFriend(friendId);
    if (success) {
      setSuccessMsg(`Added ${username} to your friends list!`);
      // Update UI state to show added
      setResults(prev => prev.map(r => r.id === friendId ? { ...r, added: true } : r));
    } else {
      setError('Could not add friend. Your friend list might be full (Max 25).');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-indigo-600 p-4 pb-5 rounded-t-3xl text-center relative shadow-md z-10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black text-white">Add a Friend</h2>
          <p className="text-indigo-200 text-sm font-medium mt-1">Search for climbers to add to your list</p>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-50 min-h-[300px] max-h-[500px]">
          <form onSubmit={handleSearch} className="mb-4 relative flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 stroke-[2.5]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 font-bold placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || query.trim().length < 3}
              className="ml-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white font-bold rounded-xl transition-colors"
            >
              {isSearching ? '...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <div className="space-y-2">
            {results.map((r) => {
               // Check if they are already a friend
               const myFriends = storageService.getFriends();
               const isAlreadyFriend = myFriends.includes(r.id) || r.added;

               return (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="font-bold text-slate-800">{r.username}</span>
                  <button
                    onClick={() => handleAddFriend(r.id, r.username)}
                    disabled={isAlreadyFriend}
                    className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-colors ${
                      isAlreadyFriend
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                    }`}
                  >
                    {isAlreadyFriend ? 'Added' : 'Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

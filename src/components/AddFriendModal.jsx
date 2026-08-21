import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserCheck, Trash2, Users, Sparkles, Copy, CheckCircle2 } from 'lucide-react';
import Mascot from './Mascot';
import { soundFx } from '../utils/audio';
import { storageService } from '../services/storageService';
import { leaderboardService } from '../services/leaderboardService';
import { authService } from '../services/authService';

export default function AddFriendModal({
  isOpen,
  onClose,
  activeSubject = 'math',
  onFriendAdded = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const activeProfile = storageService.getActiveProfile();
  const currentUsername = storageService.getUsername() || activeProfile?.username || 'You';

  useEffect(() => {
    if (isOpen) {
      setFriendsList(storageService.getFriends());
      setSearchQuery('');
      setSearchResults([]);
      setSearchError('');
      setActionSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError('Please enter a username to search.');
      return;
    }
    if (query.length < 2) {
      setSearchError('Enter at least 2 characters.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const { results } = await leaderboardService.searchUsername(query);
      
      // Filter out self
      const selfNormalized = (currentUsername || '').trim().toLowerCase();
      const filtered = (results || []).filter(r => 
        (r.username || r.name || '').trim().toLowerCase() !== selfNormalized
      );

      if (filtered.length === 0) {
        setSearchError(`No climbers found matching "${query}". Check spelling and try again!`);
      } else {
        setSearchResults(filtered);
      }
    } catch (err) {
      console.warn('Search error', err);
      setSearchError('Could not perform search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = (climber) => {
    soundFx.playKeyTap();
    try {
      const updated = storageService.addFriend({
        id: climber.id || climber.uid || climber.username,
        uid: climber.uid,
        profileId: climber.profileId,
        username: climber.username || climber.name,
        name: climber.name || climber.username,
        score: climber.score || 1000,
        equipped: climber.equipped || [],
        subjectsMastered: climber.subjectsMastered || 5
      });
      setFriendsList([...updated]);
      soundFx.playVictory();
      setActionSuccessMsg(`Added ${climber.username || climber.name} to your friends!`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      onFriendAdded();
    } catch (err) {
      setSearchError(err.message || 'Could not add friend.');
    }
  };

  const handleRemoveFriend = (friendIdOrUsername) => {
    soundFx.playKeyTap();
    const updated = storageService.removeFriend(friendIdOrUsername);
    setFriendsList([...updated]);
    onFriendAdded();
  };

  const handleCopyInviteLink = async () => {
    soundFx.playKeyTap();
    const currentUser = authService.getAuthState();
    const userId = currentUser?.uid || '';
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?ref=${userId}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.warn('Copy link error', err);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-scale-in border-4 border-indigo-200 max-h-[90vh] flex flex-col overflow-hidden cursor-default"
      >
        
        {/* Close Button */}
        <button 
          onClick={() => {
            soundFx.playKeyTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-indigo-300 text-indigo-600">
            <Users className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Friends & Classmates</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Add friends to compare scores on the Friends Leaderboard!
          </p>
        </div>

        {/* Content Body - Scrollable */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[2.5]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchError('');
                  }}
                  placeholder="Enter climber tag (e.g. CosmicOtter42)"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-800 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isSearching ? <span className="animate-spin text-xs">🌀</span> : 'Search'}
              </button>
            </div>
            {searchError && (
              <p className="text-xs font-bold text-rose-500 px-1">{searchError}</p>
            )}
            {actionSuccessMsg && (
              <p className="text-xs font-bold text-emerald-600 px-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {actionSuccessMsg}
              </p>
            )}
          </form>

          {/* Search Results Preview */}
          {searchResults.length > 0 && (
            <div className="space-y-2 bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900">
                Search Results ({searchResults.length})
              </h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {searchResults.map((climber) => {
                  const alreadyFriend = storageService.isFriend(climber.id || climber.username);
                  return (
                    <div 
                      key={climber.id || climber.username}
                      className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                          <Mascot mood="happy" state="idle" equipped={climber.equipped || []} size={36} />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-extrabold text-sm text-slate-800 truncate">
                            {climber.username || climber.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                            ⭐ Rating: <span className="font-bold text-indigo-600">{climber.score || 1000}</span>
                          </div>
                        </div>
                      </div>

                      {alreadyFriend ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                          <UserCheck className="w-3.5 h-3.5" /> Friends
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddFriend(climber)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <UserPlus className="w-3.5 h-3.5" /> Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Current Friends List */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                Your Friends ({friendsList.length}/25)
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Max 25</span>
            </div>

            {friendsList.length === 0 ? (
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">No friends added yet</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Search a friend's tag above or share your invite link to connect!
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {friendsList.map((friend) => (
                  <div 
                    key={friend.id || friend.username}
                    className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden">
                        <Mascot mood="happy" state="idle" equipped={friend.equipped || []} size={32} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-extrabold text-sm text-slate-800 truncate">
                          {friend.username || friend.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold">
                          Climber Friend
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFriend(friend.id || friend.username)}
                      title="Remove Friend"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Invite Link Card */}
          <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <div className="text-xs font-black text-indigo-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Share Invite Link
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate">
                Friends get 500 Sparks when they join!
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shrink-0 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, UserCheck, Trash2, Users, Sparkles, Star, Copy, CheckCircle2, Clock, Check, ShieldCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' | 'requests' | 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [friendsList, setFriendsList] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  const activeProfile = storageService.getActiveProfile();
  const currentUsername = storageService.getUsername() || activeProfile?.username || 'You';

  const refreshData = () => {
    setFriendsList(storageService.getFriends());
    setFriendRequests(storageService.getFriendRequests());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setSearchQuery('');
      setSearchResults([]);
      setSearchError('');
      setActionSuccessMsg('');
      setActionErrorMsg('');

      // Fetch any cloud requests in background
      leaderboardService.fetchCloudFriendRequests(activeProfile?.id).then(({ received, acceptedSent }) => {
        let changed = false;
        if (Array.isArray(received) && received.length > 0) {
          received.forEach(req => {
            const targetProfileId = req.receiverProfileId || activeProfile?.id;
            storageService.receiveFriendRequest({
              id: req.id,
              senderId: `${req.senderUid}_${req.senderProfileId || 'default_child'}`,
              senderUid: req.senderUid,
              senderProfileId: req.senderProfileId || 'default_child',
              senderUsername: req.senderUsername,
              name: req.senderUsername,
              score: req.senderScore,
              equipped: req.senderEquipped,
              subjectsMastered: req.senderSubjectsMastered,
              createdAt: req.createdAt
            }, targetProfileId);
            changed = true;
          });
        }

        if (Array.isArray(acceptedSent) && acceptedSent.length > 0) {
          acceptedSent.forEach(req => {
            const senderProfileId = req.senderProfileId || activeProfile?.id;
            storageService.addFriend({
              id: `${req.receiverUid}_${req.receiverProfileId || 'default_child'}`,
              uid: req.receiverUid,
              profileId: req.receiverProfileId || 'default_child',
              username: req.receiverUsername,
              name: req.receiverUsername,
              score: 1000
            }, senderProfileId);
            storageService.declineFriendRequest(req.id, senderProfileId);
            changed = true;
          });
        }

        if (changed) {
          refreshData();
        }
      }).catch(() => {});
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

  const handleSendRequest = async (climber) => {
    soundFx.playKeyTap();
    try {
      storageService.sendFriendRequest({
        id: climber.id || climber.uid || climber.username,
        uid: climber.uid,
        profileId: climber.profileId,
        username: climber.username || climber.name,
        name: climber.name || climber.username,
        score: climber.score || 1000,
        equipped: climber.equipped || [],
        subjectsMastered: climber.subjectsMastered || 5
      });
      
      // Also send cloud request
      leaderboardService.sendCloudFriendRequest(climber, activeProfile).catch(() => {});

      refreshData();
      soundFx.playVictory();
      setActionSuccessMsg(`Friend request sent to ${climber.username || climber.name}!`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    } catch (err) {
      setSearchError(err.message || 'Could not send request.');
    }
  };

  const handleAcceptRequest = async (request) => {
    soundFx.playKeyTap();
    try {
      storageService.acceptFriendRequest(request.id);
      leaderboardService.respondToCloudFriendRequest(request.id, 'accept').catch(() => {});
      refreshData();
      soundFx.playVictory();
      setActionSuccessMsg(`Accepted friend request!`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      onFriendAdded();
    } catch (err) {
      console.warn('Accept error', err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    soundFx.playKeyTap();
    try {
      storageService.declineFriendRequest(requestId);
      leaderboardService.respondToCloudFriendRequest(requestId, 'decline').catch(() => {});
      refreshData();
    } catch (err) {
      console.warn('Decline error', err);
    }
  };

  const handleCancelRequest = async (requestId) => {
    soundFx.playKeyTap();
    try {
      storageService.cancelFriendRequest(requestId);
      leaderboardService.respondToCloudFriendRequest(requestId, 'decline').catch(() => {});
      refreshData();
    } catch (err) {
      console.warn('Cancel error', err);
    }
  };

  const handleToggleDisplay = (friend) => {
    soundFx.playKeyTap();
    try {
      const updated = storageService.toggleFriendDisplayOnMain(friend.id || friend.username);
      setFriendsList([...updated]);
      onFriendAdded(); // this just triggers re-renders where necessary
      setActionErrorMsg('');
    } catch (err) {
      setActionErrorMsg(err.message);
      setTimeout(() => setActionErrorMsg(''), 3000);
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

  const receivedRequests = friendRequests.filter(r => r.type === 'received');
  const sentRequests = friendRequests.filter(r => r.type === 'sent');

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
        <div className="text-center mb-3 shrink-0">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-2 border-2 border-indigo-300 text-indigo-600">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black text-slate-800">Friends & Classmates</h2>
          <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" /> Child-Safe Mutual Connections (No Chat)
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-3 shrink-0">
          <button
            type="button"
            onClick={() => { soundFx.playKeyTap(); setActiveTab('friends'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'friends' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Friends ({friendsList.length})
          </button>
          <button
            type="button"
            onClick={() => { soundFx.playKeyTap(); setActiveTab('requests'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Requests
            {receivedRequests.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-black">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { soundFx.playKeyTap(); setActiveTab('search'); }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Find Friends
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          
          {activeTab === 'search' && (
            <>
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
                      const hasPending = storageService.hasPendingRequestWith(climber.id || climber.username);

                      return (
                        <div 
                          key={climber.id || climber.username}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden relative shadow-sm">
                              <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                                <Mascot mood="happy" state="idle" equipped={climber.equipped || []} size={40} className="w-full h-full" />
                              </div>
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
                          ) : hasPending ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5" /> Requested
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSendRequest(climber)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Ask to Friend
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Invite Link Card */}
              <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Share Invite Link
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    Friends get 500 Sparks & you earn exclusive rewards!
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
            </>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {/* Received Requests */}
              <div className="space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Received Friend Requests</span>
                  <span className="text-indigo-600 font-bold">{receivedRequests.length}</span>
                </h3>

                {receivedRequests.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-500">No incoming friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receivedRequests.map((req) => (
                      <div key={req.id} className="bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden relative shadow-sm">
                            <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                              <Mascot mood="happy" state="idle" equipped={req.equipped || []} size={36} className="w-full h-full" />
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-extrabold text-xs text-slate-800 truncate">
                              {req.senderUsername || req.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-semibold">
                              Wants to be friends!
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAcceptRequest(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineRequest(req.id)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Requests */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center justify-between">
                  <span>Sent Requests (Awaiting Approval)</span>
                  <span className="text-slate-400 font-bold">{sentRequests.length}</span>
                </h3>

                {sentRequests.length === 0 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <p className="text-xs font-bold text-slate-500">No outgoing pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentRequests.map((req) => (
                      <div key={req.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden relative shadow-sm">
                            <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                              <Mascot mood="happy" state="idle" equipped={req.equipped || []} size={32} className="w-full h-full" />
                            </div>
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-extrabold text-xs text-slate-800 truncate">
                              {req.receiverUsername || req.name}
                            </div>
                            <div className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> Awaiting response
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelRequest(req.id)}
                          className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Accepted Friends ({friendsList.length}/25)
                  <span className="ml-2 text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    {friendsList.filter(f => f.isDisplayedOnMain).length}/2 Starred
                  </span>
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Max 25</span>
              </div>
              {actionErrorMsg && (
                <p className="text-xs font-bold text-rose-500 px-1 text-center bg-rose-50 border border-rose-100 rounded-lg py-1.5 mb-2">
                  {actionErrorMsg}
                </p>
              )}

              {friendsList.length === 0 ? (
                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-1">
                  <p className="text-xs font-bold text-slate-600">No mutual friends yet</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Send a friend request in the "Find Friends" tab to start comparing scores!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {friendsList.map((friend) => (
                    <div 
                      key={friend.id || friend.username}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden relative shadow-sm">
                          <div className="absolute inset-0 flex items-center justify-center scale-90 sm:scale-95">
                            <Mascot mood="happy" state="idle" equipped={friend.equipped || []} size={40} className="w-full h-full" />
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-extrabold text-sm text-slate-800 truncate">
                            {friend.username || friend.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold">
                            Mutual Climber Friend
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleDisplay(friend)}
                          title={friend.isDisplayedOnMain ? "Unstar" : "Star to show on Home"}
                          className={`px-2 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold ${
                            friend.isDisplayedOnMain
                              ? 'text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                              : 'text-slate-500 bg-slate-100 border border-slate-200 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${friend.isDisplayedOnMain ? 'fill-amber-500 text-amber-500' : ''}`} />
                          {friend.isDisplayedOnMain ? 'Starred' : 'Star (Max 2)'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFriend(friend.id || friend.username)}
                          title="Remove Friend"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


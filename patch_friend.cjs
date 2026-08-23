const fs = require('fs');
let code = fs.readFileSync('src/components/AddFriendModal.jsx', 'utf8');

// 1. Import Star icon
code = code.replace("Sparkles, Copy", "Sparkles, Star, Copy");

// 2. Add actionErrorMsg state
code = code.replace(
  "const [actionSuccessMsg, setActionSuccessMsg] = useState('');",
  "const [actionSuccessMsg, setActionSuccessMsg] = useState('');\n  const [actionErrorMsg, setActionErrorMsg] = useState('');"
);

// 3. Clear actionErrorMsg on isOpen
code = code.replace(
  "setActionSuccessMsg('');",
  "setActionSuccessMsg('');\n      setActionErrorMsg('');"
);

// 4. Update handleToggleDisplay to set error message and clear it
code = code.replace(
  `  const handleToggleDisplay = (friend) => {
    soundFx.playKeyTap();
    try {
      const updated = storageService.toggleFriendDisplayOnMain(friend.id || friend.username);
      setFriendsList([...updated]);
      onFriendAdded(); // this just triggers re-renders where necessary
    } catch (err) {
      alert(err.message);
    }
  };`,
  `  const handleToggleDisplay = (friend) => {
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
  };`
);

// 5. Update header and add error message UI
const headerRegex = /<h3 className="text-xs font-black uppercase tracking-wider text-slate-600">\s*Accepted Friends \(\{friendsList\.length\}\/25\)\s*<\/h3>/g;
const replacementHeader = `<h3 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Accepted Friends ({friendsList.length}/25)
                  <span className="ml-2 text-[10px] text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                    {friendsList.filter(f => f.isDisplayedOnMain).length}/2 Starred
                  </span>
                </h3>`;
code = code.replace(headerRegex, replacementHeader);

const errorUIRegex = /<span className="text-\[11px\] text-slate-400 font-medium">Max 25<\/span>\s*<\/div>/g;
const replacementErrorUI = `<span className="text-[11px] text-slate-400 font-medium">Max 25</span>
              </div>
              {actionErrorMsg && (
                <p className="text-xs font-bold text-rose-500 px-1 text-center bg-rose-50 border border-rose-100 rounded-lg py-1.5 mb-2">
                  {actionErrorMsg}
                </p>
              )}`;
code = code.replace(errorUIRegex, replacementErrorUI);

// 6. Update the button for toggling star
const buttonRegex = /<button\s*type="button"\s*onClick=\{\(\) => handleToggleDisplay\(friend\)\}\s*title=\{friend\.isDisplayedOnMain \? "Remove from Main Page" : "Show on Main Page"\}\s*className=\{`p-1\.5 rounded-lg transition-all cursor-pointer flex items-center justify-center \$\{\s*friend\.isDisplayedOnMain\s*\?\s*'text-amber-500 bg-amber-50 hover:bg-amber-100'\s*:\s*'text-slate-400 hover:text-amber-500 hover:bg-amber-50'\s*\}\`\}\s*>\s*<Sparkles className="w-4 h-4" \/>\s*<\/button>/g;

const replacementButton = `<button
                          type="button"
                          onClick={() => handleToggleDisplay(friend)}
                          title={friend.isDisplayedOnMain ? "Unstar" : "Star to show on Home"}
                          className={\`px-2 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold \${
                            friend.isDisplayedOnMain
                              ? 'text-amber-600 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                              : 'text-slate-500 bg-slate-100 border border-slate-200 hover:text-amber-600 hover:bg-amber-50'
                          }\`}
                        >
                          <Star className={\`w-3.5 h-3.5 \${friend.isDisplayedOnMain ? 'fill-amber-500 text-amber-500' : ''}\`} />
                          {friend.isDisplayedOnMain ? 'Starred' : 'Star (Max 2)'}
                        </button>`;
code = code.replace(buttonRegex, replacementButton);

fs.writeFileSync('src/components/AddFriendModal.jsx', code);

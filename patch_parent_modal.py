import re

with open('src/components/ParentDashboardModal.jsx', 'r') as f:
    content = f.read()

# Replace activeProfileId with viewingProfileId
content = content.replace("const [activeProfileId, setActiveProfileId] = useState(() => storageService.getActiveProfileId());",
                          "const [viewingProfileId, setViewingProfileId] = useState(() => storageService.getActiveProfileId());")

content = content.replace("const activeProf = profilesList.find((p) => p.id === activeProfileId) || storageService.getActiveProfile();",
                          "const activeProf = profilesList.find((p) => p.id === viewingProfileId) || storageService.getActiveProfile();")

content = content.replace("storageService.updateProfile(activeProfileId, { name: editChildName.trim() });",
                          "storageService.updateProfile(viewingProfileId, { name: editChildName.trim() });")

content = content.replace("const isActive = p.id === activeProfileId;",
                          "const isActive = p.id === viewingProfileId;")

content = content.replace("Active Child Profile", "Viewing Child Profile")

# Update handleSwitchProfile
old_switch = """  const handleSwitchProfile = (pId) => {
    soundFx.playKeyTap();
    storageService.setActiveProfileId(pId);
    setActiveProfileId(pId);
    setLiveUserData(storageService.getUserData());
    setShowEditProfile(false);
    if (onProfileSwitch) onProfileSwitch();
  };"""

new_switch = """  const handleSwitchProfile = (pId) => {
    soundFx.playKeyTap();
    setViewingProfileId(pId);
    const profile = storageService.getProfileById(pId);
    setLiveUserData(profile ? profile.userData : storageService.getUserData());
    setShowEditProfile(false);
  };"""

content = content.replace(old_switch, new_switch)

# Update handleCreateProfile
old_create = """  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    soundFx.playVictory();
    const newProf = storageService.createProfile(newChildName.trim(), newChildGrade);
    setProfilesList(storageService.getAllProfiles());
    setActiveProfileId(newProf.id);
    setLiveUserData(storageService.getUserData());
    setNewChildName('');
    setShowNewChildInput(false);
    if (onProfileSwitch) onProfileSwitch();
  };"""

new_create = """  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    soundFx.playVictory();
    const newProf = storageService.createProfile(newChildName.trim(), newChildGrade);
    setProfilesList(storageService.getAllProfiles());
    setViewingProfileId(newProf.id);
    setLiveUserData(newProf.userData);
    setNewChildName('');
    setShowNewChildInput(false);
  };"""

content = content.replace(old_create, new_create)


# Update handleDeleteProfile
old_delete = """  const handleDeleteProfile = (pId) => {
    if (profilesList.length <= 1) {
      alert('Cannot delete sole profile. Create another profile first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this child profile and its progress?')) {
      soundFx.playIncorrect();
      storageService.deleteProfile(pId);
      const updatedList = storageService.getAllProfiles();
      setProfilesList(updatedList);
      const newActive = storageService.getActiveProfileId();
      setActiveProfileId(newActive);
      setLiveUserData(storageService.getUserData());
      setShowEditProfile(false);
      if (onProfileSwitch) onProfileSwitch();
    }
  };"""

new_delete = """  const handleDeleteProfile = (pId) => {
    if (profilesList.length <= 1) {
      alert('Cannot delete sole profile. Create another profile first.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this child profile and its progress?')) {
      soundFx.playIncorrect();
      storageService.deleteProfile(pId);
      const updatedList = storageService.getAllProfiles();
      setProfilesList(updatedList);
      const newActive = storageService.getActiveProfileId();
      setViewingProfileId(newActive);
      const profile = storageService.getProfileById(newActive);
      setLiveUserData(profile ? profile.userData : storageService.getUserData());
      setShowEditProfile(false);
      if (onProfileSwitch) onProfileSwitch();
    }
  };"""

content = content.replace(old_delete, new_delete)

# Also update the periodic fetching in useEffect
old_useeffect = """  useEffect(() => {
    if (!isOpen) return;

    setLiveUserData(storageService.getUserData());
    const interval = setInterval(() => {
      setLiveUserData(storageService.getUserData());
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);"""

new_useeffect = """  useEffect(() => {
    if (!isOpen) return;
    const fetchUserData = () => {
      const p = storageService.getProfileById(viewingProfileId);
      setLiveUserData(p ? p.userData : storageService.getUserData());
    };
    fetchUserData();
    const interval = setInterval(fetchUserData, 3000);
    return () => clearInterval(interval);
  }, [isOpen, viewingProfileId]);"""

content = content.replace(old_useeffect, new_useeffect)

# Update the use of `liveUserData` where it defaults to `storageService.getUserData()`
# It is fine because `liveUserData` is correctly set, but some places might rely on App.jsx props
# e.g. streak, sparks, tier props from ParentDashboardModal

with open('src/components/ParentDashboardModal.jsx', 'w') as f:
    f.write(content)

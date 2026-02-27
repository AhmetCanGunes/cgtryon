import React, { useState } from 'react';
import { updateUserProfile } from '../services/firebase';

// Avatar seçenekleri
export const AVATAR_OPTIONS = [
  { id: 'blue', gradient: 'from-blue-500 to-blue-600', icon: 'person' },
  { id: 'purple', gradient: 'from-purple-500 to-purple-600', icon: 'person' },
  { id: 'green', gradient: 'from-emerald-500 to-emerald-600', icon: 'person' },
  { id: 'orange', gradient: 'from-orange-500 to-orange-600', icon: 'person' },
  { id: 'pink', gradient: 'from-pink-500 to-pink-600', icon: 'person' },
  { id: 'cyan', gradient: 'from-cyan-500 to-cyan-600', icon: 'person' },
  { id: 'red', gradient: 'from-red-500 to-red-600', icon: 'person' },
  { id: 'yellow', gradient: 'from-yellow-500 to-yellow-600', icon: 'person' },
  { id: 'indigo', gradient: 'from-indigo-500 to-indigo-600', icon: 'person' },
  { id: 'teal', gradient: 'from-teal-500 to-teal-600', icon: 'person' },
  { id: 'rose', gradient: 'from-rose-500 to-rose-600', icon: 'person' },
  { id: 'amber', gradient: 'from-amber-500 to-amber-600', icon: 'person' },
];

export const getAvatarById = (id: string) => {
  return AVATAR_OPTIONS.find(a => a.id === id) || AVATAR_OPTIONS[0];
};

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName?: string;
  currentAvatarId?: string;
  onProfileUpdate: (name: string, avatarId: string) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentName = '',
  currentAvatarId = 'blue',
  onProfileUpdate
}) => {
  const [displayName, setDisplayName] = useState(currentName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      const updates: { displayName?: string; avatarId?: string } = {};

      if (displayName !== currentName) {
        updates.displayName = displayName;
      }

      if (selectedAvatar !== currentAvatarId) {
        updates.avatarId = selectedAvatar;
      }

      if (Object.keys(updates).length > 0) {
        const success = await updateUserProfile(userId, updates);
        if (success) {
          onProfileUpdate(displayName, selectedAvatar);
          onClose();
        } else {
          setError('Profil güncellenirken bir hata oluştu');
        }
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitial = () => {
    if (displayName) return displayName.charAt(0).toUpperCase();
    return 'U';
  };

  const currentAvatarStyle = getAvatarById(selectedAvatar);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-card-dark to-background-dark border border-border-dark rounded-3xl p-8 max-w-md w-full mx-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Profili Düzenle</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${currentAvatarStyle.gradient} flex items-center justify-center border-4 border-white/20 shadow-lg`}>
            <span className="text-3xl font-bold text-white">{getInitial()}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">Avatar seçin</p>
        </div>

        {/* Avatar Selection Grid */}
        <div className="grid grid-cols-6 gap-2 mb-6 p-3 bg-white/5 rounded-xl border border-border-dark">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => setSelectedAvatar(avatar.id)}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} flex items-center justify-center transition-all hover:scale-110 ${
                selectedAvatar === avatar.id
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-background-dark scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-white text-xs font-bold">{getInitial()}</span>
            </button>
          ))}
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Görünen İsim
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="İsminizi girin..."
            className="w-full px-4 py-3 bg-white/5 border border-border-dark rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            maxLength={50}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-400 bg-white/5 hover:bg-white/10 transition-all border border-border-dark"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <span className="material-icons-round text-lg">check</span>
                Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;

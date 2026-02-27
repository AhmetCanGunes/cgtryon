import React, { useState, useRef, useEffect } from 'react';
import { useBlobUrl } from '../hooks/useBlobUrl';
import { cn } from '../lib/utils';

interface Persona {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  status: 'active' | 'inactive';
  niche?: string;
  createdAt: string;
}

interface PersonasModeProps {
  userCredits?: number;
  isUserAdmin?: boolean;
  onShowPricing?: () => void;
}

const PersonasMode: React.FC<PersonasModeProps> = ({
  userCredits = 0,
  isUserAdmin = false,
  onShowPricing
}) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [nicheFilter, setNicheFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // New persona form
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaDescription, setNewPersonaDescription] = useState('');
  const [newPersonaImage, setNewPersonaImage] = useState<File | null>(null);
  const [newPersonaNiche, setNewPersonaNiche] = useState('fashion');

  // Blob URL management — guaranteed cleanup via useBlobUrl hook
  const newPersonaPreview = useBlobUrl(newPersonaImage);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load personas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cgtryon_personas');
    if (saved) {
      setPersonas(JSON.parse(saved));
    }
  }, []);

  // Save personas to localStorage
  const savePersonas = (updatedPersonas: Persona[]) => {
    localStorage.setItem('cgtryon_personas', JSON.stringify(updatedPersonas));
    setPersonas(updatedPersonas);
  };

  const handleAddPersona = () => {
    if (!newPersonaName || !newPersonaImage) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPersona: Persona = {
        id: `persona_${Date.now()}`,
        name: newPersonaName,
        imageUrl: reader.result as string,
        description: newPersonaDescription,
        status: 'active',
        niche: newPersonaNiche,
        createdAt: new Date().toISOString()
      };

      savePersonas([...personas, newPersona]);
      setShowAddModal(false);
      setNewPersonaName('');
      setNewPersonaDescription('');
      setNewPersonaImage(null);
      setNewPersonaNiche('fashion');
    };
    reader.readAsDataURL(newPersonaImage);
  };

  const handleDeletePersona = (id: string) => {
    const updated = personas.filter(p => p.id !== id);
    savePersonas(updated);
    if (selectedPersona?.id === id) {
      setSelectedPersona(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = personas.map(p =>
      p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' as const : 'active' as const } : p
    );
    savePersonas(updated);
    if (selectedPersona?.id === id) {
      setSelectedPersona(updated.find(p => p.id === id) || null);
    }
  };

  const filteredPersonas = personas.filter(p => {
    const matchesText = p.name.toLowerCase().includes(filterText.toLowerCase()) ||
                       p.description.toLowerCase().includes(filterText.toLowerCase());
    const matchesNiche = nicheFilter === 'all' || p.niche === nicheFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesText && matchesNiche && matchesStatus;
  });

  const niches = ['fashion', 'lifestyle', 'fitness', 'beauty', 'travel', 'food', 'tech'];

  return (
    <div className="flex h-full w-full bg-background-dark">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border-dark shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Personas</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {personas.filter(p => p.status === 'active').length} Active
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-full text-sm font-bold hover:opacity-90 transition-all"
          >
            <span className="material-icons-round text-lg">add</span>
            New Persona
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border-dark flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg">search</span>
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter personas..."
              className="w-full pl-10 pr-4 py-2 bg-card-dark border border-border-dark rounded-lg text-sm text-white placeholder-slate-500 focus:border-primary/50 outline-none transition-all"
            />
          </div>

          {/* Niche Filter */}
          <div className="relative">
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-card-dark border border-border-dark rounded-lg text-sm text-white focus:border-primary/50 outline-none transition-all cursor-pointer"
            >
              <option value="all">Niche: All</option>
              {niches.map(n => (
                <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
              ))}
            </select>
            <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">expand_more</span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-card-dark border border-border-dark rounded-lg text-sm text-white focus:border-primary/50 outline-none transition-all cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="material-icons-round absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {filteredPersonas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-card-dark rounded-full flex items-center justify-center mb-4">
                <span className="material-icons-round text-4xl text-slate-600">person_add</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No personas yet</h3>
              <p className="text-sm text-slate-500 mb-4 max-w-sm">
                Create your first AI persona to start generating consistent content with the same model.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark rounded-full text-sm font-bold hover:opacity-90 transition-all"
              >
                <span className="material-icons-round text-lg">add</span>
                Create Persona
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPersonas.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona)}
                  className={cn(
                    'group relative rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02]',
                    selectedPersona?.id === persona.id && 'ring-2 ring-primary'
                  )}
                >
                  {/* Image */}
                  <div className="aspect-[3/4] relative">
                    <img
                      src={persona.imageUrl}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Status Badge */}
                    <div className={cn(
                      'absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      persona.status === 'active'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                    )}>
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        persona.status === 'active' ? 'bg-primary' : 'bg-slate-500'
                      )} />
                      {persona.status}
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold text-sm mb-0.5">{persona.name}</h3>
                      <p className="text-slate-400 text-xs">Generated persona</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Selected Persona Details */}
      {selectedPersona && (
        <div className="w-80 border-l border-border-dark bg-card-dark flex flex-col h-full shrink-0">
          {/* Header */}
          <div className="h-12 px-4 flex items-center justify-between border-b border-border-dark">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Selected Persona</span>
            </div>
            <button
              onClick={() => setSelectedPersona(null)}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <span className="material-icons-round text-lg">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Name */}
            <div className="px-4 py-4 border-b border-border-dark">
              <h2 className="text-xl font-bold text-white">{selectedPersona.name}</h2>
            </div>

            {/* Image */}
            <div className="p-4">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={selectedPersona.imageUrl}
                  alt={selectedPersona.name}
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Actions overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <button className="flex-1 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/20 transition-all">
                    Edit Profile
                  </button>
                  <button className="flex-1 py-2 bg-primary text-background-dark rounded-lg text-xs font-bold hover:opacity-90 transition-all">
                    Generate
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <div className="px-4 pb-4">
              <button
                onClick={() => handleDeletePersona(selectedPersona.id)}
                className="w-full py-2.5 bg-transparent border border-red-500/30 rounded-lg text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all"
              >
                Delete Persona
              </button>
            </div>

            {/* Details */}
            <div className="px-4 pb-4">
              <h3 className="text-sm font-semibold text-white mb-3">Persona Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Description</span>
                  <p className="text-sm text-slate-300 mt-1">{selectedPersona.description || 'No description'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Niche</span>
                  <p className="text-sm text-slate-300 mt-1 capitalize">{selectedPersona.niche || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Status</span>
                  <button
                    onClick={() => handleToggleStatus(selectedPersona.id)}
                    className={cn(
                      'mt-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      selectedPersona.status === 'active'
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    )}
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      selectedPersona.status === 'active' ? 'bg-primary' : 'bg-slate-500'
                    )} />
                    {selectedPersona.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Created</span>
                  <p className="text-sm text-slate-300 mt-1">
                    {new Date(selectedPersona.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Persona Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card-dark rounded-2xl border border-border-dark shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Create New Persona</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Persona Image *
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'aspect-[3/4] max-h-60 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden',
                    newPersonaImage
                      ? 'border-primary/50'
                      : 'border-border-dark hover:border-primary/30'
                  )}
                >
                  {newPersonaImage ? (
                    <img
                      src={newPersonaPreview!}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <span className="material-icons-round text-3xl text-slate-500 mb-2">add_photo_alternate</span>
                      <span className="text-sm text-slate-500">Click to upload image</span>
                      <span className="text-xs text-slate-600 mt-1">PNG, JPG up to 10MB</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setNewPersonaImage(e.target.files[0])}
                />
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Name *
                </label>
                <input
                  type="text"
                  value={newPersonaName}
                  onChange={(e) => setNewPersonaName(e.target.value)}
                  placeholder="e.g., Sofia"
                  className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-lg text-sm text-white placeholder-slate-500 focus:border-primary/50 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Description
                </label>
                <textarea
                  value={newPersonaDescription}
                  onChange={(e) => setNewPersonaDescription(e.target.value)}
                  placeholder="e.g., Fashion influencer, blonde hair, casual style"
                  rows={2}
                  className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-lg text-sm text-white placeholder-slate-500 focus:border-primary/50 outline-none transition-all resize-none"
                />
              </div>

              {/* Niche */}
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 block">
                  Niche
                </label>
                <select
                  value={newPersonaNiche}
                  onChange={(e) => setNewPersonaNiche(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background-dark border border-border-dark rounded-lg text-sm text-white focus:border-primary/50 outline-none transition-all"
                >
                  {niches.map(n => (
                    <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border-dark flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-transparent border border-border-dark rounded-lg text-slate-400 text-sm font-medium hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPersona}
                disabled={!newPersonaName || !newPersonaImage}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                  newPersonaName && newPersonaImage
                    ? 'bg-primary text-background-dark hover:opacity-90'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                )}
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonasMode;

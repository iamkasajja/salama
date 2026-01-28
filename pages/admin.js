import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../firebase/config';
import { Home, Plus, Edit2, Trash2, Check, Save, Eye, BarChart3, Shield, LogOut, Upload, X, Image as ImageIcon, Video } from 'lucide-react';

const NEIGHBORHOODS = ["Bandalungwa", "Barumbu", "Bumbu", "Gombe", "Kalamu", "Kasa-Vubu", "Kimbanseke", "Kinshasa", "Kintambo", "Kisenso", "Lemba", "Limete", "Lingwala", "Makala", "Maluku", "Masina", "Matete", "Mont Ngafula", "Ndjili", "Ngaba", "Ngaliema", "Ngiri-Ngiri", "Nsele", "Selembao"];
const AMENITIES_LIST = ["Wi-Fi", "AC", "Generator", "Water", "Security", "Parking", "Kitchen", "TV"];

// Session timeout configuration (in milliseconds)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
// const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours (alternative)
// const INACTIVITY_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hour (alternative)

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [editingListing, setEditingListing] = useState(null);
  
  // Timeout tracking for session management
  const timeoutRef = useRef(null);

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      console.log('Session expired due to inactivity');
      alert('Votre session a expiré. Veuillez vous reconnecter.');
      await signOut(auth);
    }, INACTIVITY_TIMEOUT);
  };

  // Setup activity listeners
  useEffect(() => {
    if (!user) return;

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    // Start initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) { fetchListings(); }
    });
    return unsubscribe;
  }, []);

  const fetchListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'listings'));
      const listingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert('Erreur de connexion: ' + error.message);
    }
  };

  const handleLogout = async () => { 
    // Clear timeout on manual logout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await signOut(auth); 
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce logement?')) {
      try {
        await deleteDoc(doc(db, 'listings', id));
        fetchListings();
      } catch (error) {
        alert('Erreur: ' + error.message);
      }
    }
  };

  const handleSaveListing = async (listing) => {
    try {
      if (listing.id) {
        await updateDoc(doc(db, 'listings', listing.id), listing);
      } else {
        await addDoc(collection(db, 'listings'), listing);
      }
      fetchListings();
      setView('listings');
      setEditingListing(null);
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!user) {
    return <LoginScreen email={email} setEmail={setEmail} password={password} setPassword={setPassword} onLogin={handleLogin} />;
  }

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.is_active).length,
    verifiedListings: listings.filter(l => l.is_verified).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Salama Admin</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.open('/', '_blank')} className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Voir le site</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <NavButton icon={<BarChart3 className="w-5 h-5" />} label="Tableau de bord" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
              <NavButton icon={<Home className="w-5 h-5" />} label="Logements" active={view === 'listings' || view === 'edit'} onClick={() => setView('listings')} />
            </nav>
          </aside>

          <main className="flex-1">
            {view === 'dashboard' && <DashboardView stats={stats} />}
            {view === 'listings' && (
              <ListingsView
                listings={listings}
                onEdit={(listing) => { setEditingListing(listing); setView('edit'); }}
                onDelete={handleDeleteListing}
                onNew={() => {
                  setEditingListing({ title: '', neighborhood: 'Gombe', description: '', price_per_night: 0, price_per_week: 0, max_guests: 2, amenities: [], photos: [], videos: [], is_verified: false, is_active: true, internal_notes: '' });
                  setView('edit');
                }}
              />
            )}
            {view === 'edit' && (
              <EditListingView
                listing={editingListing}
                onSave={handleSaveListing}
                onCancel={() => { setView('listings'); setEditingListing(null); }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const LoginScreen = ({ email, setEmail, password, setPassword, onLogin }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="flex items-center gap-2 mb-6">
        <Home className="w-8 h-8 text-blue-600" />
        <span className="text-2xl font-bold text-gray-900">Salama Admin</span>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={onLogin} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">Connexion</button>
      </div>
    </div>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
    {icon}<span>{label}</span>
  </button>
);

const DashboardView = ({ stats }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard icon={<Home className="w-8 h-8 text-blue-600" />} title="Total Logements" value={stats.totalListings} />
      <StatCard icon={<Check className="w-8 h-8 text-green-600" />} title="Actifs" value={stats.activeListings} />
      <StatCard icon={<Shield className="w-8 h-8 text-purple-600" />} title="Vérifiés" value={stats.verifiedListings} />
    </div>
  </div>
);

const StatCard = ({ icon, title, value }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const ListingsView = ({ listings, onEdit, onDelete, onNew }) => (
  <div>
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Logements</h1>
      <button onClick={onNew} className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
        <Plus className="w-5 h-5" />Nouveau logement
      </button>
    </div>
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Logement</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commune</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Prix</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {listings.map(listing => (
            <tr key={listing.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} alt={listing.title} className="w-12 h-12 rounded object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{listing.title}</p>
                    <p className="text-sm text-gray-600">{listing.max_guests} personnes</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-700">{listing.neighborhood}</td>
              <td className="px-6 py-4"><p className="font-semibold text-gray-900">${listing.price_per_night}/nuit</p></td>
              <td className="px-6 py-4">{listing.is_active && <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded"><Check className="w-3 h-3" />Actif</span>}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(listing)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(listing.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EditListingView = ({ listing, onSave, onCancel }) => {
  const [formData, setFormData] = useState(listing);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };
  
  const handleAmenityToggle = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      handleChange('amenities', current.filter(a => a !== amenity));
    } else {
      handleChange('amenities', [...current, amenity]);
    }
  };

  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingMedia(true);
    const uploadedPhotos = [...(formData.photos || [])];
    const uploadedVideos = [...(formData.videos || [])];

    try {
      // Generate a temporary ID for new listings
      const listingId = formData.id || `temp_${Date.now()}`;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `listings/${listingId}/${fileName}`);

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload file
        console.log('Uploading to:', `listings/${listingId}/${fileName}`);
        await uploadBytes(storageRef, file);
        console.log('Upload successful, getting download URL...');
        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL);

        if (isVideo) {
          uploadedVideos.push(downloadURL);
        } else {
          uploadedPhotos.push(downloadURL);
        }

        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      handleChange('photos', uploadedPhotos);
      handleChange('videos', uploadedVideos);
      setUploadProgress({});
      alert('Upload réussi!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erreur lors du téléchargement: ' + error.message + '\n\nVérifiez la console pour plus de détails.');
    } finally {
      setUploadingMedia(false);
    }
  };

  const removeMedia = (url, type) => {
    if (type === 'photo') {
      handleChange('photos', formData.photos.filter(p => p !== url));
    } else {
      handleChange('videos', formData.videos.filter(v => v !== url));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{listing.id ? 'Modifier le logement' : 'Nouveau logement'}</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titre du logement</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => handleChange('title', e.target.value)} 
            placeholder="Ex: Appartement moderne à Gombe" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => handleChange('description', e.target.value)} 
            placeholder="Décrivez le logement, ses caractéristiques, etc." 
            rows={4} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        {/* Neighborhood */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Commune</label>
          <select 
            value={formData.neighborhood} 
            onChange={(e) => handleChange('neighborhood', e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Pricing and Guests */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prix par nuit ($)</label>
            <input 
              type="number" 
              value={formData.price_per_night} 
              onChange={(e) => handleChange('price_per_night', Number(e.target.value))} 
              placeholder="50" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Prix par semaine ($)</label>
            <input 
              type="number" 
              value={formData.price_per_week} 
              onChange={(e) => handleChange('price_per_week', Number(e.target.value))} 
              placeholder="300" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre max de personnes</label>
            <input 
              type="number" 
              value={formData.max_guests} 
              onChange={(e) => handleChange('max_guests', Number(e.target.value))} 
              placeholder="2" 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Équipements</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AMENITIES_LIST.map(amenity => (
              <label key={amenity} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input 
                  type="checkbox" 
                  checked={formData.amenities?.includes(amenity)} 
                  onChange={() => handleAmenityToggle(amenity)} 
                  className="w-4 h-4" 
                />
                <span className="text-sm">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Media Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Photos et Vidéos</label>
          
          {/* Upload Button */}
          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {uploadingMedia ? 'Téléchargement en cours...' : 'Cliquer pour ajouter des photos/vidéos'}
              </span>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*" 
                onChange={handleMediaUpload} 
                className="hidden" 
                disabled={uploadingMedia}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Formats acceptés: JPG, PNG, MP4, MOV. Vous pouvez sélectionner plusieurs fichiers.</p>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="text-sm text-blue-800">
                  {fileName}: {progress}%
                </div>
              ))}
            </div>
          )}

          {/* Photos Preview */}
          {formData.photos && formData.photos.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Photos ({formData.photos.length})</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeMedia(photo, 'photo')}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                        Principal
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Preview */}
          {formData.videos && formData.videos.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Vidéos ({formData.videos.length})</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <video src={video} className="w-full h-24 object-cover rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
                      <Video className="w-8 h-8 text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(video, 'video')}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_active} 
              onChange={(e) => handleChange('is_active', e.target.checked)} 
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Actif</span>
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={formData.is_verified} 
              onChange={(e) => handleChange('is_verified', e.target.checked)} 
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">Vérifié</span>
          </label>
        </div>

        {/* Internal Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes internes (non visibles publiquement)</label>
          <textarea 
            value={formData.internal_notes} 
            onChange={(e) => handleChange('internal_notes', e.target.value)} 
            placeholder="Notes pour l'équipe..." 
            rows={3} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => onSave(formData)} 
            disabled={uploadingMedia}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
          <button 
            onClick={onCancel} 
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

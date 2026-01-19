import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { Home, Plus, Edit2, Trash2, Check, Save, Eye, BarChart3, Shield, LogOut } from 'lucide-react';

const NEIGHBORHOODS = ["Gombe", "Ngaliema", "Limete", "Ma Campagne", "Binza"];
const AMENITIES_LIST = ["Wi-Fi", "AC", "Generator", "Water", "Security", "Parking", "Kitchen", "TV"];

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [listings, setListings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [editingListing, setEditingListing] = useState(null);

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

  const handleLogout = async () => { await signOut(auth); };

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
                  setEditingListing({ title: '', neighborhood: 'Gombe', description: '', price_per_night: 0, price_per_week: 0, max_guests: 2, amenities: [], photos: [], is_verified: false, is_active: true, internal_notes: '' });
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
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quartier</th>
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
  const handleChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };
  const handleAmenityToggle = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      handleChange('amenities', current.filter(a => a !== amenity));
    } else {
      handleChange('amenities', [...current, amenity]);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{listing.id ? 'Modifier le logement' : 'Nouveau logement'}</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <input type="text" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Titre" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Description" rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <select value={formData.neighborhood} onChange={(e) => handleChange('neighborhood', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
          {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <div className="grid grid-cols-3 gap-4">
          <input type="number" value={formData.price_per_night} onChange={(e) => handleChange('price_per_night', Number(e.target.value))} placeholder="Prix/nuit" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input type="number" value={formData.price_per_week} onChange={(e) => handleChange('price_per_week', Number(e.target.value))} placeholder="Prix/semaine" className="px-4 py-3 border border-gray-300 rounded-lg" />
          <input type="number" value={formData.max_guests} onChange={(e) => handleChange('max_guests', Number(e.target.value))} placeholder="Max personnes" className="px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {AMENITIES_LIST.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" checked={formData.amenities?.includes(amenity)} onChange={() => handleAmenityToggle(amenity)} className="w-4 h-4" />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
        <input type="url" value={formData.photos?.[0] || ''} onChange={(e) => handleChange('photos', [e.target.value])} placeholder="URL de la photo" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <div className="flex gap-6">
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_active} onChange={(e) => handleChange('is_active', e.target.checked)} />Actif</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_verified} onChange={(e) => handleChange('is_verified', e.target.checked)} />Vérifié</label>
        </div>
        <textarea value={formData.internal_notes} onChange={(e) => handleChange('internal_notes', e.target.value)} placeholder="Notes internes" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        <div className="flex gap-4">
          <button onClick={() => onSave(formData)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"><Save className="w-4 h-4" />Enregistrer</button>
          <button onClick={onCancel} className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50">Annuler</button>
        </div>
      </div>
    </div>
  );
};
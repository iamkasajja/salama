import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Home, Phone, MapPin, Wifi, Wind, Zap, Users, Shield, ChevronRight } from 'lucide-react';

const AMENITY_ICONS = { "Wi-Fi": Wifi, "AC": Wind, "Generator": Zap, "Water": Users, "Security": Shield, "Parking": MapPin };

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ neighborhood: "Tous", minPrice: "", maxPrice: "", maxGuests: "" });
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try {
      const q = query(collection(db, 'listings'), where('is_active', '==', true));
      const querySnapshot = await getDocs(q);
      const listingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(listingsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    if (filters.neighborhood !== "Tous" && listing.neighborhood !== filters.neighborhood) return false;
    if (filters.minPrice && listing.price_per_night < Number(filters.minPrice)) return false;
    if (filters.maxPrice && listing.price_per_night > Number(filters.maxPrice)) return false;
    if (filters.maxGuests && listing.max_guests < Number(filters.maxGuests)) return false;
    return true;
  });

  const neighborhoods = ["Tous", ...new Set(listings.map(l => l.neighborhood))];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Salama</span>
          </a>
          <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Contact</span>
          </a>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Logements disponibles</h1>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <select value={filters.neighborhood} onChange={(e) => setFilters({...filters, neighborhood: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <input type="number" placeholder="Prix min ($/nuit)" value={filters.minPrice} onChange={(e) => setFilters({...filters, minPrice: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Prix max ($/nuit)" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="number" placeholder="Nombre de personnes" value={filters.maxGuests} onChange={(e) => setFilters({...filters, maxGuests: e.target.value})} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <p className="text-sm text-gray-600 mt-4">{filteredListings.length} logement{filteredListings.length !== 1 ? 's' : ''} trouvé{filteredListings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16"><p className="text-gray-600">Chargement des logements...</p></div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => <ListingCard key={listing.id} listing={listing} onViewDetails={() => setSelectedListing(listing)} />)}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {selectedListing && <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
    </div>
  );
}

const ListingCard = ({ listing, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      <div className="relative h-48 overflow-hidden">
        <img src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} alt={listing.title} className="w-full h-full object-cover" />
        {listing.is_verified && <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Shield className="w-3 h-3" />Vérifié</div>}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
        <div className="flex items-center gap-1 text-gray-600 mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{listing.neighborhood}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.amenities?.slice(0, 4).map(amenity => {
            const Icon = AMENITY_ICONS[amenity] || Wifi;
            return <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"><Icon className="w-3 h-3" />{amenity}</div>;
          })}
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">${listing.price_per_night}</span>
          <span className="text-sm text-gray-600">/ nuit</span>
        </div>
        <button onClick={onViewDetails} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          Voir détails
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-16">
    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun logement trouvé</h3>
    <p className="text-gray-600 mb-6">Aucun logement disponible pour ces critères. Contactez-nous sur WhatsApp.</p>
    <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"><Phone className="w-4 h-4" />Contacter sur WhatsApp</a>
  </div>
);

const ListingDetailModal = ({ listing, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <img src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} alt={listing.title} className="w-full h-64 object-cover rounded-lg mb-4" />
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-5 h-5" /><span>{listing.neighborhood}</span></div>
          <div className="flex items-center gap-2 text-gray-600"><Users className="w-5 h-5" /><span>Jusqu'à {listing.max_guests} personnes</span></div>
          {listing.description && <div><h3 className="font-semibold text-gray-900 mb-2">Description</h3><p className="text-gray-600">{listing.description}</p></div>}
          <div><h3 className="font-semibold text-gray-900 mb-2">Équipements</h3><div className="flex flex-wrap gap-2">{listing.amenities?.map(amenity => <span key={amenity} className="bg-gray-100 px-3 py-1 rounded text-sm">{amenity}</span>)}</div></div>
          <div className="border-t pt-4"><div className="text-3xl font-bold text-gray-900 mb-1">${listing.price_per_night} / nuit</div><div className="text-gray-600">${listing.price_per_week} / semaine</div></div>
          <a href={`https://wa.me/13468012310?text=Bonjour, je suis intéressé par: ${listing.title}`} target="_blank" rel="noopener noreferrer" className="block w-full px-6 py-4 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center">Réserver via WhatsApp</a>
        </div>
      </div>
    </div>
  </div>
);
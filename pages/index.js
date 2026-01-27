import { useState, useEffect } from 'react';
import { Search, MapPin, Users, DollarSign, Home, Phone, Shield } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function LandingPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState({
    neighborhood: '',
    maxPrice: '',
    minGuests: ''
  });

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, where('is_active', '==', true));
        const querySnapshot = await getDocs(q);
        
        const fetchedListings = [];
        querySnapshot.forEach((doc) => {
          fetchedListings.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setListings(fetchedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setListings([]);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    if (filters.neighborhood && listing.neighborhood !== filters.neighborhood) return false;
    if (filters.maxPrice && listing.price_per_night > parseInt(filters.maxPrice)) return false;
    if (filters.minGuests && listing.max_guests < parseInt(filters.minGuests)) return false;
    return true;
  });

  const handleBookingClick = (listing) => {
    setSelectedListing(listing);
    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Salama</span>
            </div>
            <a 
              href="https://wa.me/13468012310" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">Contact WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Logements disponibles à Kinshasa
            </h1>
            <p className="text-lg text-gray-600">
              Courts séjours sûrs et fiables. Aucune surprise.
            </p>
          </div>
        </div>
      </section>

      {/* Listings Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
              <select 
                value={filters.neighborhood} 
                onChange={(e) => setFilters({...filters, neighborhood: e.target.value})} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tous les quartiers</option>
                <option value="Gombe">Gombe</option>
                <option value="Ngaliema">Ngaliema</option>
                <option value="Limete">Limete</option>
                <option value="Ma Campagne">Ma Campagne</option>
                <option value="Binza">Binza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix maximum ($/nuit)</label>
              <input 
                type="number" 
                value={filters.maxPrice} 
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} 
                placeholder="Ex: 100" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de personnes</label>
              <input 
                type="number" 
                value={filters.minGuests} 
                onChange={(e) => setFilters({...filters, minGuests: e.target.value})} 
                placeholder="Ex: 2" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun logement trouvé</h3>
            <p className="text-gray-600 mb-6">Essayez d'ajuster vos filtres ou contactez-nous directement.</p>
            <a 
              href="https://wa.me/13468012310" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contacter sur WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard 
                key={listing.id} 
                listing={listing} 
                onClick={() => setSelectedListing(listing)} 
              />
            ))}
          </div>
        )}

        {/* Trust Signals Section - Moved Below Listings */}
        {filteredListings.length > 0 && (
          <section className="mt-16 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pourquoi choisir Salama?</h2>
              <p className="text-gray-600">Votre sécurité et confort sont nos priorités</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TrustCard 
                icon={<Shield className="w-10 h-10 text-blue-600" />} 
                title="Logements vérifiés" 
                description="Chaque logement est inspecté et approuvé par notre équipe" 
              />
              <TrustCard 
                icon={<Users className="w-10 h-10 text-blue-600" />} 
                title="Hôtes de confiance" 
                description="Propriétaires sélectionnés et fiables pour votre sécurité" 
              />
              <TrustCard 
                icon={<Phone className="w-10 h-10 text-blue-600" />} 
                title="Support local" 
                description="Assistance WhatsApp disponible pour toute question" 
              />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© 2026 Salama. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Listing Detail Modal */}
      {selectedListing && !showBookingForm && (
        <ListingDetailModal 
          listing={selectedListing} 
          onClose={() => setSelectedListing(null)} 
          onBookClick={handleBookingClick} 
        />
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <BookingForm listing={selectedListing} onClose={closeBookingForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TrustCard = ({ icon, title, description }) => (
  <div className="text-center bg-white rounded-lg p-6 shadow-sm">
    <div className="flex justify-center mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

const ListingCard = ({ listing, onClick }) => (
  <div 
    onClick={onClick} 
    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
  >
    <img 
      src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} 
      alt={listing.title} 
      className="w-full h-48 object-cover" 
    />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
        <MapPin className="w-4 h-4" />
        <span>{listing.neighborhood}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
        <Users className="w-4 h-4" />
        <span>Jusqu'à {listing.max_guests} personnes</span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">${listing.price_per_night}</div>
          <div className="text-sm text-gray-600">par nuit</div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Voir détails
        </button>
      </div>
    </div>
  </div>
);

const ListingDetailModal = ({ listing, onClose, onBookClick }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        <img 
          src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'} 
          alt={listing.title} 
          className="w-full h-64 object-cover rounded-lg mb-4" 
        />
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{listing.neighborhood}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>Jusqu'à {listing.max_guests} personnes</span>
          </div>
          {listing.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Équipements</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities && listing.amenities.map(amenity => (
                <span key={amenity} className="bg-gray-100 px-3 py-1 rounded text-sm">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              ${listing.price_per_night} / nuit
            </div>
            <div className="text-gray-600">${listing.price_per_week} / semaine</div>
          </div>
          <button 
            onClick={() => onBookClick(listing)} 
            className="block w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
          >
            Réserver maintenant
          </button>
          <p className="text-sm text-gray-500 text-center">
            Vous recevrez une confirmation par email et WhatsApp s'ouvrira automatiquement
          </p>
        </div>
      </div>
    </div>
  </div>
);

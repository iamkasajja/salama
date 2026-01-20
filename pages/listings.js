import { useState, useEffect } from 'react';
import { Search, MapPin, Users, DollarSign, Home, Phone } from 'lucide-react';
import BookingForm from '../components/BookingForm';

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filters, setFilters] = useState({
    neighborhood: '',
    maxPrice: '',
    minGuests: ''
  });

  useEffect(() => {
    const mockListings = [
      {
        id: 1,
        title: "Modern 1BR in Gombe",
        neighborhood: "Gombe",
        description: "Beautiful apartment in the heart of Gombe with modern amenities.",
        price_per_night: 60,
        price_per_week: 350,
        max_guests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["WiFi", "Air Conditioning", "Kitchen", "TV"],
        photos: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        is_active: true
      },
      {
        id: 2,
        title: "Spacious 2BR in Kinshasa",
        neighborhood: "Kinshasa",
        description: "Comfortable 2-bedroom apartment perfect for families.",
        price_per_night: 80,
        price_per_week: 500,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        amenities: ["WiFi", "Air Conditioning", "Kitchen", "Parking", "TV"],
        photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        is_active: true
      }
    ];
    setListings(mockListings);
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
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-blue-600">Salama</a>
            <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Phone className="w-4 h-4" />
              Contact
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Logements disponibles</h1>
          <p className="text-gray-600">Trouvez votre logement ideal a Kinshasa</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
              <select value={filters.neighborhood} onChange={(e) => setFilters({...filters, neighborhood: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les quartiers</option>
                <option value="Gombe">Gombe</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Ngaliema">Ngaliema</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix maximum ($/nuit)</label>
              <input type="number" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} placeholder="Ex: 100" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de personnes</label>
              <input type="number" value={filters.minGuests} onChange={(e) => setFilters({...filters, minGuests: e.target.value})} placeholder="Ex: 2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun logement trouve</h3>
            <p className="text-gray-600 mb-6">Essayez d ajuster vos filtres ou contactez-nous directement.</p>
            <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              <Phone className="w-4 h-4" />
              Contacter sur WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map(listing => (
              <ListingCard key={listing.id} listing={listing} onClick={() => setSelectedListing(listing)} />
            ))}
          </div>
        )}
      </main>

      {selectedListing && !showBookingForm && (
        <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} onBookClick={handleBookingClick} />
      )}

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

const ListingCard = ({ listing, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden">
    <img src={listing.photos[0]} alt={listing.title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
        <MapPin className="w-4 h-4" />
        <span>{listing.neighborhood}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
        <Users className="w-4 h-4" />
        <span>Jusqu a {listing.max_guests} personnes</span>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-2xl font-bold text-gray-900">${listing.price_per_night}</div>
          <div className="text-sm text-gray-600">par nuit</div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Voir details</button>
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">x</button>
        </div>
        <img src={listing.photos[0]} alt={listing.title} className="w-full h-64 object-cover rounded-lg mb-4" />
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{listing.neighborhood}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-5 h-5" />
            <span>Jusqu a {listing.max_guests} personnes</span>
          </div>
          {listing.description && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{listing.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Equipements</h3>
            <div className="flex flex-wrap gap-2">
              {listing.amenities && listing.amenities.map(amenity => (
                <span key={amenity} className="bg-gray-100 px-3 py-1 rounded text-sm">{amenity}</span>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="text-3xl font-bold text-gray-900 mb-1">${listing.price_per_night} / nuit</div>
            <div className="text-gray-600">${listing.price_per_week} / semaine</div>
          </div>
          <button onClick={() => onBookClick(listing)} className="block w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center">Reserver maintenant</button>
          <p className="text-sm text-gray-500 text-center">Vous recevrez une confirmation par email et WhatsApp s ouvrira automatiquement</p>
        </div>
      </div>
    </div>
  </div>
);
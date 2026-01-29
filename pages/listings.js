import { useState, useEffect } from 'react';
import { Search, MapPin, Users, DollarSign, Home, Phone } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
      // Fallback to empty if Firebase fails
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
              <select value={filters.neighborhood} onChange={(e) => setFilters({...filters, neighborhood: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les communes</option>
                <option value="Bandalungwa">Bandalungwa</option>
                <option value="Barumbu">Barumbu</option>
                <option value="Bumbu">Bumbu</option>
                <option value="Gombe">Gombe</option>
                <option value="Kalamu">Kalamu</option>
                <option value="Kasa-Vubu">Kasa-Vubu</option>
                <option value="Kimbanseke">Kimbanseke</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Kintambo">Kintambo</option>
                <option value="Kisenso">Kisenso</option>
                <option value="Lemba">Lemba</option>
                <option value="Limete">Limete</option>
                <option value="Lingwala">Lingwala</option>
                <option value="Makala">Makala</option>
                <option value="Maluku">Maluku</option>
                <option value="Masina">Masina</option>
                <option value="Matete">Matete</option>
                <option value="Mont Ngafula">Mont Ngafula</option>
                <option value="Ndjili">Ndjili</option>
                <option value="Ngaba">Ngaba</option>
                <option value="Ngaliema">Ngaliema</option>
                <option value="Ngiri-Ngiri">Ngiri-Ngiri</option>
                <option value="Nsele">Nsele</option>
                <option value="Selembao">Selembao</option>
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

const ListingDetailModal = ({ listing, onClose, onBookClick }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Combine photos and videos into one media array
  const media = [];
  if (listing.photos && listing.photos.length > 0) {
    listing.photos.forEach(photo => media.push({ type: 'photo', url: photo }));
  }
  if (listing.videos && listing.videos.length > 0) {
    listing.videos.forEach(video => media.push({ type: 'video', url: video }));
  }
  
  // Fallback if no media
  if (media.length === 0) {
    media.push({ type: 'photo', url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800' });
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % media.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToPhoto = (index) => {
    setCurrentPhotoIndex(index);
  };

  const currentMedia = media[currentPhotoIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{listing.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
          </div>
          
          {/* Image/Video Carousel */}
          <div className="relative mb-4">
            {currentMedia.type === 'photo' ? (
              <img 
                src={currentMedia.url} 
                alt={`${listing.title} - Photo ${currentPhotoIndex + 1}`} 
                className="w-full h-64 object-contain bg-gray-100 rounded-lg" 
              />
            ) : (
              <video 
                src={currentMedia.url} 
                controls
                className="w-full h-64 bg-gray-100 rounded-lg"
              >
                Votre navigateur ne supporte pas les vidéos.
              </video>
            )}
            
            {/* Navigation Arrows - Only show if multiple media */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                  aria-label="Média précédent"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all"
                  aria-label="Média suivant"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Media Counter */}
                <div className="absolute top-2 right-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                  {currentPhotoIndex + 1} / {media.length}
                </div>
              </>
            )}

            {/* Dot Indicators */}
            {media.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => goToPhoto(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentPhotoIndex 
                        ? 'bg-blue-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Aller au média ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

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
};
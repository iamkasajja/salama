// BookingForm component with EMAIL + WhatsApp integration

import { useState } from 'react';
import { Calendar, Users, Phone, Mail, MessageCircle, Loader2 } from 'lucide-react';

export default function BookingForm({ listing, onClose }) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestWhatsapp: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 2,
    purposeOfStay: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return nights * listing.price_per_night;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.guestName || !formData.guestEmail || !formData.guestPhone || 
        !formData.checkInDate || !formData.checkOutDate) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      alert('La date de départ doit être après la date d\'arrivée');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send Email Notifications (Admin + Guest)
      const emailResponse = await fetch('/api/send-booking-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          guestWhatsapp: formData.guestWhatsapp,
          listingTitle: listing.title,
          listingId: listing.id,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfGuests: formData.numberOfGuests,
          totalPrice: calculateTotal(),
          nights: nights,
          pricePerNight: listing.price_per_night
        })
      });

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        throw new Error('Failed to send email notifications');
      }

      // Also open WhatsApp for immediate contact
      const whatsappMessage = `Bonjour! Je viens de soumettre une demande de réservation via le site.

Logement: ${listing.title}
Dates: ${formData.checkInDate} → ${formData.checkOutDate}
Personnes: ${formData.numberOfGuests}
Total: $${calculateTotal()}

J'attends votre confirmation. Merci!`;

      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/13468012310?text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Show success message
      setSubmitStatus('success');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Booking submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view
  if (submitStatus === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée!</h3>
        <p className="text-gray-600 mb-4">
          Nous avons bien reçu votre demande. Vous recevrez une confirmation par email.
        </p>
        <p className="text-sm text-gray-500">
          WhatsApp s'ouvre dans un nouvel onglet pour que vous puissiez nous contacter directement.
        </p>
      </div>
    );
  }

  // Error view
  if (submitStatus === 'error') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h3>
        <p className="text-gray-600 mb-4">
          Une erreur s'est produite. Veuillez réessayer ou nous contacter sur WhatsApp.
        </p>
        <button
          onClick={() => setSubmitStatus(null)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Form view
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Demande de réservation
        </h3>
        <p className="text-gray-600">
          {listing.title} - ${listing.price_per_night}/nuit
        </p>
      </div>

      {/* Guest Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet *
          </label>
          <input
            type="text"
            value={formData.guestName}
            onChange={(e) => handleChange('guestName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jean Dupont"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={formData.guestEmail}
              onChange={(e) => handleChange('guestEmail', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="jean@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Téléphone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.guestPhone}
              onChange={(e) => handleChange('guestPhone', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+243 XXX XXX XXX"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp (optionnel)
          </label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.guestWhatsapp}
              onChange={(e) => handleChange('guestWhatsapp', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+243 XXX XXX XXX"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Si différent de votre numéro de téléphone
          </p>
        </div>
      </div>

      {/* Booking Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date d'arrivée *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.checkInDate}
              onChange={(e) => handleChange('checkInDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date de départ *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={formData.checkOutDate}
              onChange={(e) => handleChange('checkOutDate', e.target.value)}
              min={formData.checkInDate || new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Number of Guests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre de personnes
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={formData.numberOfGuests}
            onChange={(e) => handleChange('numberOfGuests', parseInt(e.target.value))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Purpose of Stay (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Raison du séjour (optionnel)
        </label>
        <textarea
          value={formData.purposeOfStay}
          onChange={(e) => handleChange('purposeOfStay', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tourisme, affaires, famille..."
        />
      </div>

      {/* Price Summary */}
      {calculateNights() > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">
              ${listing.price_per_night} × {calculateNights()} nuit{calculateNights() > 1 ? 's' : ''}
            </span>
            <span className="font-semibold">${calculateTotal()}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-bold text-xl text-blue-600">${calculateTotal()}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            'Envoyer la demande'
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        En soumettant cette demande, vous recevrez un email de confirmation et WhatsApp s'ouvrira pour un contact direct.
      </p>
    </form>
  );
}
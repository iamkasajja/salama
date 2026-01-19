import React from 'react';
import { Home, Shield, Phone, MapPin, Users, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Salama</span>
          </div>
          <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors">
            <Phone className="w-4 h-4" />
            <span className="font-medium">Contact WhatsApp</span>
          </a>
        </div>
      </header>

      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Logements vérifiés à Kinshasa</h1>
            <p className="text-xl text-gray-600 mb-8">Appartements sûrs et fiables pour vos courts séjours. Aucune surprise.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/listings" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg">Voir les logements</a>
              <a href="https://wa.me/13468012310" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">Contacter via WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TrustCard icon={<Shield className="w-12 h-12 text-blue-600" />} title="Appartements vérifiés" description="Chaque logement est inspecté et approuvé par notre équipe" />
            <TrustCard icon={<Users className="w-12 h-12 text-blue-600" />} title="Hôtes de confiance" description="Propriétaires sélectionnés et fiables pour votre sécurité" />
            <TrustCard icon={<Phone className="w-12 h-12 text-blue-600" />} title="Support local" description="Assistance WhatsApp disponible pour toute question" />
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>© 2026 Salama. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const TrustCard = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);
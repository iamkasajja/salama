import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ADMIN CONTACTS - Add your co-founder's email here
const ADMIN_EMAILS = [
  'kaloloraoul@gmail.com',  // Your email
  'dadakalulu01@gmail.com'   // Replace with your co-founder's email
];

// WHATSAPP NUMBERS - Add your co-founder's WhatsApp here
const WHATSAPP_NUMBERS = [
  '13468012310',           // Your WhatsApp
  '243999092264'             // Replace with co-founder's WhatsApp (format: country code + number, no +)
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      guestName,
      guestEmail,
      guestPhone,
      guestWhatsapp,
      listingTitle,
      listingId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      nights,
      pricePerNight
    } = req.body;

    // Format WhatsApp contact info for admin email
    const whatsappInfo = `
WhatsApp Contacts:
${WHATSAPP_NUMBERS.map((num, i) => `  Admin ${i + 1}: https://wa.me/${num}`).join('\n')}
Guest WhatsApp: ${guestWhatsapp ? `https://wa.me/${guestWhatsapp.replace(/[^0-9]/g, '')}` : 'Non fourni'}
    `.trim();

    // 1. Send confirmation email to GUEST
    const guestEmailResult = await resend.emails.send({
      from: 'Salama <noreply@salamacd.com>',
      to: guestEmail,
      subject: `Demande de réservation reçue - ${listingTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .total { font-size: 1.5em; color: #2563eb; font-weight: bold; }
            .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Salama</h1>
              <p>Votre demande de réservation a été reçue</p>
            </div>
            <div class="content">
              <h2>Bonjour ${guestName},</h2>
              <p>Nous avons bien reçu votre demande de réservation. Notre équipe va l'examiner et vous contacter sous peu.</p>
              
              <div class="booking-details">
                <h3>Détails de la réservation</h3>
                <div class="detail-row">
                  <span class="detail-label">Logement:</span>
                  <span>${listingTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date d'arrivée:</span>
                  <span>${checkInDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date de départ:</span>
                  <span>${checkOutDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Nombre de nuits:</span>
                  <span>${nights}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Nombre de personnes:</span>
                  <span>${numberOfGuests}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Prix par nuit:</span>
                  <span>$${pricePerNight}</span>
                </div>
                <div class="detail-row" style="border-bottom: none; margin-top: 10px;">
                  <span class="detail-label">Total:</span>
                  <span class="total">$${totalPrice}</span>
                </div>
              </div>

              <p><strong>Prochaines étapes:</strong></p>
              <ol>
                <li>Nous vérifions la disponibilité du logement</li>
                <li>Nous vous contactons par email ou WhatsApp pour confirmer</li>
                <li>Vous recevez les détails de paiement et d'accès</li>
              </ol>

              <p>Pour toute question urgente, n'hésitez pas à nous contacter:</p>
              <a href="https://wa.me/${WHATSAPP_NUMBERS[0]}" class="button">📱 Contacter sur WhatsApp</a>

              <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
                Cordialement,<br>
                L'équipe Salama
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

   // 2. Send notification email to ALL ADMINS (with delay to avoid rate limiting)
    const adminEmailResults = [];
    for (let i = 0; i < ADMIN_EMAILS.length; i++) {
      const adminEmail = ADMIN_EMAILS[i];
      
      // Add 1 second delay between emails (except for first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const result = await resend.emails.send({
          from: 'Salama Notifications <noreply@salamacd.com>',
          to: adminEmail,
          subject: `🔔 Nouvelle demande de réservation - ${listingTitle}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
                .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-label { font-weight: bold; color: #6b7280; }
                .total { font-size: 1.5em; color: #dc2626; font-weight: bold; }
                .button { display: inline-block; background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
                .contact-section { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔔 Nouvelle Demande de Réservation</h1>
                </div>
                <div class="content">
                  <h2>Action requise</h2>
                  <p>Une nouvelle demande de réservation vient d'être soumise.</p>
                  
                  <div class="booking-details">
                    <h3>Informations du client</h3>
                    <div class="detail-row">
                      <span class="detail-label">Nom:</span>
                      <span>${guestName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Email:</span>
                      <span><a href="mailto:${guestEmail}">${guestEmail}</a></span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Téléphone:</span>
                      <span>${guestPhone}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">WhatsApp:</span>
                      <span>${guestWhatsapp || 'Non fourni'}</span>
                    </div>
                  </div>

                  <div class="booking-details">
                    <h3>Détails de la réservation</h3>
                    <div class="detail-row">
                      <span class="detail-label">Logement:</span>
                      <span>${listingTitle} (ID: ${listingId})</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Dates:</span>
                      <span>${checkInDate} → ${checkOutDate}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Nuits:</span>
                      <span>${nights}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Personnes:</span>
                      <span>${numberOfGuests}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none; margin-top: 10px;">
                      <span class="detail-label">Total:</span>
                      <span class="total">$${totalPrice}</span>
                    </div>
                  </div>

                  <div class="contact-section">
                    <h3>Contacter le client</h3>
                    <p><strong>Par email:</strong></p>
                    <a href="mailto:${guestEmail}" class="button">📧 Envoyer un email</a>
                    
                    <p><strong>Par WhatsApp:</strong></p>
                    ${guestWhatsapp ? 
                      `<a href="https://wa.me/${guestWhatsapp.replace(/[^0-9]/g, '')}" class="button">💬 WhatsApp Client</a>` : 
                      `<a href="https://wa.me/${guestPhone.replace(/[^0-9]/g, '')}" class="button">💬 WhatsApp Client (via tél)</a>`
                    }
                  </div>

                  <p><strong>⏰ À faire:</strong></p>
                  <ol>
                    <li>Vérifier la disponibilité du logement pour ces dates</li>
                    <li>Contacter le client par email ou WhatsApp pour confirmer</li>
                    <li>Envoyer les détails de paiement si approuvé</li>
                    <li>Mettre à jour le calendrier de disponibilité</li>
                  </ol>

                  <p style="margin-top: 30px; padding: 15px; background: #e0f2fe; border-radius: 6px; font-size: 0.9em;">
                    <strong>Note:</strong> Le client a reçu un email de confirmation automatique.
                  </p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      
      adminEmailResults.push(result);
    }

    console.log('Guest email sent:', guestEmailResult);
    console.log('Admin emails sent:', adminEmailResults);

    return res.status(200).json({ 
      success: true, 
      message: 'Notifications sent successfully',
      whatsappNumbers: WHATSAPP_NUMBERS
    });

  } catch (error) {
    console.error('Error sending booking notifications:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

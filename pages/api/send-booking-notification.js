// API endpoint: /api/send-booking-notification.js
// This handles sending BOTH admin and guest emails when a booking is submitted

import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY);
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      pricePerNight,
      adminEmail = 'kaloloraoul@gmail.com'
    } = req.body;

    // Validate required fields
    if (!guestName || !guestEmail || !listingTitle || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Send notification to ADMIN
    const adminEmailResult = await resend.emails.send({
      from: 'Salama Notifications <onboarding@resend.dev>',
      to: adminEmail,
      subject: `🏠 Nouvelle demande Salama - ${listingTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .detail-row { margin: 15px 0; padding: 10px; background: white; border-radius: 6px; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #1f2937; margin-top: 5px; }
            .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🏠 Nouvelle demande de réservation</h1>
            </div>
            
            <div class="content">
              <div class="detail-row">
                <div class="label">Logement</div>
                <div class="value">${listingTitle}</div>
              </div>

              <div class="detail-row">
                <div class="label">Client</div>
                <div class="value">
                  ${guestName}<br>
                  Email: ${guestEmail}<br>
                  Téléphone: ${guestPhone || 'Non fourni'}<br>
                  ${guestWhatsapp ? `WhatsApp: ${guestWhatsapp}` : ''}
                </div>
              </div>

              <div class="detail-row">
                <div class="label">Dates</div>
                <div class="value">
                  Arrivée: ${checkInDate}<br>
                  Départ: ${checkOutDate}<br>
                  Durée: ${nights} nuit${nights > 1 ? 's' : ''}
                </div>
              </div>

              <div class="detail-row">
                <div class="label">Détails</div>
                <div class="value">
                  Nombre de personnes: ${numberOfGuests}<br>
                  Prix par nuit: $${pricePerNight}<br>
                  <strong>Total: $${totalPrice}</strong>
                </div>
              </div>

              <a href="https://salamacd.com/admin" class="button">
                Voir dans le panneau d'administration →
              </a>

              <div class="footer">
                <p>Cette demande a été soumise via salamacd.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Send confirmation to GUEST
    const guestEmailResult = await resend.emails.send({
      from: 'Salama <onboarding@resend.dev>',
      to: guestEmail,
      subject: 'Confirmation de votre demande - Salama',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .booking-summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
            .highlight { background: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✓ Demande reçue</h1>
            </div>
            
            <div class="content">
              <p>Bonjour ${guestName},</p>
              
              <p>Merci pour votre demande de réservation ! Nous avons bien reçu votre demande et nous vous contacterons très bientôt.</p>

              <div class="booking-summary">
                <h3 style="margin-top: 0; color: #1f2937;">Résumé de votre demande</h3>
                
                <p><strong>Logement:</strong> ${listingTitle}</p>
                <p><strong>Dates:</strong> ${checkInDate} → ${checkOutDate}</p>
                <p><strong>Durée:</strong> ${nights} nuit${nights > 1 ? 's' : ''}</p>
                <p><strong>Personnes:</strong> ${numberOfGuests}</p>
                <p><strong>Prix total estimé:</strong> $${totalPrice}</p>
              </div>

              <div class="highlight">
                <strong>Prochaines étapes:</strong><br>
                Notre équipe vous contactera sous 24 heures pour:<br>
                • Confirmer la disponibilité<br>
                • Répondre à vos questions<br>
                • Finaliser votre réservation
              </div>

              <p><strong>Besoin d'aide immédiate?</strong></p>
              <p>Contactez-nous sur WhatsApp: <a href="https://wa.me/13468012310">+1 346 801 2310</a></p>

              <div class="footer">
                <p>Cordialement,<br/>
                L'équipe Salama</p>
                <p style="margin-top: 20px; color: #9ca3af;">
                  salamacd.com<br>
                  Logements de confiance à Kinshasa
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    });

    // Return success response
    return res.status(200).json({
      success: true,
      adminEmailId: adminEmailResult.id,
      guestEmailId: guestEmailResult.id,
      message: 'Emails sent successfully'
    });

  } catch (error) {
    console.error('Error sending emails:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send emails'
    });
  }
}
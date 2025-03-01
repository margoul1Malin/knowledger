import sgMail from '@sendgrid/mail'
import twilio from 'twilio'

// Configuration des clients
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

// Générer un code à 6 chiffres
export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Envoyer le code par email via SendGrid
export async function sendTwoFactorCodeByEmail(email: string, code: string) {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Code de vérification KnowLedger',
    text: `Votre code de vérification est : ${code}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Code de vérification KnowLedger</h2>
        <p>Votre code de vérification est :</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #4F46E5;">${code}</h1>
        <p>Ce code expirera dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `
  }

  try {
    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Erreur SendGrid:', error)
    return false
  }
}

// Envoyer le code par SMS via Twilio
export async function sendTwoFactorCodeBySMS(phoneNumber: string, code: string) {
  try {
    await twilioClient.messages.create({
      body: `Votre code de vérification KnowLedger est : ${code}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    })
    return true
  } catch (error) {
    console.error('Erreur Twilio:', error)
    return false
  }
}

// Vérifier si un code est valide et non expiré
export function isCodeValid(expiresAt: Date): boolean {
  return new Date() < new Date(expiresAt)
} 
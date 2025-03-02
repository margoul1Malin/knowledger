import sgMail from '@sendgrid/mail'
import { getFormatorResponseTemplate } from './email-templates/formator-response'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

type EmailTemplate = 'FORMATOR_RESPONSE'

interface TemplateData {
  firstName: string
  lastName: string
  message: string
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
}

const templates: Record<EmailTemplate, (data: TemplateData) => string> = {
  FORMATOR_RESPONSE: (data) => getFormatorResponseTemplate(
    data.firstName,
    data.lastName,
    data.status,
    data.message
  )
}

export async function sendEmail(
  to: string,
  subject: string,
  template: EmailTemplate,
  data: TemplateData
) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html: templates[template](data)
  }

  try {
    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('Erreur envoi email:', error)
    return false
  }
} 
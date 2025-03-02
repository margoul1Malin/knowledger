import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

type EmailTemplate = 'FORMATOR_RESPONSE'

interface TemplateData {
  firstName: string
  lastName: string
  message: string
  status: 'APPROVED' | 'REJECTED' | 'PENDING'
}

const templates: Record<EmailTemplate, (data: TemplateData) => string> = {
  FORMATOR_RESPONSE: (data) => `
    <html>
    <head>
      <title>Devenir Formateur sur KnowLedger</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #444444;
          line-height: 1.6;
          background-color: #f7f7f7;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header img {
          max-width: 150px;
          margin-bottom: 10px;
        }
        .content {
          font-size: 16px;
          color: #333333;
        }
        .cta-button {
          background-color: #1e90ff;
          color: #ffffff;
          padding: 12px 25px;
          text-align: center;
          border-radius: 5px;
          display: inline-block;
          font-size: 16px;
          text-decoration: none;
          margin-top: 20px;
        }
        .cta-button:hover {
          background-color: #155d8c;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #888888;
          padding-top: 20px;
        }
        .footer a {
          color: #888888;
          text-decoration: none;
        }
        .footer a:hover {
          color: #1e90ff;
        }
        .highlight {
          color: #1e90ff;
          font-weight: bold;
        }
        .bold {
          font-weight: bold;
        }
        .w-full {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .w-large {
          width: 60%;
        }
        .status-approved {
          color: #22c55e;
          font-weight: bold;
        }
        .status-rejected {
          color: #ef4444;
          font-weight: bold;
        }
        .status-pending {
          color: #f59e0b;
          font-weight: bold;
        }
        .message-box {
          margin: 20px 0;
          padding: 20px;
          background-color: #f3f4f6;
          border-radius: 8px;
          border-left: 4px solid #1e90ff;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://your-logo-url.com/logo.png" alt="KnowLedger" />
          <h2>Réponse à votre demande de formateur</h2>
        </div>
        <div class="content">
          <p><span class="bold">Bonjour</span> ${data.firstName} ${data.lastName},</p>
          
          ${data.status === 'APPROVED' ? `
            <p class="status-approved">Félicitations ! Votre demande pour devenir formateur a été approuvée.</p>
            <p class="bold">En tant que formateur, vous aurez l'opportunité de :</p>
            <ul>
              <li><span class="highlight">Partager vos connaissances</span> avec un large public d'apprenants enthousiastes.</li>
              <li><span class="highlight">Avoir accès à tout le contenu </span>premium de la plateforme.</li>
              <li><span class="highlight">Monétiser vos compétences</span> grâce à notre système de contenu premium.</li>
            </ul>
          ` : data.status === 'REJECTED' ? `
            <p class="status-rejected">Nous avons examiné attentivement votre candidature et nous sommes au regret de vous informer que celle-ci n'a pas été retenue pour le moment.</p>
          ` : `
            <p class="status-pending">Votre demande est actuellement en cours d'examen.</p>
          `}

          <div class="message-box">
            ${data.message}
          </div>

          ${data.status === 'APPROVED' ? `
            <div class="w-full">
              <a href="${process.env.NEXTAUTH_URL}/profile/contenu" class="cta-button w-large">Accéder à mon espace formateur</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} KnowLedger. Tous droits réservés.</p>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/contact">Contact</a> |
            <a href="${process.env.NEXTAUTH_URL}/legal/terms">Conditions d'utilisation</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
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
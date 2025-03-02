export function getFormatorResponseTemplate(
  firstName: string,
  lastName: string,
  status: 'APPROVED' | 'REJECTED' | 'PENDING',
  message: string
) {
  const statusText = {
    APPROVED: 'acceptée',
    REJECTED: 'refusée',
    PENDING: 'en attente'
  }[status]

  const statusColor = {
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    PENDING: '#F59E0B'
  }[status]

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réponse à votre demande de formateur</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #374151;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 150px;
            margin-bottom: 20px;
          }
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 14px;
            color: white;
            background-color: ${statusColor};
            margin-bottom: 20px;
          }
          .content {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .message {
            margin-top: 20px;
            padding: 15px;
            background-color: #F3F4F6;
            border-radius: 6px;
            font-style: italic;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 14px;
            color: #6B7280;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563EB;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #1D4ED8;
          }
          @media (max-width: 600px) {
            .container {
              padding: 15px;
            }
            .content {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://votre-logo.com/logo.png" alt="Knowledger" class="logo">
            <div class="status-badge">
              Demande ${statusText}
            </div>
          </div>
          
          <div class="content">
            <h1 style="margin-top: 0;">Bonjour ${firstName} ${lastName},</h1>
            
            <p>Nous avons examiné votre demande pour devenir formateur sur Knowledger.</p>
            
            <div class="message">
              ${message}
            </div>
            
            ${status === 'APPROVED' ? `
              <p style="margin-top: 25px;">
                Vous pouvez dès maintenant commencer à créer du contenu sur la plateforme.
                Pour commencer, cliquez sur le bouton ci-dessous :
              </p>
              
              <div style="text-align: center;">
                <a href="https://knowledger.fr/create-content" class="button">
                  Commencer à créer du contenu
                </a>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>
              Cet email a été envoyé par Knowledger.<br>
              Si vous avez des questions, n'hésitez pas à nous contacter.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
} 
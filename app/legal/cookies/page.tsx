export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Politique des Cookies
          </h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-muted-foreground">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, mobile, tablette) 
              lors de votre visite sur notre site. Les cookies nous permettent de reconnaître votre navigateur 
              lors de vos visites suivantes et sont essentiels au bon fonctionnement de nos services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Cookies Essentiels</h2>
            <p className="text-muted-foreground mb-4">
              Notre plateforme utilise uniquement des cookies essentiels, nécessaires à son bon fonctionnement. 
              Ces cookies ne peuvent pas être désactivés car ils sont indispensables pour vous permettre de naviguer 
              sur le site et d'utiliser ses fonctionnalités.
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Liste des cookies essentiels :</h3>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">next-auth.session-token :</span> Gestion de votre session de connexion
                </li>
                <li>
                  <span className="font-medium text-foreground">next-auth.csrf-token :</span> Protection contre les attaques CSRF
                </li>
                <li>
                  <span className="font-medium text-foreground">next-auth.callback-url :</span> Gestion des redirections après authentification
                </li>
                <li>
                  <span className="font-medium text-foreground">theme :</span> Sauvegarde de vos préférences de thème (clair/sombre)
                </li>
                <li>
                  <span className="font-medium text-foreground">cookiesAccepted :</span> Mémorisation de votre acceptation des cookies
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Durée de Conservation</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Cookies de session (next-auth) :</span> Expiration après 30 jours ou à la déconnexion
                </li>
                <li>
                  <span className="font-medium text-foreground">Préférences de thème :</span> Conservation jusqu'à modification par l'utilisateur
                </li>
                <li>
                  <span className="font-medium text-foreground">Acceptation des cookies :</span> Conservation pendant 6 mois
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">4. Vos Droits</h2>
            <p className="text-muted-foreground mb-4">
              Les cookies utilisés sur notre plateforme étant exclusivement essentiels au fonctionnement du site, 
              ils ne nécessitent pas votre consentement préalable selon l'article 82 de la loi n°78-17 du 6 janvier 1978. 
              Cependant, vous pouvez :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>Supprimer les cookies existants via les paramètres de votre navigateur</li>
                <li>Configurer votre navigateur pour refuser les cookies (notez que cela peut affecter le fonctionnement du site)</li>
                <li>Nous contacter pour toute question relative à l'utilisation des cookies</li>
              </ul>
            </div>
          </section>

          <section className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">État des Cookies</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div>
                  <span className="font-medium">Cookies essentiels</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nécessaires au fonctionnement du site
                  </p>
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Toujours actifs
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function CookiesPolicy() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Politique des Cookies</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Types de Cookies Utilisés</h2>
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Cookies Essentiels</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Session d'authentification</li>
            <li>Préférences de thème (clair/sombre)</li>
            <li>État du panier d'achat</li>
            <li>Progression dans les formations</li>
          </ul>

          <h3 className="text-xl font-medium">Cookies de Personnalisation</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Préférences de contenu</li>
            <li>Historique de visionnage</li>
            <li>Recommandations personnalisées</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Gestion des Cookies</h2>
        <p>Vous pouvez à tout moment :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Accepter ou refuser les cookies non essentiels</li>
          <li>Supprimer les cookies existants</li>
          <li>Configurer votre navigateur</li>
          <li>Retirer votre consentement</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Durée de Conservation</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Cookies de session : supprimés à la fermeture du navigateur</li>
          <li>Cookies persistants : maximum 13 mois</li>
          <li>Cookies de préférences : 6 mois</li>
        </ul>
      </section>

      <section className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Panneau de Préférences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 hover:bg-secondary rounded-lg transition-colors">
            <span>Cookies essentiels</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">Toujours actifs</span>
          </div>
          
          <div className="flex items-center justify-between p-2 hover:bg-secondary rounded-lg transition-colors">
            <span>Cookies de personnalisation</span>
            <button className="px-4 py-1 border border-primary text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
              Gérer
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

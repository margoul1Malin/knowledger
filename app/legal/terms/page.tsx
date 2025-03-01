export default function Terms() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Conditions d'Utilisation
          </h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Accès aux Services</h2>
            <p className="text-muted-foreground mb-4">
              En utilisant KnowLedger, vous acceptez les conditions suivantes :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Inscription :</span> Fournir des informations exactes et à jour
                </li>
                <li>
                  <span className="font-medium text-foreground">Sécurité :</span> Maintenir la confidentialité de votre compte et mot de passe
                </li>
                <li>
                  <span className="font-medium text-foreground">Utilisation :</span> Ne pas partager vos accès aux formations premium
                </li>
                <li>
                  <span className="font-medium text-foreground">Respect :</span> Se conformer aux droits d'auteur et à la propriété intellectuelle
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Contenu et Propriété Intellectuelle</h2>
            <p className="text-muted-foreground mb-4">
              Tous les contenus présents sur KnowLedger sont protégés par le droit d'auteur :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Propriété :</span> Les formations, vidéos et articles sont la propriété exclusive de KnowLedger et ses formateurs
                </li>
                <li>
                  <span className="font-medium text-foreground">Reproduction :</span> La copie et la distribution non autorisées sont strictement interdites
                </li>
                <li>
                  <span className="font-medium text-foreground">Accès :</span> Votre accès aux contenus est personnel et non transférable
                </li>
                <li>
                  <span className="font-medium text-foreground">Code source :</span> Le code partagé dans les formations est soumis à des licences spécifiques indiquées dans chaque cours
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Paiements et Remboursements</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Sécurité :</span> Tous les paiements sont sécurisés via Stripe
                </li>
                <li>
                  <span className="font-medium text-foreground">Tarification :</span> Les prix sont affichés en euros, TTC
                </li>
                <li>
                  <span className="font-medium text-foreground">Abonnements :</span> Les abonnements premium peuvent être résiliés à tout moment
                </li>
                <li>
                  <span className="font-medium text-foreground">Remboursements :</span> Aucun remboursement ne sera effectué sauf en cas d'erreur technique de notre part
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Responsabilités</h2>
            <p className="text-muted-foreground mb-4">
              KnowLedger se réserve les droits suivants :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>Modifier ou supprimer tout contenu ou service sans préavis</li>
                <li>Suspendre ou supprimer les comptes en cas de violation des conditions</li>
                <li>Mettre à jour ces conditions d'utilisation à tout moment</li>
                <li>Limiter temporairement l'accès au site pour maintenance</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Comportement des Utilisateurs</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Respect :</span> Maintenir un comportement respectueux envers les autres utilisateurs
                </li>
                <li>
                  <span className="font-medium text-foreground">Contenu :</span> Ne pas publier de contenu illégal, offensant ou inapproprié
                </li>
                <li>
                  <span className="font-medium text-foreground">Spam :</span> Ne pas envoyer de messages non sollicités ou promotionnels
                </li>
                <li>
                  <span className="font-medium text-foreground">Sécurité :</span> Ne pas tenter de compromettre la sécurité du site
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Mise à jour des Conditions</h2>
            <p className="text-muted-foreground">
              Ces conditions d'utilisation peuvent être modifiées à tout moment. La dernière mise à jour 
              a été effectuée le 1er mars 2024. En continuant à utiliser KnowLedger après une modification 
              des conditions, vous acceptez les nouvelles conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

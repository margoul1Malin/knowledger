export default function Terms() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Conditions d'Utilisation</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Accès aux Services</h2>
        <p>En utilisant KnowLedger, vous acceptez de :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Fournir des informations exactes lors de l'inscription</li>
          <li>Maintenir la confidentialité de votre compte</li>
          <li>Ne pas partager vos accès aux formations premium</li>
          <li>Respecter les droits d'auteur des contenus</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Contenu et Propriété Intellectuelle</h2>
        <p>Tous les contenus sur KnowLedger sont protégés :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Les formations et vidéos sont notre propriété exclusive</li>
          <li>La reproduction est strictement interdite</li>
          <li>L'accès est personnel et non transférable</li>
          <li>Le code partagé est soumis à des licences spécifiques</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Paiements et Remboursements</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Les paiements sont sécurisés via Stripe</li>
          <li>Les prix sont en euros, TTC</li>
          <li>Abonnements résiliables à tout moment</li>
          <li>Aucun remboursements ne sera effectué sauf erreur de notre part</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Responsabilités</h2>
        <p>KnowLedger se réserve le droit de :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Modifier les contenus et services</li>
          <li>Suspendre les comptes en cas d'abus</li>
          <li>Mettre à jour ces conditions</li>
          <li>Limiter l'accès en cas de maintenance</li>
        </ul>
      </section>
    </div>
  )
}

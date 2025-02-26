export default function PrivacyPolicy() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-center mb-12">Politique de Confidentialité</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Collecte des Informations</h2>
        <p>Nous collectons les informations suivantes :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Informations d'identification (nom, email, photo de profil)</li>
          <li>Données de connexion et d'utilisation</li>
          <li>Historique d'apprentissage et progression</li>
          <li>Informations de paiement (via notre processeur de paiement sécurisé)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Utilisation des Données</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Personnaliser votre expérience d'apprentissage</li>
          <li>Gérer votre compte et vos accès aux formations</li>
          <li>Améliorer nos services et contenus</li>
          <li>Vous informer des mises à jour et nouvelles formations</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Contenu Embarqué</h2>
        <p>Notre site peut inclure :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Vidéos (hébergées sur des plateformes sécurisées)</li>
          <li>Images et graphiques</li>
          <li>Code interactif et exemples</li>
          <li>Contenus de formation téléchargeables</li>
        </ul>
        <p>Ces contenus peuvent collecter des données sur votre interaction avec eux.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Protection des Données</h2>
        <p>Nous protégeons vos données via :</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Chiffrement SSL/TLS</li>
          <li>Stockage sécurisé des mots de passe</li>
          <li>Accès restreint aux données personnelles</li>
          <li>Mises à jour régulières de sécurité</li>
        </ul>
      </section>
    </div>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Politique de Confidentialité
          </h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Introduction</h2>
            <p className="text-muted-foreground">
              KnowLedger s'engage à protéger la vie privée des utilisateurs de sa plateforme de formation. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, partageons 
              et protégeons vos informations personnelles conformément au Règlement Général sur la Protection 
              des Données (RGPD).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. Données Collectées</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Nous collectons les informations suivantes :</h3>
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Informations de compte :</span> Nom, adresse email, mot de passe crypté
                </li>
                <li>
                  <span className="font-medium text-foreground">Informations de profil :</span> Photo de profil, biographie, compétences (optionnel)
                </li>
                <li>
                  <span className="font-medium text-foreground">Données d'utilisation :</span> Historique des contenus consultés, achats, commentaires
                </li>
                <li>
                  <span className="font-medium text-foreground">Données de formateur :</span> CV, compétences, types de contenus souhaités (pour les candidatures formateur)
                </li>
                <li>
                  <span className="font-medium text-foreground">Données techniques :</span> Adresse IP, type de navigateur, cookies essentiels
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. Utilisation des Données</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Fourniture du service :</span> Gestion de votre compte, accès aux contenus, traitement des paiements
                </li>
                <li>
                  <span className="font-medium text-foreground">Personnalisation :</span> Recommandations de contenu, historique d'apprentissage
                </li>
                <li>
                  <span className="font-medium text-foreground">Communication :</span> Notifications importantes, mises à jour, support utilisateur
                </li>
                <li>
                  <span className="font-medium text-foreground">Amélioration :</span> Analyse de l'utilisation du service, correction de bugs, nouvelles fonctionnalités
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Partage des Données</h2>
            <p className="text-muted-foreground mb-4">
              Nous ne vendons jamais vos données personnelles. Nous les partageons uniquement dans les cas suivants :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>Avec les formateurs (uniquement pour les contenus que vous suivez)</li>
                <li>Avec nos sous-traitants techniques (hébergement, paiement)</li>
                <li>Si requis par la loi ou pour protéger nos droits</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Sécurité des Données</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Chiffrement :</span> Toutes les données sont transmises de manière sécurisée via HTTPS
                </li>
                <li>
                  <span className="font-medium text-foreground">Stockage :</span> Hébergement sécurisé avec accès restreint
                </li>
                <li>
                  <span className="font-medium text-foreground">Mots de passe :</span> Stockés sous forme cryptée (hachage)
                </li>
                <li>
                  <span className="font-medium text-foreground">Surveillance :</span> Systèmes de détection d'intrusion et audits réguliers
                </li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Vos Droits</h2>
            <p className="text-muted-foreground mb-4">
              Conformément au RGPD, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement ("droit à l'oubli")</li>
                <li>Droit à la limitation du traitement</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">7. Contact</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-muted-foreground">
                Pour toute question concernant notre politique de confidentialité ou pour exercer vos droits, 
                vous pouvez nous contacter à l'adresse suivante : privacy@knowledger.com
              </p>
            </div>
          </section>

          <section className="bg-muted rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Mise à jour</h2>
            <p className="text-muted-foreground">
              Cette politique de confidentialité peut être mise à jour périodiquement. La dernière mise à jour 
              a été effectuée le 1er mars 2024. Nous vous informerons de tout changement important par email 
              ou via notre plateforme.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

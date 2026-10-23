# Sprint Glass Dépannage — site 2026

Site de Sprint Glass Dépannage, en HTML, CSS et JavaScript sans dépendance ni outil de build. Il est publié par GitHub Pages sur https://sprintglassdepannage.com, et sprintglassdepannage.fr redirige vers cette adresse. L'ancien site (2024) reste consultable dans l'historique Git.

## Contenu du dépôt

| Élément | Rôle |
| --- | --- |
| `index.html` | Page d'accueil : services, déroulé, zone, tarifs, questions, devis |
| `mentions-legales.html`, `confidentialite.html` | Pages légales (LCEN et RGPD) |
| `404.html` | Page d'erreur, utilisée automatiquement par GitHub Pages |
| `page/*.html` | Redirections depuis les adresses de l'ancien site (services, tarifs, contact…) |
| `assets/css/site.css` | Toute la mise en forme |
| `assets/js/site.js` | Heure en direct, menu mobile, envoi de position, formulaire de devis |
| `assets/fonts/` | Barlow et Barlow Condensed, hébergées sur le site (licence SIL OFL) |
| `assets/img/` | Dépanneuse détourée et photo (AVIF, WebP, secours PNG/JPG), image d’ambiance de nuit (`nuit-route-*`, générée par IA et signalée dans les mentions légales), logo vectoriel, image de partage |
| `favicon.*`, `apple-touch-icon.png`, `icon-*.png`, `site.webmanifest` | Icônes et raccourci « écran d'accueil » |
| `robots.txt`, `sitemap.xml` | Référencement |
| `CNAME` | Nom de domaine utilisé par GitHub Pages |
| `_config.yml` | Empêche GitHub Pages de publier ce README |

Le logo a été redessiné en vectoriel (`assets/img/logo.svg` et `logo-blanc.svg`) à partir du PNG d'origine : il reste net à toutes les tailles et peut servir pour les réseaux sociaux ou l'imprimeur.

## Reste à faire

1. **Mentions légales** : la forme juridique et le capital social, le numéro de TVA intracommunautaire et le directeur de la publication ont été retirés, faute d'information. Ils sont obligatoires pour une société : les remettre dans `mentions-legales.html` dès que le client les fournit.
2. **Valider avec le client** : prix « dès 40 € TTC », prix annoncé au téléphone avant l'intervention, promesse « On décroche. » en haut de page, durée de conservation de 3 ans dans la politique de confidentialité, numéro joignable sur WhatsApp ou non.
3. **Formulaire de devis** : relié à un nouveau compte EmailJS, les demandes arrivent sur Sprintglass75@gmail.com. Elles partent pour l'instant de la Gmail du développeur : brancher celle du client dès que possible (voir « Formulaire de devis (EmailJS) » plus bas), puis faire un envoi de test depuis le site.

## Publication et nom de domaine

Chaque push sur la branche `main` met le site à jour en une à deux minutes (GitHub Pages : **Settings → Pages**, branche `main`, dossier `/ (root)`, **Enforce HTTPS** coché).

DNS de sprintglassdepannage.com chez IONOS :

| Type | Nom d'hôte | Valeur |
| --- | --- | --- |
| A | `@` | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `kaatafr.github.io` |
| TXT | `_github-pages-challenge-KaataFR` | code de vérification du domaine (GitHub → Settings → Pages) |

- `www.sprintglassdepannage.com` renvoie vers l'adresse sans www (redirection faite par GitHub).
- Les enregistrements e-mail d'IONOS (MX, SPF, DKIM, DMARC) n'ont pas été modifiés. L'adresse contact@sprintglassdepannage.com est une redirection IONOS vers Sprintglass75@gmail.com (pas de boîte de réception, pas de filtre anti-spam côté IONOS).
- sprintglassdepannage.fr (et www) est redirigé vers https://sprintglassdepannage.com par IONOS, avec le certificat SSL inclus dans le pack de domaines IONOS.
- Changer de domaine : remplacer l'adresse dans `CNAME`, dans les pages HTML (adresses canoniques, données structurées), `sitemap.xml` et `robots.txt`.

L'envoi de position ne fonctionne qu'en HTTPS (ou sur `localhost`). Pour tester en local : `npx serve .` à la racine du dépôt, puis ouvrir l'adresse indiquée. Attention, le formulaire de devis y envoie de vrais e-mails à Sprintglass75@gmail.com.

## Formulaire de devis (EmailJS)

Le formulaire envoie les demandes par EmailJS (offre gratuite : 200 envois par mois), sans serveur à gérer.

| Réglage | Valeur | Où le changer |
| --- | --- | --- |
| Identifiants | clé publique `MHsc0-JDrzeYv7HOF`, service `service_sprintglass`, modèle `template_devis` | `CONFIG.emailjs` en haut de `assets/js/site.js` |
| Adresse qui reçoit les demandes | Sprintglass75@gmail.com | EmailJS → Email Templates → « Demande de devis (site) » → To Email |
| Gmail qui envoie | provisoirement celle du développeur | EmailJS → Email Services |

- **Passer sur la Gmail du client** : EmailJS → Email Services → « Gmail provisoire… » → Disconnect, puis Connect Account avec Sprintglass75@gmail.com (le client accepte « Envoyer des e-mails en votre nom »). L'identifiant `service_sprintglass` ne change pas : rien à modifier dans le code. Jusque-là, chaque demande reste aussi dans les messages envoyés de la Gmail du développeur : les supprimer après la bascule.
- **Répondre au client** : dans l'e-mail reçu, « Répondre » écrit à l'adresse du client s'il l'a indiquée, sinon à Sprintglass75@gmail.com.
- **Abus** : la clé publique est lisible dans le code, c'est le fonctionnement normal d'EmailJS. Le destinataire étant fixé dans le modèle, personne ne peut s'en servir pour écrire à quelqu'un d'autre, et un champ piège écarte les robots simples. Limiter les envois aux domaines du site (Account → Security) demande une offre payante. En cas de demandes indésirables : activer reCAPTCHA dans le modèle (onglet Settings), en l'ajoutant à la politique de confidentialité puisque c'est un service Google.
- Le contenu des demandes n'est pas gardé dans l'historique EmailJS (option « Do not save private data » du modèle).

<details>
<summary>Copie du modèle d'e-mail, pour le recréer si besoin</summary>

- To Email : `Sprintglass75@gmail.com`
- From Name : `Site Sprint Glass Dépannage` (From Email : adresse par défaut du service)
- Reply To : `{{reply_to}}`
- Subject : `Devis : {{besoin}}, {{nom}} ({{telephone}})`
- Content (Edit Content → Code Editor) :

```html
<div style="margin:0;padding:24px 12px;background-color:#eef1f6;font-family:Arial,Helvetica,sans-serif;color:#1a2440;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background-color:#ffffff;border:1px solid #d6dbe6;border-radius:8px;">
<tr>
<td style="background-color:#020e39;padding:16px 24px;border-radius:7px 7px 0 0;color:#ffffff;font-size:15px;font-weight:bold;">Sprint Glass Dépannage</td>
</tr>
<tr>
<td style="padding:24px 24px 4px;">
<p style="margin:0 0 6px;font-size:14px;color:#5a6480;">Demande de devis&nbsp;: {{besoin}}</p>
<p style="margin:0 0 18px;font-size:24px;line-height:1.25;font-weight:bold;color:#020e39;">{{nom}}</p>
<a href="tel:{{telephone_lien}}" style="display:inline-block;background-color:#e4002b;color:#ffffff;font-size:17px;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:6px;">Appeler le {{telephone}}</a>
</td>
</tr>
<tr>
<td style="padding:20px 24px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:1.45;color:#1a2440;">
<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #e3e7ef;color:#5a6480;width:36%;vertical-align:top;">Prise en charge</td><td style="padding:10px 0;border-top:1px solid #e3e7ef;vertical-align:top;">{{depart}}</td></tr>
<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #e3e7ef;color:#5a6480;vertical-align:top;">Destination</td><td style="padding:10px 0;border-top:1px solid #e3e7ef;vertical-align:top;">{{arrivee}}</td></tr>
<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #e3e7ef;color:#5a6480;vertical-align:top;">Véhicule</td><td style="padding:10px 0;border-top:1px solid #e3e7ef;vertical-align:top;">{{vehicule}}</td></tr>
<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #e3e7ef;color:#5a6480;vertical-align:top;">E-mail</td><td style="padding:10px 0;border-top:1px solid #e3e7ef;vertical-align:top;">{{email}}</td></tr>
<tr><td style="padding:10px 12px 10px 0;border-top:1px solid #e3e7ef;border-bottom:1px solid #e3e7ef;color:#5a6480;vertical-align:top;">Précisions</td><td style="padding:10px 0;border-top:1px solid #e3e7ef;border-bottom:1px solid #e3e7ef;vertical-align:top;white-space:pre-line;">{{precisions}}</td></tr>
</table>
</td>
</tr>
<tr>
<td style="padding:12px 24px 24px;font-size:13px;line-height:1.5;color:#5a6480;">Envoyé depuis le formulaire de devis du site. Si le client a laissé son e-mail, «&nbsp;Répondre&nbsp;» lui écrit directement.</td>
</tr>
</table>
</div>
```

</details>

## Changer une information

- **Téléphone** : chercher `51 30 16 32` et `33751301632` dans les fichiers HTML, et `CONFIG.phone` dans `site.js`.
- **WhatsApp** : passer `whatsapp: true` dans `CONFIG` pour afficher le bouton « Envoyer par WhatsApp ».
- **Adresse, SIRET, e-mail** : pied de page des trois pages HTML, mentions légales et bloc `application/ld+json` de `index.html`.

## Mesures (Lighthouse 12, mêmes conditions pour les deux versions)

| Mesure | Ancien site | Nouveau site |
| --- | --- | --- |
| Performance mobile (médiane de 3 mesures) | 68/100 | 96/100 |
| Texte principal affiché (mobile, LCP) | 8,3 s | 2,0 s |
| Accessibilité / Bonnes pratiques / SEO (mobile) | 93 / 96 / 100 | 100 / 100 / 100 |
| Poids transféré au chargement, mobile | 1 300 Kio | 186 Kio |
| Domaines tiers contactés | 4 | 0 |

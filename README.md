# 🌌 3D Portfolio - Marin Bardiot

> Un portfolio interactif et immersif en 3D construit avec React, Three.js et Vite

[![Déployé sur Vercel](https://img.shields.io/badge/Déployé%20sur-Vercel-black?style=flat&logo=vercel)](https://3d-portfolio-marin-fgds.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat&logo=react)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.151.0-black?style=flat&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.7-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.2.6-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 Démo en ligne

Visitez le portfolio en direct : [https://3d-portfolio-marin-fgds.vercel.app](https://3d-portfolio-marin-fgds.vercel.app)

## ✨ Caractéristiques

- **Expérience 3D immersive** - Modèles et animations 3D interactifs avec Three.js
- **Interface moderne et responsive** - Design adapté à tous les écrans
- **Multi-langues** - Support internationalisé avec i18next (détection automatique de la langue)
- **Animations fluides** - Transitions et effets avec Framer Motion
- **Timeline interactive** - Présentation de l'expérience professionnelle
- **Formulaire de contact** - Intégration avec EmailJS et protection reCAPTCHA
- **Optimisé pour les performances** - Build avec Vite pour un chargement ultra-rapide

## 🛠️ Stack technique

### Frontend
- **React 18.2** - Bibliothèque UI
- **React Router 6** - Navigation
- **Vite** - Build tool et dev server

### 3D & Animations
- **Three.js** - Moteur de rendu 3D
- **@react-three/fiber** - Wrapper React pour Three.js
- **@react-three/drei** - Helpers et abstractions pour React Three Fiber
- **@react-three/postprocessing** - Effets de post-traitement
- **Framer Motion** - Animations et transitions

### Styling
- **Tailwind CSS** - Framework CSS utility-first
- **PostCSS** - Transformations CSS
- **Autoprefixer** - Compatibilité cross-browser

### Fonctionnalités
- **i18next** - Internationalisation
- **EmailJS** - Service d'envoi d'emails
- **react-google-recaptcha** - Protection anti-spam
- **react-vertical-timeline-component** - Timeline visuelle
- **react-parallax-tilt** - Effets parallaxe

## 📋 Prérequis

- Node.js >= 14.0.0
- npm ou yarn

## 🔧 Installation

1. Clonez le repository :
```bash
git clone https://github.com/bardiotmarin/3d_portfolio_marin.git
cd 3d_portfolio_marin
```

2. Installez les dépendances :
```bash
npm install
# ou
yarn install
```

3. Configurez les variables d'environnement :

Créez un fichier `.env` à la racine du projet et ajoutez vos clés API :
```env
VITE_EMAILJS_SERVICE_ID=votre_service_id
VITE_EMAILJS_TEMPLATE_ID=votre_template_id
VITE_EMAILJS_PUBLIC_KEY=votre_public_key
VITE_RECAPTCHA_SITE_KEY=votre_recaptcha_site_key
```

## 🚀 Lancement

### Mode développement
```bash
npm run dev
# ou
yarn dev
```
L'application sera accessible sur `http://localhost:5173`

### Build de production
```bash
npm run build
# ou
yarn build
```

### Prévisualisation du build
```bash
npm run preview
# ou
yarn preview
```

## 📁 Structure du projet

```
3d_portfolio_marin/
├── public/              # Assets statiques
├── src/
│   ├── assets/         # Images, icônes, modèles 3D
│   ├── components/     # Composants React
│   │   ├── canvas/    # Composants 3D
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── Experience.jsx
│   │   ├── Hero.jsx
│   │   ├── Navbar.jsx
│   │   ├── Tech.jsx
│   │   └── Works.jsx
│   ├── constants/      # Données et constantes
│   ├── hoc/           # Higher Order Components
│   ├── utils/         # Fonctions utilitaires
│   ├── i18n.js        # Configuration i18n
│   ├── styles.js      # Styles globaux
│   ├── App.jsx        # Composant racine
│   └── main.jsx       # Point d'entrée
├── index.html
├── vite.config.js     # Configuration Vite
├── tailwind.config.cjs # Configuration Tailwind
└── package.json
```

## 🎨 Sections du portfolio

1. **Hero** - Introduction avec modèle 3D animé
2. **About** - Présentation personnelle
3. **Experience** - Timeline de l'expérience professionnelle
4. **Tech** - Technologies maîtrisées (avec sphères 3D)
5. **Works** - Projets réalisés
6. **Contact** - Formulaire de contact avec modèle 3D

## 🌐 Déploiement

Le projet est configuré pour être déployé sur Vercel :

```bash
# Installation du CLI Vercel
npm i -g vercel

# Déploiement
vercel
```

Pour d'autres plateformes (Netlify, GitHub Pages, etc.), référez-vous à leur documentation respective.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Marin Bardiot (BleuCube)**
- GitHub: [@bardiotmarin](https://github.com/bardiotmarin)
- Portfolio: [https://marin-bardiot.vercel.app](https://marin-bardiot.vercel.app)
- Company: DEEZER

## 🙏 Remerciements

- [Three.js](https://threejs.org/) pour le moteur 3D
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) pour l'intégration React
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [Vercel](https://vercel.com/) pour l'hébergement

---

⭐️ Si ce projet vous plaît, n'hésitez pas à lui donner une étoile !

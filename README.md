# Project Living Room — Prototype MVP Local-First

**Project Living Room** est un outil de travail local-first (prototype MVP) destiné à préparer un projet de lieu hybride à **Paris (horizon indicatif : Décembre 2027)** combinant :

1. **Une laverie de quartier** ;
2. **Un coffee shop** ;
3. **Un salon d’écoute musicale & bar du soir (Listening & Cocktail Bar)**.

---

## Statut Honnête du MVP & Avertissements Importants

- **Aucune authentification active / Aucun contrôle d’accès** : Ce prototype fonctionne intégralement dans le navigateur (`localStorage`) sans serveur d’authentification ni base de données distante. **N’y saisissez aucune donnée personnelle sensible** (ni salaire personnel, ni loyer personnel, ni secret, ni document confidentiel).
- **Valeurs d’exemple fictives (Placeholders neutres)** : Les montants pré-remplis dans les simulateurs sont des nombres ronds purement illustratifs destinés à tester les formules mathématiques. Un bouton **« Mettre à 0 € »** permet en un clic de repartir d’une feuille vierge.
- **Aucune affirmation juridique ou technique non sourcée** : Aucune conclusion juridique (ex. règles de Licence IV, seuils acoustiques EINS ou classement ERP) n’est présentée comme acquise. Le module *Questions & Vérifications* et le module *Immobilier* formulent des **questions ouvertes à faire valider par des professionnels qualifiés** (avocat, acousticien, architecte, expert-comptable) avec indication explicite de l’absence de source officielle rattachée dans ce MVP.
- **Zéro établissement ou article fabriqué** : Aucun faux benchmark ni article fictif n’est inclus.

Pour le détail des étapes restantes avant un usage en production ou un déploiement, consultez [docs/ROADMAP.md](file:///Users/danyvassily/Landrycofee/docs/ROADMAP.md).

---

## Architecture des 6 Modules

| Code | Module | Contenu & Périmètre MVP |
| :--- | :--- | :--- |
| `MOD-01` | **Tableau de Bord** | Vue d’ensemble du concept en 3 séquences horaires et synthèse en temps réel des simulateurs financiers. |
| `MOD-02` | **Finance & Simulateurs** | **Simulateur I** (épargne mensuelle composée, 3 variantes *-20 % / 100 % / +25 %*, mensualité requise pour une cible) et **Simulateur II** (emplois CAPEX/BFR, ressources, *Funding Gap*, tableau d’amortissement annuel et mensuel avec différé). Boutons **« Mettre à 0 € »** et **« Exemple Neutre »**. |
| `MOD-03` | **Questions & Vérifications** | Liste de questions juridiques, acoustiques et techniques à poser aux experts compétents + carnet local de notes et sources. |
| `MOD-04` | **Immobilier & Local** | Questions techniques à vérifier lors des visites et grille de pointage indicative (`/100`, non normative). |
| `MOD-05` | **Idea Lab & Concept** | Hypothèses d’organisation Matin / Après-midi / Soirée (sans prévisions de marge fabriquées) et carnet d’idées à prototyper. |
| `MOD-06` | **Feuille de Route 2027** | Grandes étapes indicatives de structuration jusqu’à Décembre 2027 avec suivi de statut local. |

---

## Installation & Commandes de Vérification

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement local
npm run dev

# Exécuter les tests unitaires Vitest sur les fonctions de calcul
npm test

# Vérifier le typage strict TypeScript
npm run typecheck

# Compiler le build de production Next.js
npm run build

# Vérifier l'audit de sécurité des dépendances npm
npm audit
```

---

## Structure du Dépôt

- `src/lib/finance.ts` : Fonctions pures de calcul financier (épargne composée, effort mensuel requis, plan de financement, *Funding Gap*, amortissement bancaire avec différé, grille de pointage indicative `/100`).
- `src/lib/__tests__/finance.test.ts` : Suite de tests unitaires Vitest vérifiant les calculs financiers, le mode `0 €` et l’absence d’affirmation juridique non sourcée.
- `src/lib/project-data.ts` : Placeholders financiers neutres, configurations à `0 €`, questions réglementaires et techniques ouvertes, et étapes indicatives de la feuille de route.
- `src/lib/storage.ts` : Persistance locale dans `localStorage` (`project_living_room_founder_workspace_v2`).
- `src/components/FounderWorkspace.tsx` : Interface responsive des 6 modules.
- `docs/ROADMAP.md` : État des lieux honnête du MVP et feuille de route par étapes (Staged Work).
- `env.example` / `.env.example` : Variables d’environnement indicatives sans aucun secret.

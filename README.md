# Project Living Room — Espace Fondateur Privé (MVP)

**Project Living Room** est le cockpit de travail privé des fondateurs pour la création d’un tiers-lieu hybride à **Paris (horizon d’ouverture : Décembre 2027)** réunissant sous un même toit :

1. **Une laverie urbaine haute performance** (flux récurrent matinal et diurne, équipements connectés et séchoirs à pompe à chaleur) ;
2. **Un coffee shop de spécialité** (valorisation des 45 à 60 minutes de cycle de lavage/séchage en journée) ;
3. **Un bar à cocktails & listening bar audiophile** (bascule acoustique et lumineuse en soirée dès 18h30).

---

## Principes Fondateurs de ce MVP

- **Produit French-First & Éditorial** : Interface sobre, chaleureuse et lisible, pensée comme un outil de pilotage exécutif sur ordinateur comme sur mobile.
- **Simulateurs Financiers Réels & Déterministes** :
  - **Simulateur I — Épargne & Apport Fondateurs** : projection mois par mois avec intérêts composés, apports exceptionnels, calcul de l’effort mensuel requis pour atteindre la cible d’apport, et comparaison instantanée de 3 scénarios (*Prudent -20 %*, *Central Nominal*, *Accéléré +25 %*).
  - **Simulateur II — Plan de Financement, Écart (Funding Gap) & Amortissement Bancaire** : ventilation modifiable des 7 postes de CAPEX/BFR, synchronisation automatique ou manuelle avec l’apport du Simulateur I, prêt d’honneur à 0 %, subventions, calcul du ratio de quasi-fonds propres, détection du *Funding Gap* (déficit ou coussin de sécurité), estimation du ratio de couverture de la dette (*DSCR*), et tableau d’amortissement complet (annuel et mensuel avec prise en compte du différé d’amortissement).
- **Hypothèses Clairement Balisées** : Toutes les valeurs financières ou immobilières pré-remplies sont explicitement identifiées comme des **hypothèses de travail modifiables** et non contractuelles.
- **Zéro Donnée ou Recherche Fabriquée** : Le module *Recherche & Réglementation* et le module *Immobilier* exposent le cadre réglementaire parisien vérifiable (EINS Décret Bruit, Licence IV, RSD Paris, ERP 5e catégorie) ainsi que des grilles méthodologiques et gabarits hypothétiques, sans inventer de faux établissements ni de faux articles.
- **Persistance Locale Sans Backend Requis** : En l’absence d’identifiants serveur, toutes les modifications d’hypothèses, notes de recherche, fiches de locaux candidats, idées et statuts de roadmap sont sauvegardés localement dans le navigateur (`localStorage`), avec fonctions d’export JSON et de réinitialisation.

---

## Architecture des 6 Modules

| Code | Module | Fonctionnalité |
| :--- | :--- | :--- |
| `MOD-01` | **Tableau de Bord** | Synthèse exécutive, thèse Jour/Après-midi/Nuit et KPIs financiers reliés en temps réel aux simulateurs. |
| `MOD-02` | **Finance & Simulateurs** | Simulateur d’épargne multi-scénarios, plan de financement CAPEX/BFR, calcul du *Funding Gap*, DSCR et tableau d’amortissement annuel/mensuel. |
| `MOD-03` | **Recherche & Réglementation** | Matrice de conformité administrative parisienne et journal interactif des protocoles d’observation terrain. |
| `MOD-04` | **Immobilier & Local** | Cahier des charges technique (dalle béton, triphasé, vitrine, clause bar) et calculateur de score de compatibilité (`/100`). |
| `MOD-05` | **Idea Lab & Concept** | Chorégraphie opérationnelle sur 3 séquences horaires et registre d’expérimentations (Impact vs Faisabilité). |
| `MOD-06` | **Feuille de Route 2027** | Rétroplanning T4 2026 → Décembre 2027 structuré autour de 5 portes de décision (*Decision Gates*). |

---

## Plan de Confidentialité & Contrôle d’Accès (Privacy / Auth Gating Plan)

1. **Niveau 1 — Exécution Locale Privée (Actif par défaut)** :
   - Métadonnées HTTP configurées en `noindex, nofollow, nocache`.
   - Aucune clé secrète ni connexion base de données externe embarquée dans le code.
   - Persistance strictement locale au poste du fondateur via `localStorage` (`project_living_room_founder_workspace_v1`).
2. **Niveau 2 — Gating Middleware Next.js (Avant partage privé entre co-fondateurs)** :
   - Ajout d’un `middleware.ts` vérifiant un jeton de session signé (`WORKSPACE_SESSION_SECRET`) et filtrant l’accès selon la liste blanche `FOUNDER_ALLOWED_EMAILS`.
3. **Niveau 3 — Persistance Supabase Privée & Row-Level Security (RLS)** :
   - Connexion optionnelle via `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (voir `env.example`).
   - Activation obligatoire de politiques RLS restreignant `SELECT / INSERT / UPDATE / DELETE` aux seuls identifiants UUID des co-fondateurs authentifiés. Aucune clé `service_role` ne doit jamais être exposée côté client.

---

## Installation & Commandes

### Prérequis
- Node.js 18+ (compatible Node 20 / 22 / 26)
- npm

### Développement local
```bash
npm install
npm run dev
```

### Vérifications Qualité (Tests Unitaires, Typage TypeScript & Build Production)
```bash
# Exécuter la suite de tests unitaires Vitest sur le moteur financier
npm test

# Vérifier le typage strict TypeScript
npm run typecheck

# Compiler le build de production Next.js
npm run build
```

---

## Structure des Fichiers Principaux

- `src/lib/finance.ts` : Moteur pur de calcul financier (épargne composée, effort mensuel requis, plan de financement, *Funding Gap*, amortissement bancaire avec différé, DSCR, score immobilier `/100`).
- `src/lib/__tests__/finance.test.ts` : Suite de tests unitaires Vitest validant l’exactitude mathématique des simulateurs.
- `src/lib/project-data.ts` : Hypothèses étalons clairement balisées, grille réglementaire parisienne, cahier des charges immobilier et feuille de route Décembre 2027.
- `src/lib/storage.ts` : Persistance locale résiliente (`localStorage`) et valeurs par défaut.
- `src/components/FounderWorkspace.tsx` : Interface complète et responsive des 6 modules de l’espace fondateur.
- `env.example` / `.env.example` : Modèle de variables d’environnement documenté et garanti sans secret.

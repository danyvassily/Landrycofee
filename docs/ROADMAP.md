# Feuille de Route Technique & Produit — Project Living Room (MVP)

Ce document décrit de manière transparente **ce qui est réellement implémenté aujourd’hui** dans ce dépôt et **les étapes restantes** avant toute utilisation avec des données réelles ou tout déploiement.

---

## 1. Statut Honnête du Prototype Actuel (Étape MVP Local-First)

### Ce qui est fonctionnel et vérifié :
- **Moteur de simulation financière déterministe** (`src/lib/finance.ts` + tests unitaires Vitest dans `src/lib/__tests__/finance.test.ts`) :
  - Projection d’épargne mensuelle avec intérêts composés, versement exceptionnel ponctuel, comparaison de 3 variantes (*-20 %*, *100 %*, *+25 %*) et calcul de la mensualité requise pour atteindre une cible donnée.
  - Plan de financement CAPEX/BFR à 7 postes modifiables, synchronisation optionnelle avec le simulateur d’épargne, calcul de l’écart de financement (*Funding Gap* ou solde net), et tableau d’amortissement d’emprunt bancaire (mensuel et annuel, avec prise en compte d’un différé d’amortissement).
- **Valeurs par défaut neutres & remise à zéro en un clic** :
  - Les valeurs pré-remplies sont des **exemples fictifs ronds (placeholders)** qui n’encodent aucune donnée personnelle (ni salaire, ni loyer personnel) et ne constituent aucune prévision de marché.
  - Un bouton **« Mettre à 0 € »** permet de réinitialiser tous les curseurs financiers à `0 €`.
- **Listes de questions pratiques à faire vérifier** (`src/lib/project-data.ts`) :
  - Les rubriques réglementaires (acoustique, licences de débit de boissons, hygiène/laverie, urbanisme/ERP) et immobilières sont présentées sous forme de **questions ouvertes à valider auprès de professionnels qualifiés**, sans affirmer de conclusion juridique non sourcée.
- **Persistance locale navigateur** (`src/lib/storage.ts`) :
  - Sauvegarde dans le `localStorage` du navigateur, export JSON et réinitialisation.

### Ce qui n’est PAS implémenté à ce stade :
- **Aucune authentification ni contrôle d’accès** : l’application ne protège aucune donnée côté serveur et n’intègre aucun mécanisme d’authentification (aucune cryptographie ou session maison n’a été ajoutée).
- **Aucune base de données distante** : aucune connexion Supabase ou PostgreSQL active.
- **Aucune donnée juridique, acoustique ou financière certifiée** : aucun texte de loi, seuil acoustique ou devis fournisseur n’est certifié dans ce dépôt.
- **Aucun déploiement actif** : conformément aux consignes, aucun déploiement Vercel ou distant n’est déclenché tant que la phase de développement n’est pas achevée.

---

## 2. Découpage par Étapes (Staged Work) — Ce qu’il reste à accomplir

### Étape A — Validation Métier, Juridique & Chiffrages Réels (Hors Code)
1. **Consultations juridiques et administratives** :
   - Valider avec un avocat spécialisé le régime de licence applicable et les clauses de bail commercial / règlement de copropriété.
   - Rattacher à chaque question du module *Questions & Vérifications* la référence officielle vérifiée et sa date de consultation.
2. **Consultations techniques et devis** :
   - Obtenir des devis réels auprès de fournisseurs de matériel de blanchisserie professionnelle, d’équipement café/bar, de sonorisation et d’un bureau d’études acoustiques.
   - Remplacer les placeholders ronds (`250 000 €` d’exemple) par les montants issus des devis et d’un prévisionnel établi avec un expert-comptable.

### Étape B — Persistance Multi-Co-Fondateurs & Authentification Standard
1. **Authentification gérée (Managed Auth)** :
   - Intégrer un fournisseur d’authentification éprouvé (ex. **Supabase Auth** avec Magic Link / OAuth et MFA) — sans jamais écrire de système d’authentification ou de chiffrement artisanal.
2. **Base de données PostgreSQL & Row-Level Security (RLS)** :
   - Créer des migrations SQL versionnées pour les tables `scenarios`, `research_notes`, `property_visits` et `roadmap_items`.
   - Verrouiller chaque table par des politiques RLS strictes limitées aux identifiants utilisateurs authentifiés des co-fondateurs.

### Étape C — Enrichissement Fonctionnel du Simulateur
1. **Compte de résultat prévisionnel (P&L) sur 36 mois** :
   - Ajouter un module de simulation des charges d’exploitation et des flux de trésorerie mensuels une fois les hypothèses comptables validées.
2. **Import / Export structuré** :
   - Permettre l’import d’un fichier JSON précédemment exporté et l’export CSV du tableau d’amortissement pour l’expert-comptable.

### Étape D — Préparation au Déploiement (Uniquement après validation)
1. **Revue de sécurité et des variables d’environnement** avant toute mise en ligne.
2. **Déploiement contrôlé** (Vercel ou hébergeur cible) une fois la phase de code et d’authentification terminée et approuvée par l’utilisateur.

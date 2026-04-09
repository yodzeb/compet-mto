# Outil d'aide à la décision météo — Compétition

Outil HTML pour évaluer la faisabilité d'une compétition de vol libre de J-4 jusqu'au Jour J, en s'appuyant sur une méthode simple, reproductible et structurée.

---

## Fichiers

| Fichier | Description |
|---|---|
| `index.html` | Structure HTML (onglets, modèles, sections, modal, actions) |
| `app.js` | Logique applicative (state, rendu, scores, persistance, import/export) |
| `app.css` | Styles |
| `README.md` | Ce fichier |

Les trois fichiers doivent être dans le **même répertoire**. Ouvrir `index.html` dans n'importe quel navigateur moderne — aucune installation requise (les liens vers les sites météo nécessitent une connexion internet).

---

## Structure de l'outil

L'outil est divisé en **4 onglets** correspondant aux étapes de la préparation météo.

### Onglet J-3/J-4 — Grandes mailles

À utiliser 3 à 4 jours avant la compétition pour une première analyse de tendance.

**Modèles proposés** (liens directs inclus) :
- ARPEGE 10 — météociel
- ICON EU 7 — météoblue
- NEMS 12 — météociel
- ECMWF 9 — météociel
- WRF 5 — météoblue
- GFS 25 — météoblue

Consulter au minimum 2 ou 3 modèles pour croiser les données.

---

### Onglet J-1/J-2 — Mailles fines

À utiliser 24 à 48 h avant la compétition. Utiliser les **derniers runs disponibles** pour le créneau horaire visé.

**Modèles proposés** :
- AROME 1,3 et 2,5 — météociel (modèles de référence à courte échéance, mailles 1–2 km)
- ICON D2 — météoblue
- ICON CH1 — météoblue
- NEMS 4 — météociel
- RASP — drjack.info

Sites supplémentaires : vélivole, xctherm, météoparapente.

---

### Onglet Jour J — Observations terrain

En plus des modèles mailles fines (mêmes que J-1/J-2), cet onglet ajoute une section **Observations sur site** :

| Champ | Valeurs possibles |
|---|---|
| Images satellite | Bon / Mitigé / Mauvais |
| Radar pluie | Clair / Pluie faible / Pluie forte |
| Balises vent | < 10 / 10–20 / > 20 km/h |
| Nébulosité sur site | 0–2 / 3–5 / 6–8 octas |
| Vent sur site | Calme / Modéré / Fort |
| Remarque | Texte libre |

---

### Onglet Bilan

Récapitule automatiquement les verdicts et scores des 3 jours et propose une **décision finale recommandée** :

- Majorité de verdicts **Maintien** → ✅ Maintien recommandé
- Majorité de verdicts **Annulation** → ❌ Annulation recommandée
- Cas mixte ou attente → ⏳ Décision en attente
- Données insuffisantes → — Non renseigné

---

## Sauvegarde et gestion des compétitions

### Sauvegarder

Bouton **💾 Sauvegarder** (onglet Bilan) : saisir un nom, confirmer. La compétition est stockée dans le `localStorage` du navigateur. Les données sont persistantes entre les sessions sur le même navigateur et le même appareil.

### Liste des compétitions sauvegardées

Affichée en bas de l'onglet Bilan, triée de la plus récente à la plus ancienne. Pour chaque entrée :
- **Charger** — restaure l'intégralité des données dans le formulaire (avec confirmation)
- **JSON ↓** — exporte cette seule compétition en fichier `.json`
- **✕** — supprime définitivement (avec confirmation)

---

## Export / Import JSON

### Export d'une seule compétition

Bouton **JSON ↓** dans la liste, ou bouton **↓ Export JSON** (exporte l'état courant non sauvegardé après saisie d'un nom).

### Export de toutes les compétitions

Bouton **↓ Tout exporter** — génère un fichier `meteo_competitions_YYYY-MM-DD.json` contenant toutes les compétitions sauvegardées sous forme de tableau JSON.

### Import

Bouton **↑ Importer JSON** — accepte un fichier `.json` contenant soit un seul objet compétition, soit un tableau. Les compétitions importées sont ajoutées à la liste locale (sans écraser les existantes si les `id` diffèrent).

Le format JSON est utilisable pour sauvegarder des archives hors du navigateur, transférer des données entre appareils, ou effectuer des sauvegardes manuelles.

---

## Évaluation par modèle

Pour chaque critère météo, le tableau affiche **une colonne par modèle**. Cliquer sur un feu vert / orange / rouge dans la colonne du modèle pour noter ce critère selon ce modèle. Cela permet de visualiser directement la convergence ou la divergence des modèles sur chaque point.

### Critères évalués (communs aux 3 onglets)

**Analyse des masses d'air** — Anticyclone / marais barométrique ; Dépression / front / traîne active

**Vent météo** — Vent moyen au sol ; En altitude ; Brises ; ⚠️ Pièges aérologiques (foehn, rafales, cisaillements)

**Nébulosité / Humidité** — Base nuages / octas ; Précipitations ; Convection / sondage ; ⚠️ Pièges aérologiques (dust, orage Cb, cisaillements)

**Stabilité / Instabilité** — Indice global de stabilité

**Indice de confiance** — Cohérence / Fiabilité des modèles ; ⚠️ Sécurité / Risques

---

## Score de confiance automatique

Calculé en temps réel sur l'ensemble des feux actifs (tous critères, tous modèles) :

- Proportion de feux **verts** parmi les feux actifs
- Barre de progression colorée : verte (≥ 70 %), orange (40–69 %), rouge (< 40 %)

---

## Seuils vent indicatifs

| Seuil | Niveau |
|---|---|
| < 10 km/h | Faible — favorable |
| 10–20 km/h | Moyen — vigilance |
| > 20 km/h | Fort — défavorable |

---

## Modifier les modèles ou les critères

Dans `app.js`, deux constantes en haut de fichier suffisent :
- `PAGE_MODELS` — liste des modèles par onglet (index 0 = J-3/J-4, 1 = J-1/J-2, 2 = Jour J)
- `EVAL_SECTIONS` — liste des sections et critères (label, sous-label optionnel, flag `danger`)

Modifier uniquement ces deux constantes adapte le contenu sans toucher au reste du code.

---

## Imprimer / Exporter PDF

Bouton **🖨 Imprimer / PDF** — ouvre la boîte de dialogue d'impression du navigateur pour générer une fiche papier ou un PDF.

---

## Réinitialiser le formulaire

Bouton **↺ Réinitialiser** (onglet Bilan) — efface toutes les saisies du formulaire après confirmation. Les compétitions sauvegardées dans le localStorage ne sont pas affectées.

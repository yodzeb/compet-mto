# Outil d'aide à la décision météo — Compétition

Fichier HTML autonome (`meteo_competition.html`) pour évaluer la faisabilité d'une compétition de vol libre de J-4 jusqu'au Jour J, en s'appuyant sur une méthode simple, reproductible et structurée.

---

## Utilisation

Ouvrir `meteo_competition.html` dans n'importe quel navigateur moderne — aucune installation, aucune connexion internet requise pour utiliser l'outil (les liens vers les sites météo nécessitent une connexion).

---

## Structure de l'outil

L'outil est divisé en **4 onglets** correspondant aux étapes de la préparation météo.

### Onglet J-3 / J-4 — Grandes mailles

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

### Onglet J-1 / J-2 — Mailles fines

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

Récapitule automatiquement les verdicts et scores des 3 jours et propose une **décision finale recommandée** selon la logique suivante :

- Majorité de verdicts **Maintien** → ✅ Maintien recommandé
- Majorité de verdicts **Annulation** → ❌ Annulation recommandée
- Cas mixte ou attente → ⏳ Décision en attente
- Données insuffisantes → — Non renseigné

Un bouton **Imprimer / Exporter PDF** permet de générer une fiche papier ou un PDF via la boîte de dialogue d'impression du navigateur.

---

## Items évalués (communs aux 3 onglets)

Pour chaque item, cliquer sur un feu **vert / orange / rouge** pour indiquer le niveau de risque.

### Analyse des masses d'air
- Anticyclone / marais barométrique
- Dépression / front / traîne active

### Vent météo
- Vent moyen au sol (force, direction)
- En altitude (coupes verticales)
- Brises (force, direction)
- ⚠️ Pièges aérologiques : foehn, rafales, cisaillements

### Nébulosité / Humidité
- Base nuages / octas, étalements, sur-développements Cb
- Précipitations : pluie, grêle, neige, brouillard
- Convection utilisable, sondage, inversion, couche d'arrêt
- ⚠️ Pièges aérologiques : dust, orage Cb, cisaillements

### Stabilité / Instabilité
- Indice global de stabilité

### Indice de confiance
- Cohérence et fiabilité des modèles entre eux
- ⚠️ Sécurité / Risques

---

## Score de confiance automatique

À chaque feu allumé, le score favorable est recalculé en temps réel :

- Proportion de feux **verts** parmi les feux actifs
- Barre de progression colorée : verte (≥ 70 %), orange (40–69 %), rouge (< 40 %)

---

## Seuils vent indicatifs

À moduler selon le terrain (plaine ou montagne).

| Seuil | Niveau |
|---|---|
| < 10 km/h | Faible — favorable |
| 10–20 km/h | Moyen — vigilance |
| > 20 km/h | Fort — défavorable |

---

## Logique de décision

> Si tous les voyants sont au vert, la décision est simple.  
> Plusieurs voyants orange sont des points de vigilance importants.  
> Si plusieurs modèles convergent, les prévisions sont fiables — en particulier AROME et ICON D2/CH1 sur 48 h, considérés comme les plus précis aujourd'hui.  
> Évaluer toujours les risques et dangers potentiels pour la sécurité des vols : vent présent et/ou forte instabilité constituent des risques reconnus.

---

## Réinitialisation

Le bouton **Réinitialiser tout** (onglet Bilan) efface l'ensemble des saisies après confirmation.

---

## Fichiers

| Fichier | Description |
|---|---|
| `meteo_competition.html` | Application principale (fichier unique, autonome) |
| `README_FR.md` | Ce fichier |
| `README_EN.md` | Version anglaise |

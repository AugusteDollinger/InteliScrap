# InteliScrap — Audit & Roadmap RNCP CDA (Niveau 6)

> **Titre visé :** Concepteur·ice Développeur·euse d'Applications — RNCP Niveau 6
> **Document :** état des lieux du dépôt confronté à la checklist CDA (v2.1.0) + roadmap priorisée.
> **Périmètre analysé :** branche `main` au moment de l'audit (le code de scraping vit encore sur `feature/base-for-scraping` et `feature/profile`, non mergées).
> **Date de l'audit :** 2026-05-29

---

## 1. Légende des statuts

| Statut | Signification |
|--------|---------------|
| ✅ | Conforme — présent et exploitable en l'état |
| 🟡 | Partiel — existe mais à compléter / renforcer / documenter |
| ❌ | Manquant — rien dans le dépôt |
| ⏭️ | Optionnel — non bloquant pour le titre |
| 📄 | Hors dépôt — livrable du **dossier projet** (à rédiger, pas du code) |

---

## 2. Synthèse par bloc

| Bloc / thème | ✅ | 🟡 | ❌ | Priorité |
|---|---|---|---|---|
| **Bloc 1** — Application sécurisée (env, UI, métier, gestion projet) | 6 | 12 | 9 | Haute |
| **Bloc 2** — Conception en couches (besoins, archi, BDD, ORM, doc, déploiement) | 5 | 5 | 7 | Haute |
| **Bloc 3** — Préparation au déploiement (tests, DevOps, doc) | 0 | 0 | 18 | **Critique** |
| **Transversal** (qualité, OWASP, RGPD, anglais, éco-conception) | 1 | 4 | 9 | Moyenne |

**Verdict global :** la base technique est saine (architecture en couches propre, JWT + hash, Docker Compose, Git/PR discipliné). Les **deux trous majeurs** qui bloquent la certification sont :
1. **Aucun test** (Bloc 3 — tests = 0/11).
2. **Aucune CI/CD ni DevOps** (Bloc 3 — DevOps = 0/5, pas de dossier `.github/`).

S'y ajoutent plusieurs **failles de sécurité OWASP** faciles à corriger (CORS `*` + credentials, `SECRET_KEY` par défaut, compte `admin/admin` seedé, validation email faible).

---

## 3. Audit détaillé item par item

### Bloc 1 — Développer une application sécurisée

#### Installation & configuration de l'environnement (2/4)
| Item | Statut | Constat (preuve) | Action |
|---|---|---|---|
| Description de l'environnement de dev | 🟡 | `README.md` = brief produit ; setup ajouté par la PR #35 (`chore/quality-setup`) non mergée | Merger PR #35, compléter |
| Choix techniques (IDE, frameworks, libs) | 🟡 | Stack lisible via `package.json`/`requirements.txt` mais non justifiée | Rédiger une section « choix techniques » |
| Processus d'installation (README/Notion) | 🟡 | Idem, dépend de PR #35 | Merger + lien Notion |
| Containeriser l'application | ✅ | `infra-inteliscrap/docker-compose.yml` (3 services), `dockerfile.dev` front+back | OK ; corriger le `Dockerfile` prod (`backend.app\main:app` → bug backslash) |

#### Développement d'interfaces (3/12)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Charte graphique | ❌ | Aucune charte / design system dans le dépôt | Créer charte (couleurs, typo, composants) |
| Charte accessible | ❌ | Pas de charte → pas de contraste/AA documenté | Vérifier ratios WCAG AA |
| Maquettes & wireframes | ❌ | Aucun fichier Figma/maquette | Produire maquettes (Figma) |
| Choix ergonomiques UX/UI | 🟡 | UI Sass cohérente (`Login`, `Home`, `Navbar`) mais non justifiée | Documenter |
| Technos front-end décrites | 🟡 | React 19 + Vite + TS + Sass (`package.json`) | Documenter dans dossier |
| Responsive sur maquettes | ❌ | Pas de maquette | Maquettes responsive |
| Accessibilité sur maquettes | ❌ | Idem | À produire |
| Premiers écrans codés | ✅ | `Login.tsx`, `Register.tsx`, `Home.tsx` à partir d'une UI réelle | OK |
| Navigation entre vues | ✅ | `router.tsx` (React Router 7), `Navbar` fonctionnelle | OK |
| Responsivité + a11y dans le code | 🟡 | `<label>` non liés aux `<input>` (pas de `htmlFor`/`id`) ; responsive non vérifié | Lier labels, audit Lighthouse |
| Validation des champs côté interface | 🟡 | `required` + `type=email` seulement (`Login.tsx`) ; pas de règle mot de passe/format | Renforcer validation client |
| Prévention failles front (XSS, rôle) | 🟡 | React échappe par défaut (✅) mais **pas de route protégée** ni d'affichage conditionnel par rôle (le `role` est affiché mais n'ouvre/ferme rien) | Ajouter routes privées + gating par rôle |

#### Développement des composants métier (4/10)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Architecture des composants | ✅ | Découpage clair `api/` `services/` `models/` `schemas/` | OK, à documenter |
| Patterns de conception | 🟡 | Repository implicite (`userService`), MVC-ish ; aucun pattern explicite/nommé | Nommer & documenter (Repository, DI FastAPI) |
| Gestion des règles métier | 🟡 | Logique limitée à l'auth ; scraping pas encore mergé | Isoler règles dès le métier scraping |
| Sécurisation composants métier | 🟡 | Permissions par rôle **non appliquées** (rôle `admin` jamais vérifié) | Ajouter contrôle de rôle |
| 1-2 fonctionnalités métier (Démo 2) | ✅ | Auth (register/login/users) opérationnelle | OK |
| Nouvelles fonctionnalités (Démo 3) | 🟡 | Scraping Amazon développé mais sur branche non mergée | Merger après tests |
| Routes sensibles protégées | ✅ | `/homepage` via `Depends(get_current_user)` (`api/v1.py`) | OK |
| Validation systématique côté serveur | 🟡 | Pydantic présent mais `email: str` (pas `EmailStr`), pas de règle password | Durcir les schémas |
| Gestion propre des erreurs back | 🟡 | `HTTPException` ok ; mais `create_all` au startup + `@app.on_event` déprécié | Handler global + lifespan |
| Vérification des droits utilisateur | ❌ | Aucune autorisation par ressource/rôle | Implémenter autorisation |

#### Gestion de projet (6/8)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Méthodologie (Scrum/Kanban…) | 🟡 | Non documentée (PR fréquentes suggèrent un flux agile) | Documenter (board GitHub/Notion) |
| Planification & suivi des tâches | 🟡 | Pas de board visible dans le dépôt | Lier issues/projets GitHub |
| Gestion des versions (Git) | ✅ | 47 commits, historique riche | OK |
| Collaboration & communication | 🟡 | À documenter (Slack/Notion) | Capture board/outils |
| Repository GitHub (README, branches) | ✅ | Repo structuré, branches features, `PULL_REQUEST_TEMPLATE.md` | OK |
| Workflow Git choisi | ✅ | Feature-branch + PR + merges (Gitflow allégé) | À nommer dans le dossier |
| Gestion des secrets (.env, .gitignore) | ❌ | **Pas de `.env`** ; secrets en clair dans `docker-compose.yml` ; `SECRET_KEY` défaut `"change-me"` ; `.gitignore` n'ignore pas `.env` | **Prioritaire** : externaliser secrets |
| Historique Git lisible | ✅ | Messages explicites par fonctionnalité | OK |

---

### Bloc 2 — Concevoir & développer en couches

#### Analyse des besoins (0/2)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Besoins fonctionnels & techniques | 🟡 | Brief dans `README.md` (concept, cible, valeur) mais pas d'analyse formelle | Rédiger l'analyse |
| Cahier des charges & spécifications | ❌ | Absent | Produire le CDC |

#### Architecture logicielle (1/2)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Description de l'architecture | 🟡 | Architecture en couches réelle mais non documentée (pas de schéma) | Diagramme d'archi |
| Aspects sécurité dans l'archi | 🟡 | JWT + hash ✅ mais **CORS `allow_origins=["*"]` + `allow_credentials=True`** (combo non sûr), pas de rate-limit | Corriger CORS, documenter |

#### Conception base de données (2/4)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Optimisation & indexation | ⏭️ | Index sur `id/email/username` (`models/user.py`) | Optionnel |
| Sécurité & protection des données | 🟡 | Hash ok ; mais accès DB en clair, pas de moindre privilège | Durcir accès |
| Première connexion + ≥1 table | ✅ | `database.py` + table `users` via Alembic | OK |
| Hash des mots de passe | ✅ | `pbkdf2_sha256` via passlib (`userService.py`) | OK |

#### Composants d'accès aux données (1/3)
| Item | Statut | Constat | Action |
|---|---|---|---|
| ORM (usage + implémentation expliqués) | 🟡 | SQLAlchemy 2 utilisé, non documenté | Documenter le choix ORM |
| Requêtes & transactions | ✅ | Session + commit/refresh (`userService.py`) | OK |
| Mise en cache & perfs | ⏭️ | Aucune | Optionnel |

#### Documentation technique (1/3)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Doc API (si API) | 🟡 | Swagger auto-généré `/docs` (FastAPI) ✅ mais non exporté/commenté | Exporter OpenAPI + descriptions |
| Documentation du code source | 🟡 | Docstrings éparses (`database.py`) ; reste peu commenté | Densifier docstrings |
| Documentation de déploiement | ❌ | Absente (Démo 4) | À rédiger |

#### Stratégie de déploiement (0/3)
| Item | Statut | Constat | Action |
|---|---|---|---|
| Environnement de test | ❌ | Aucun env de test/staging | Mettre en place |
| Config dev/test/prod | ❌ | Un seul profil (dev) | Profils + `.env.*` |
| Sécurité du déploiement (HTTPS, SSH, moindre privilège) | ❌ | `Dockerfile` prod cassé, pas d'HTTPS, secrets en clair | À construire |

---

### Bloc 3 — Préparer le déploiement *(point critique : 0 partout)*

#### Tests (0/11) ❌
Aucun fichier de test dans le dépôt (`pytest`, `vitest`, Playwright e2e absents).
À mettre en place : **stratégie de tests**, **plans de tests**, **outils** (pytest + httpx côté back, Vitest + Testing Library côté front, Playwright e2e), **tests unitaires métier**, **tests des routes API**, **fixtures/base de test isolée**, **tests front composants/pages**, **tests de sécurité**, **justification du périmètre**, **couverture + bug d'exemple**.

#### Documentation & déploiement (0/5) ❌
Doc technique, stratégie de déploiement, config des environnements à produire (Démo 4). Doc utilisateur & sauvegarde/restauration = ⏭️ optionnels.

#### Démarche DevOps (0/5) ❌
Pas de `.github/` → **aucune CI/CD**. À créer : pipeline (lint + tests à chaque push), automatisations (Dependabot, changelog, déploiement), monitoring/alerting, gestion des releases/tags (aucun tag git actuellement), sécurisation du pipeline.

---

### Éléments transversaux & autres compétences

| Item | Statut | Constat | Action |
|---|---|---|---|
| Respect des standards de code | 🟡 | ESLint front ✅ ; **aucun linter/formatter back** (ni ruff/black/flake8) | Ajouter ruff + black |
| Gestion des erreurs & exceptions | 🟡 | Partielle (cf. Bloc 1) | Handler global |
| Protection vulnérabilités (OWASP) | 🟡 | Plusieurs points : CORS `*`+creds, `SECRET_KEY` défaut, `admin/admin` seedé, `email: str`, pas de rate-limit | **Plan OWASP** |
| Journalisation & audit | ⏭️ | Aucune | Optionnel (logging structuré) |
| Clarté/structure du rapport | 📄 | Dossier projet (40-60 p.) | À rédiger |
| Illustrations (captures, diagrammes) | 📄 | MCD mermaid présent (`README.md`) ✅ ; reste à produire | Dossier |
| Glossaire technique | 📄 | — | Dossier |
| Démonstration / vidéo | 📄 | — | Démo 4 |
| Résumé en anglais | 📄 | — | Dossier |
| Éco-conception | 🟡/📄 | Non traitée | Section dédiée + bonnes pratiques |
| Veille techno & sécurité | 📄 | — | Dossier |
| Mentions légales / RGPD | ❌ | Aucune (alors qu'on stocke email + mot de passe) | Mentions légales + politique RGPD |
| Résolution de problèmes / incidents | 📄 | — | Dossier |
| Validation besoins parties prenantes | ⏭️ | — | Optionnel |
| Organisation en couches | ✅ | Couches API/service/modèle/schéma | OK |
| Interopérabilité (REST/JSON) | ✅ | API REST FastAPI, JSON | OK |
| MCD | ✅ | Diagramme mermaid (`README.md`) | OK |
| MPD / MLD | ⏭️ | Optionnels | — |
| Scripts de création BDD | ✅ | Migrations Alembic (`versions/`) | OK |
| Sécurisation accès BDD | 🟡 | Creds en clair, pas de moindre privilège | Durcir |
| Stratégie d'accès (ORM/DAO/Repo) | ✅ | Pattern service/repository (`userService.py`) | OK, documenter |
| Implémentation requêtes SQL | ✅ | Via ORM | OK |
| Bases NoSQL | ⏭️ | Non | Optionnel |

---

## 4. Roadmap priorisée

La roadmap suit le découpage **Démo 1 → 4** de la checklist et place en tête les chantiers **bloquants** (sécurité, tests, CI/CD).

### 🔴 Sprint 0 — Quick wins sécurité (1-2 jours) — *bloquant titre, peu d'effort*
1. **Externaliser les secrets** : créer `.env` + `.env.example`, déplacer `SECRET_KEY`, creds Postgres ; ajouter `.env` au `.gitignore`. *(Bloc 1 — secrets ❌)*
2. **Durcir CORS** : remplacer `allow_origins=["*"]` par une liste d'origines + retirer `allow_credentials` si non nécessaire. *(Bloc 2 — sécu archi)*
3. **Supprimer le seed `admin/admin`** ou le conditionner à une variable d'env + mot de passe fort. *(OWASP)*
4. **Validation serveur** : `EmailStr` + contraintes mot de passe dans les schémas Pydantic. *(Bloc 1)*
5. **Corriger le `Dockerfile` prod** (`backend.app\main:app` → `backend.app.main:app`). *(Bloc 1 — Docker)*
6. **Merger la PR #35** (README setup + Docker fix) puis compléter.

### 🟠 Sprint 1 — Tests & qualité de code (3-5 jours) — *Bloc 3 critique*
1. **Backend** : `pytest` + `httpx`, base de test isolée (SQLite/Postgres test), **fixtures**, tests unitaires métier (`userService`, `security`) + tests des routes (`/auth/*`, `/users`, `/homepage`).
2. **Frontend** : `vitest` + Testing Library sur `Login`, `Register`, `Navbar`, `AuthContext`.
3. **Qualité back** : ajouter `ruff` + `black` (+ `mypy` optionnel) ; documenter les standards.
4. **Couverture** : viser un seuil, identifier limites + 1 bug réel détecté (livrable Démo 4).

### 🟠 Sprint 2 — CI/CD & DevOps (2-3 jours) — *Bloc 3 critique*
1. Créer `.github/workflows/ci.yml` : lint + tests front & back à chaque push/PR.
2. **Dependabot** (`.github/dependabot.yml`) pour npm + pip.
3. **Releases** : adopter le versioning sémantique + tags git (aucun tag aujourd'hui) + changelog automatisé.
4. (Optionnel) Pipeline de déploiement + monitoring/alerting basique.

### 🟡 Sprint 3 — Sécurité métier & autorisation (2-3 jours) — *Bloc 1/2*
1. **Routes privées front** (garde de route selon `token`) + **affichage conditionnel par rôle**.
2. **Autorisation back** : dépendance `require_role("admin")`, vérification des droits sur ressources.
3. **Handler d'erreurs global** + migration `@app.on_event` → `lifespan`, retirer `create_all` au profit d'Alembic.
4. **Accessibilité** : lier `<label htmlFor>`/`id`, audit Lighthouse, contrastes AA.

### 🟡 Sprint 4 — Métier scraping & données (3-5 jours) — *Bloc 1/2*
1. **Merger** `feature/base-for-scraping` / `feature/profile` après ajout de tests.
2. Implémenter les entités du MCD au-delà de `users` (Composant, Alerte, Wishlist, HistoriquePrix…).
3. Isoler les règles métier scraping ; documenter patterns (Repository, Strategy par site).

### 🟢 Sprint 5 — Documentation & déploiement (Démo 4) — *Bloc 2/3*
1. Doc technique d'archi (schéma couches), doc API (OpenAPI exporté), docstrings.
2. **Doc de déploiement** + config dev/test/prod + sécurité (HTTPS, SSH, moindre privilège).
3. Environnement de test/staging.

### 🟢 Sprint 6 — Conformité & dossier projet (transversal) — *📄 hors code*
1. **RGPD** : mentions légales + politique de confidentialité (on stocke emails + mots de passe).
2. **Éco-conception** : section + bonnes pratiques (poids des assets, requêtes).
3. **Dossier projet** : cahier des charges, charte graphique + maquettes (Figma), choix techniques justifiés, glossaire, **résumé en anglais**, veille, gestion d'incidents, captures/diagrammes.
4. **Démonstration / vidéo** (Démo 4).

---

## 5. Top 5 des priorités absolues

1. 🔴 **Externaliser les secrets** (`.env`) + corriger CORS + supprimer `admin/admin`.
2. 🔴 **Mettre en place les tests** (back + front) — 0/11 aujourd'hui, bloquant Bloc 3.
3. 🔴 **Créer la CI/CD** (`.github/workflows`) — 0/5 DevOps, bloquant Bloc 3.
4. 🟠 **Autorisation par rôle** (back + front) — le rôle existe mais n'est jamais vérifié.
5. 🟠 **Charte graphique + maquettes** — 0/12 sur l'UI design, livrables Démo 1.

---

*Audit généré pour servir de base de travail. Les statuts reflètent l'état de `main` à la date indiquée ; certains points (README/Docker) sont déjà adressés dans la PR #35.*

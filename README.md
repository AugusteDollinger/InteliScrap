# InteliScrap
A tool to help you build your very own custom computer with advanced component research and price comparison algorithms

# Brief InteliScrap

## Concept
Application de comparaison et suivi de prix pour composants informatiques, avec intelligence artificielle pour conseiller les utilisateurs.

## Fonctionnalités principales

### Recherche multi-sites
- Agrégation de prix depuis plusieurs plateformes (Amazon, eBay, etc.)
- Filtrage par continent/région
- Comparaison instantanée des offres

### Suivi des prix
- Historique des prix sous forme de graphiques
- Visualisation des tendances sur la durée
- Identification du meilleur moment pour acheter

### Conseils IA
- Recommandations personnalisées sur les composants
- Aide au choix selon le budget et les besoins
- Alertes intelligentes sur les bonnes affaires

### Notifications
- Alertes de baisse de prix
- Notifications de deals limités dans le temps
- Suivi des composants en wishlist

## Cible
Jeunes adultes (18-30 ans) passionnés de tech, gamers, créateurs de contenu, avec budget limité cherchant le meilleur rapport qualité/prix.

## Valeur ajoutée
Gain de temps, économies d'argent, conseils d'expert accessible à tous, tout-en-un pour l'achat de composants PC.


```mermaid
erDiagram
    Utilisateur {
        int id PK
        string pseudo UK
        string email UK
        string password
    }
    
    Composant {
        int id PK
        string nom
        string reference UK
        string categorie
        string marque
    }

    GpuSpecs {
        int id PK
        int id_composant
        string example_specs
    }
    
    CpuSpecs {
        int id PK
        int id_composant
        string example_specs
    } 
    
    Alerte {
        int id PK
        int utilisateur_id FK
        int composant_id FK
        decimal prix_cible
        boolean active
        datetime date_creation
    }
    
    Wishlist {
        int id PK
        int utilisateur_id FK
        int composant_id FK
        datetime date_ajout
    }
    
    Notification {
        int id PK
        int utilisateur_id FK
        int alerte_id FK
        string type
        string message
        boolean lue
        datetime date_envoi
    }
    
    HistoriquePrix {
        int id PK
        int composant_id FK
        int marchand_id FK
        decimal prix
        datetime date_releve
    }

    Utilisateur ||--o{ Alerte : "utilisateur_id"
    Utilisateur ||--o{ Wishlist : "utilisateur_id"
    Utilisateur ||--o{ Notification : "utilisateur_id"

    Composant ||--o{ Alerte : "composant_id"
    Composant ||--o{ Wishlist : "composant_id"
    Composant ||--o{ HistoriquePrix : "composant_id"
    Composant ||--o{ HistoriquePrix : "composant_id"
    Composant ||--o{ CpuSpecs : "composant_id"
    Composant ||--o{ GpuSpecs : "composant_id"
    
    Alerte ||--o{ Notification : "alerte_id"
```

## V-0.1
- Scrap --> AMAZON
- Charactéristiques CPU
- Alertes (Phone & Email) sur les tarifs (Pourcentages proposés)
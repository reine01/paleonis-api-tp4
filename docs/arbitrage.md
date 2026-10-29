## 1. Tableau de décision

| Donnée | Base choisie | Critère décisif | Forme retenue |
|---|---|---|---|
| Fiche technique d'une offre (N1) | MongoDB | Structure variable selon la catégorie et ajout fréquent de caractéristiques | Un document par offre dans la collection fiches_techniques |
| Événement serveur (N2) | MongoDB | Grand volume d'écritures, événements hétérogènes et consultation du plus récent au plus ancien | Un document par événement dans la collection evenements |
| Message de ticket (N3) | MongoDB | Ajouts réguliers, fil consulté dans son ensemble et volume potentiellement important | Un document par message dans la collection messages, référencé par ticketId |

### Justification des choix

**N1 — Fiches techniques :** les VPS, les noms de domaine et les serveurs dédiés possèdent des caractéristiques différentes. MongoDB permet de faire évoluer les fiches sans modifier les tables SQL à chaque ajout de propriété.

**N2 — Événements :** les événements sont nombreux, rarement modifiés et consultés par serveur, par type et par période. MongoDB permet de les indexer et de les trier efficacement.

**N3 — Messages :** un ticket peut contenir un grand nombre de messages. Une collection séparée évite de faire grossir un document unique et permet de trier ou paginer les messages.

Les clients, les abonnements, les serveurs, les offres et les tickets restent dans PostgreSQL lorsque leurs relations et leur intégrité sont nécessaires. MongoDB complète PostgreSQL sans le remplacer.

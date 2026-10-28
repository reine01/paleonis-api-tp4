-- PaLeonis : jeu d'essai (à charger après schema.sql)
-- Chargement : psql -U paleonis -h localhost -d paleonis -f database/seed.sql
-- Les ids d'abonnement (1 à 15) viennent de l'ordre d'insertion : schema.sql
-- doit avoir été rejoué avant ce fichier.

-- 3 datacenters (ids 1, 2, 3)
INSERT INTO datacenter (nom, ville) VALUES
    ('DC-Paris', 'Paris'),
    ('DC-Lyon', 'Lyon'),
    ('DC-Marseille', 'Marseille');

-- 4 techniciens
INSERT INTO technicien (email_technicien, nom, prenom, datacenter_id) VALUES
    ('lea.martin@paleonis.fr',   'Martin',  'Léa',   1),
    ('hugo.bernard@paleonis.fr', 'Bernard', 'Hugo',  1),
    ('sarah.petit@paleonis.fr',  'Petit',   'Sarah', 2),
    ('yanis.durand@paleonis.fr', 'Durand',  'Yanis', 3);

-- 8 offres (VPS Legacy est retirée de la vente)
INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente) VALUES
    ('VPS Start',           'vps',       5.99,   TRUE),
    ('VPS Pro',             'vps',       14.99,  TRUE),
    ('VPS Legacy',          'vps',       4.99,   FALSE),
    ('Mutualisé Essentiel', 'mutualise', 3.99,   TRUE),
    ('Mutualisé Business',  'mutualise', 9.99,   TRUE),
    ('Dédié Entry',         'dedie',     59.00,  TRUE),
    ('Dédié Power',         'dedie',     129.00, TRUE),
    ('Domaine .fr',         'domaine',   0.99,   TRUE);

-- 12 clients (6 particuliers, 5 entreprises, 1 particulier sans abonnement)
INSERT INTO client (email, nom, telephone, date_inscription, siret, type_client) VALUES
    ('alice.dupont@example.com',   'Alice Dupont',    '0612345678', '2023-02-14', NULL, 'particulier'),
    ('bruno.leroy@example.com',    'Bruno Leroy',     NULL,         '2023-05-03', NULL, 'particulier'),
    ('chloe.moreau@example.com',   'Chloé Moreau',    '0698765432', '2023-09-21', NULL, 'particulier'),
    ('david.simon@example.com',    'David Simon',     '0611223344', '2022-11-08', NULL, 'particulier'),
    ('emma.laurent@example.com',   'Emma Laurent',    NULL,         '2024-12-02', NULL, 'particulier'),
    ('farid.benali@example.com',   'Farid Benali',    '0655443322', '2025-08-10', NULL, 'particulier'),
    ('contact@techno-nova.fr',     'Technova SAS',    '0142000001', '2024-08-20', '81234567800012', 'entreprise'),
    ('admin@greenbyte.fr',         'GreenByte SARL',  '0472000002', '2024-12-15', '53209876500034', 'entreprise'),
    ('it@boulangerie-martin.fr',   'Boulangerie Martin', '0491000003', '2025-04-18', '40123456700021', 'entreprise'),
    ('dsi@logistrans.fr',          'LogisTrans SA',   '0142000004', '2023-10-12', '77788899900045', 'entreprise'),
    ('hello@pixelstudio.fr',       'Pixel Studio',    NULL,         '2025-06-25', '88899900011056', 'entreprise'),
    ('gina.rossi@example.com',     'Gina Rossi',      '0677889900', '2026-01-09', NULL, 'particulier');

-- 15 abonnements : actifs, suspendu, résiliés (prix_applique peut différer du prix catalogue)
INSERT INTO abonnement (client_email, offre_nom, date_debut, date_fin, statut_abonnement, prix_applique) VALUES
    ('alice.dupont@example.com',  'VPS Start',           '2024-01-10', NULL,         'actif',    5.99),    -- 1
    ('alice.dupont@example.com',  'Domaine .fr',         '2024-01-10', NULL,         'actif',    0.99),    -- 2
    ('bruno.leroy@example.com',   'VPS Pro',             '2024-03-01', NULL,         'actif',    14.99),   -- 3
    ('chloe.moreau@example.com',  'Mutualisé Essentiel', '2024-06-15', NULL,         'suspendu', 3.99),    -- 4
    ('david.simon@example.com',   'VPS Legacy',          '2023-04-01', '2024-04-01', 'resilie',  4.99),    -- 5
    ('emma.laurent@example.com',  'Mutualisé Business',  '2025-02-01', NULL,         'actif',    9.99),    -- 6
    ('contact@techno-nova.fr',    'Dédié Power',         '2024-09-01', NULL,         'actif',    129.00),  -- 7
    ('contact@techno-nova.fr',    'Domaine .fr',         '2024-09-01', NULL,         'actif',    0.99),    -- 8
    ('admin@greenbyte.fr',        'Dédié Entry',         '2025-01-15', NULL,         'actif',    59.00),   -- 9
    ('admin@greenbyte.fr',        'VPS Pro',             '2025-03-10', NULL,         'actif',    12.99),   -- 10
    ('it@boulangerie-martin.fr',  'Mutualisé Essentiel', '2025-04-20', NULL,         'actif',    3.49),    -- 11
    ('dsi@logistrans.fr',         'Dédié Power',         '2023-11-01', '2025-05-31', 'resilie',  119.00),  -- 12
    ('dsi@logistrans.fr',         'VPS Pro',             '2025-06-01', NULL,         'actif',    14.99),   -- 13
    ('hello@pixelstudio.fr',      'VPS Start',           '2025-07-01', NULL,         'actif',    5.99),    -- 14
    ('farid.benali@example.com',  'Domaine .fr',         '2025-08-12', NULL,         'actif',    0.99);    -- 15

-- 20 serveurs : 10 attribués, 10 libres (abonnement_id NULL), tous les statuts
INSERT INTO serveur (adresse_ip, nom_hote, statut, date_mise_service, datacenter_id, abonnement_id) VALUES
    -- Paris
    ('10.1.0.1', 'srv-par-01', 'en_service',   '2023-01-15', 1, 1),
    ('10.1.0.2', 'srv-par-02', 'en_service',   '2023-01-15', 1, 3),
    ('10.1.0.3', 'srv-par-03', 'en_service',   '2023-06-01', 1, 7),
    ('10.1.0.4', 'srv-par-04', 'en_service',   '2024-02-20', 1, 13),
    ('10.1.0.5', 'srv-par-05', 'en_service',   '2025-03-05', 1, NULL),
    ('10.1.0.6', 'srv-par-06', 'en_service',   '2025-03-05', 1, NULL),
    ('10.1.0.7', 'srv-par-07', 'maintenance',  '2022-09-10', 1, NULL),
    -- Lyon
    ('10.2.0.1', 'srv-lyo-01', 'maintenance',  '2023-04-12', 2, 4),
    ('10.2.0.2', 'srv-lyo-02', 'en_service',   '2023-04-12', 2, 6),
    ('10.2.0.3', 'srv-lyo-03', 'en_service',   '2024-05-30', 2, 11),
    ('10.2.0.4', 'srv-lyo-04', 'en_service',   '2025-01-20', 2, NULL),
    ('10.2.0.5', 'srv-lyo-05', 'en_service',   '2025-01-20', 2, NULL),
    ('10.2.0.6', 'srv-lyo-06', 'hors_service', '2021-11-02', 2, NULL),
    -- Marseille
    ('10.3.0.1', 'srv-mrs-01', 'en_service',   '2024-07-08', 3, 9),
    ('10.3.0.2', 'srv-mrs-02', 'en_service',   '2024-07-08', 3, 10),
    ('10.3.0.3', 'srv-mrs-03', 'en_service',   '2025-02-14', 3, 14),
    ('10.3.0.4', 'srv-mrs-04', 'en_service',   '2025-09-01', 3, NULL),
    ('10.3.0.5', 'srv-mrs-05', 'en_service',   '2025-09-01', 3, NULL),
    ('10.3.0.6', 'srv-mrs-06', 'maintenance',  '2023-10-17', 3, NULL),
    ('10.3.0.7', 'srv-mrs-07', 'hors_service', '2021-11-02', 3, NULL);

-- 10 tickets : toutes les priorités et tous les statuts
INSERT INTO ticket (sujet, description, date_ouverture, priorite, statut, client_email, serveur_ip, technicien_email) VALUES
    ('Site inaccessible',
     'Mon site renvoie une erreur 502 depuis ce matin.',
     '2026-10-20 09:15', 'haute', 'ouvert',
     'alice.dupont@example.com', '10.1.0.1', NULL),
    ('Lenteurs sur le VPS',
     'Les temps de réponse ont doublé depuis une semaine.',
     '2026-10-18 14:30', 'normale', 'en_cours',
     'bruno.leroy@example.com', '10.1.0.2', 'lea.martin@paleonis.fr'),
    ('Disque saturé',
     'Le disque est plein à 100 %, les sauvegardes échouent.',
     '2026-10-22 08:05', 'critique', 'en_cours',
     'contact@techno-nova.fr', '10.1.0.3', 'hugo.bernard@paleonis.fr'),
    ('Certificat SSL expiré',
     'Le navigateur affiche un avertissement de sécurité.',
     '2026-10-10 11:00', 'haute', 'resolu',
     'emma.laurent@example.com', '10.2.0.2', 'sarah.petit@paleonis.fr'),
    ('Demande de snapshot',
     'Pouvez-vous réaliser un snapshot avant ma mise à jour ?',
     '2026-09-28 16:45', 'basse', 'ferme',
     'admin@greenbyte.fr', '10.3.0.1', 'yanis.durand@paleonis.fr'),
    ('Question sur la facturation',
     'Je ne comprends pas le montant de ma dernière facture.',
     '2026-10-25 10:20', 'basse', 'ouvert',
     'it@boulangerie-martin.fr', NULL, NULL),
    ('Perte de connectivité',
     'Le serveur ne répond plus au ping depuis 30 minutes.',
     '2026-10-27 07:50', 'critique', 'ouvert',
     'dsi@logistrans.fr', '10.1.0.4', 'lea.martin@paleonis.fr'),
    ('Maintenance prolongée',
     'Mon serveur est en maintenance depuis trois jours.',
     '2026-10-05 13:10', 'normale', 'resolu',
     'chloe.moreau@example.com', '10.2.0.1', 'sarah.petit@paleonis.fr'),
    ('Transfert de domaine',
     'Je souhaite transférer mon nom de domaine vers un autre registrar.',
     '2026-09-15 09:00', 'normale', 'ferme',
     'farid.benali@example.com', NULL, 'yanis.durand@paleonis.fr'),
    ('Mise à jour de PHP',
     'Pouvez-vous passer le serveur en PHP 8.3 ?',
     '2026-10-24 15:35', 'haute', 'en_cours',
     'hello@pixelstudio.fr', '10.3.0.3', 'yanis.durand@paleonis.fr');

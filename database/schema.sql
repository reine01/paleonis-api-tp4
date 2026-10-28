-- PaLeonis : schéma PostgreSQL (rejouable)
-- Chargement : psql -U paleonis -h localhost -d paleonis -f database/schema.sql

DROP TABLE IF EXISTS ticket CASCADE;
DROP TABLE IF EXISTS serveur CASCADE;
DROP TABLE IF EXISTS abonnement CASCADE;
DROP TABLE IF EXISTS technicien CASCADE;
DROP TABLE IF EXISTS datacenter CASCADE;
DROP TABLE IF EXISTS offre CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP FUNCTION IF EXISTS empecher_suppression_client_actif() CASCADE;

-- RG4 : datacenters
CREATE TABLE datacenter (
    id_datacenter INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom           VARCHAR(80) NOT NULL,
    ville         VARCHAR(80) NOT NULL
);

-- RG1 : client (particulier ou entreprise, identifié par son email)
CREATE TABLE client (
    email            VARCHAR(255) PRIMARY KEY,
    nom              VARCHAR(150) NOT NULL,
    telephone        VARCHAR(20),
    date_inscription DATE NOT NULL DEFAULT CURRENT_DATE,
    siret            CHAR(14) UNIQUE,
    type_client      VARCHAR(12) NOT NULL
        CHECK (type_client IN ('particulier', 'entreprise')),
    CHECK (siret IS NULL OR siret ~ '^[0-9]{14}$'),
    -- le SIRET est obligatoire pour une entreprise, interdit pour un particulier
    CHECK ((type_client = 'entreprise') = (siret IS NOT NULL))
);

-- RG2 : offres (retirées de la vente, jamais supprimées)
CREATE TABLE offre (
    nom             VARCHAR(100) PRIMARY KEY,
    categorie       VARCHAR(20) NOT NULL
        CHECK (categorie IN ('vps', 'mutualise', 'dedie', 'domaine')),
    prix_mensuel_ht NUMERIC(10,2) NOT NULL CHECK (prix_mensuel_ht >= 0),
    en_vente        BOOLEAN NOT NULL DEFAULT TRUE
);

-- RG3 : abonnements
CREATE TABLE abonnement (
    id_abonnement    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_email     VARCHAR(255) NOT NULL
        REFERENCES client(email) ON UPDATE CASCADE ON DELETE CASCADE,
    offre_nom        VARCHAR(100) NOT NULL
        REFERENCES offre(nom) ON UPDATE CASCADE ON DELETE RESTRICT,
    date_debut       DATE NOT NULL DEFAULT CURRENT_DATE,
    date_fin         DATE,
    statut_abonnement VARCHAR(10) NOT NULL DEFAULT 'actif'
        CHECK (statut_abonnement IN ('actif', 'suspendu', 'resilie')),
    prix_applique    NUMERIC(10,2) NOT NULL CHECK (prix_applique >= 0),
    CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

-- RG5 : serveurs (libre si abonnement_id est NULL)
CREATE TABLE serveur (
    adresse_ip           INET PRIMARY KEY,
    nom_hote             VARCHAR(100) NOT NULL UNIQUE,
    statut               VARCHAR(15) NOT NULL
        CHECK (statut IN ('en_service', 'maintenance', 'hors_service')),
    date_mise_service    DATE NOT NULL,
    datacenter_id        INTEGER NOT NULL
        REFERENCES datacenter(id_datacenter) ON DELETE RESTRICT,
    abonnement_id        INTEGER UNIQUE
        REFERENCES abonnement(id_abonnement) ON DELETE SET NULL
);

-- RG7 : techniciens
CREATE TABLE technicien (
    email_technicien VARCHAR(255) PRIMARY KEY,
    nom              VARCHAR(80) NOT NULL,
    prenom           VARCHAR(80) NOT NULL,
    datacenter_id    INTEGER NOT NULL
        REFERENCES datacenter(id_datacenter) ON DELETE RESTRICT
);

-- RG6 et RG7 : tickets
CREATE TABLE ticket (
    ticket_id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sujet            VARCHAR(200) NOT NULL,
    description      TEXT NOT NULL,
    date_ouverture   TIMESTAMP NOT NULL DEFAULT NOW(),
    priorite         VARCHAR(10) NOT NULL DEFAULT 'normale'
        CHECK (priorite IN ('basse', 'normale', 'haute', 'critique')),
    statut           VARCHAR(10) NOT NULL DEFAULT 'ouvert'
        CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme')),
    client_email     VARCHAR(255) NOT NULL
        REFERENCES client(email) ON UPDATE CASCADE ON DELETE CASCADE,
    serveur_ip       INET
        REFERENCES serveur(adresse_ip) ON UPDATE CASCADE ON DELETE SET NULL,
    technicien_email VARCHAR(255)
        REFERENCES technicien(email_technicien) ON UPDATE CASCADE ON DELETE SET NULL
);

-- RG8 : on ne supprime jamais un client qui a encore un abonnement actif
CREATE FUNCTION empecher_suppression_client_actif() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM abonnement
        WHERE client_email = OLD.email AND statut_abonnement = 'actif'
    ) THEN
        RAISE EXCEPTION 'Suppression impossible : le client % a encore un abonnement actif', OLD.email
            USING ERRCODE = '23503';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_suppression
    BEFORE DELETE ON client
    FOR EACH ROW EXECUTE FUNCTION empecher_suppression_client_actif();

-- Index sur les colonnes les plus filtrées
CREATE INDEX idx_abonnement_client ON abonnement(client_email);
CREATE INDEX idx_serveur_datacenter ON serveur(datacenter_id);
CREATE INDEX idx_ticket_technicien ON ticket(technicien_email);

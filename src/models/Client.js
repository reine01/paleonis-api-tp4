const pool = require("../config/db");
const HttpError = require("../utils/HttpError");
const { buildSet } = require("../utils/validation");

const COLONNES = "email, nom, telephone, date_inscription, siret, type_client";

class Client {
  // B1 : liste + recherche par nom ou email (insensible à la casse, partielle)
  static async findAll({ nom, email } = {}) {
    const { rows } = await pool.query(
      `SELECT ${COLONNES} FROM client
       WHERE ($1::text IS NULL OR nom ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR email ILIKE '%' || $2 || '%')
       ORDER BY nom`,
      [nom ?? null, email ?? null]
    );
    return rows;
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(`SELECT ${COLONNES} FROM client WHERE email = $1`, [email]);
    return rows[0] ?? null;
  }

  // B5 : fiche complète (infos + abonnements avec offre + serveur éventuel)
  static async findFiche(email) {
    const client = await Client.findByEmail(email);
    if (!client) return null;

    const { rows: abonnements } = await pool.query(
      `SELECT a.id_abonnement, a.offre_nom, o.categorie,
              a.date_debut, a.date_fin, a.statut_abonnement,
              a.prix_applique::float AS prix_applique,
              s.adresse_ip, s.nom_hote, s.statut AS statut_serveur,
              d.nom AS datacenter
       FROM abonnement a
       JOIN offre o           ON o.nom = a.offre_nom
       LEFT JOIN serveur s    ON s.abonnement_id = a.id_abonnement
       LEFT JOIN datacenter d ON d.id_datacenter = s.datacenter_id
       WHERE a.client_email = $1
       ORDER BY a.date_debut DESC, a.id_abonnement DESC`,
      [email]
    );

    return {
      ...client,
      abonnements: abonnements.map((a) => ({
        id_abonnement: a.id_abonnement,
        offre: { nom: a.offre_nom, categorie: a.categorie },
        date_debut: a.date_debut,
        date_fin: a.date_fin,
        statut: a.statut_abonnement,
        prix_applique: a.prix_applique,
        serveur: a.adresse_ip
          ? { adresse_ip: a.adresse_ip, nom_hote: a.nom_hote, statut: a.statut_serveur, datacenter: a.datacenter }
          : null,
      })),
    };
  }

  static async create({ email, nom, telephone, siret, type_client }) {
    const { rows } = await pool.query(
      `INSERT INTO client (email, nom, telephone, siret, type_client)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLONNES}`,
      [email, nom, telephone ?? null, siret ?? null, type_client]
    );
    return rows[0];
  }

  // PUT : remplacement complet (les champs facultatifs absents repassent à NULL)
  static async replace(email, { nom, telephone, siret, type_client }) {
    const { rows } = await pool.query(
      `UPDATE client SET nom = $1, telephone = $2, siret = $3, type_client = $4
       WHERE email = $5
       RETURNING ${COLONNES}`,
      [nom, telephone ?? null, siret ?? null, type_client, email]
    );
    return rows[0] ?? null;
  }

  // PATCH : modification partielle (l'email peut changer, ON UPDATE CASCADE suit)
  static async update(email, data) {
    const { set, values } = buildSet(data, ["email", "nom", "telephone", "siret", "type_client"]);
    const { rows } = await pool.query(
      `UPDATE client SET ${set} WHERE email = $${values.length + 1} RETURNING ${COLONNES}`,
      [...values, email]
    );
    return rows[0] ?? null;
  }

  // RG8 : le trigger de la base refuse la suppression si un abonnement est actif
  static async delete(email) {
    try {
      const { rowCount } = await pool.query("DELETE FROM client WHERE email = $1", [email]);
      return rowCount > 0;
    } catch (err) {
      if (err.code === "23503") {
        throw new HttpError(409, "CLIENT_ABONNEMENT_ACTIF", "Suppression impossible : le client a encore un abonnement actif");
      }
      throw err;
    }
  }
}

module.exports = Client;

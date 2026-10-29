const pool = require("../config/db");
const { buildSet } = require("../utils/validation");

// NUMERIC revient en chaîne côté JS : on caste en float dans le SELECT
const COLONNES = "nom, categorie, prix_mensuel_ht::float AS prix_mensuel_ht, en_vente";

class Offre {
  // B2 : filtre par catégorie et/ou uniquement les offres en vente
  static async findAll({ categorie, en_vente } = {}) {
    const { rows } = await pool.query(
      `SELECT ${COLONNES} FROM offre
       WHERE ($1::text IS NULL OR categorie = $1)
         AND ($2::boolean IS NULL OR en_vente = $2)
       ORDER BY categorie, prix_mensuel_ht`,
      [categorie ?? null, en_vente ?? null]
    );
    return rows;
  }

  static async findByNom(nom) {
    const { rows } = await pool.query(`SELECT ${COLONNES} FROM offre WHERE nom = $1`, [nom]);
    return rows[0] ?? null;
  }

  static async create({ nom, categorie, prix_mensuel_ht, en_vente }) {
    const { rows } = await pool.query(
      `INSERT INTO offre (nom, categorie, prix_mensuel_ht, en_vente)
       VALUES ($1, $2, $3, COALESCE($4, TRUE))
       RETURNING ${COLONNES}`,
      [nom, categorie, prix_mensuel_ht, en_vente ?? null]
    );
    return rows[0];
  }

  // PUT : remplacement complet de l'offre (hors nom, qui est l'identifiant)
  static async replace(nom, { categorie, prix_mensuel_ht, en_vente }) {
    const { rows } = await pool.query(
      `UPDATE offre SET categorie = $1, prix_mensuel_ht = $2, en_vente = $3
       WHERE nom = $4
       RETURNING ${COLONNES}`,
      [categorie, prix_mensuel_ht, en_vente, nom]
    );
    return rows[0] ?? null;
  }

  // PATCH : modification partielle, dont le retrait de la vente ({ "en_vente": false })
  // Les abonnements existants gardent leur prix_applique : RG2 et RG3 respectées
  static async update(nom, data) {
    const { set, values } = buildSet(data, ["nom", "categorie", "prix_mensuel_ht", "en_vente"]);
    const { rows } = await pool.query(
      `UPDATE offre SET ${set} WHERE nom = $${values.length + 1} RETURNING ${COLONNES}`,
      [...values, nom]
    );
    return rows[0] ?? null;
  }
}

module.exports = Offre;

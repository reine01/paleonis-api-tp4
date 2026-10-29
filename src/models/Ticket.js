const pool = require("../config/db");
const HttpError = require("../utils/HttpError");
const { buildSet } = require("../utils/validation");

const COLONNES = `ticket_id, sujet, description, date_ouverture, priorite, statut,
                  client_email, serveur_ip, technicien_email`;

class Ticket {
  static async findById(id) {
    const { rows } = await pool.query(`SELECT ${COLONNES} FROM ticket WHERE ticket_id = $1`, [id]);
    return rows[0] ?? null;
  }

  // B7 : ouverture d'un ticket (RG6 : le serveur, s'il est donné, doit appartenir au client)
  static async create({ sujet, description, priorite, client_email, serveur_ip, technicien_email }) {
    if (serveur_ip) {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM serveur s
         JOIN abonnement a ON a.id_abonnement = s.abonnement_id
         WHERE s.adresse_ip = $1 AND a.client_email = $2`,
        [serveur_ip, client_email]
      );
      if (!rowCount) {
        throw new HttpError(422, "SERVEUR_HORS_CLIENT", "Ce serveur n'est pas attribué à ce client");
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO ticket (sujet, description, priorite, client_email, serveur_ip, technicien_email)
       VALUES ($1, $2, COALESCE($3, 'normale'), $4, $5, $6)
       RETURNING ${COLONNES}`,
      [sujet, description, priorite ?? null, client_email, serveur_ip ?? null, technicien_email ?? null]
    );
    return rows[0];
  }

  // B7 : assignation à un technicien et/ou évolution du statut ou de la priorité
  static async update(id, data) {
    const actuel = await Ticket.findById(id);
    if (!actuel) return null;
    if (actuel.statut === "ferme") {
      throw new HttpError(409, "TICKET_FERME", "Un ticket fermé ne peut plus être modifié");
    }

    const { set, values } = buildSet(data, ["statut", "priorite", "technicien_email"]);
    const { rows } = await pool.query(
      `UPDATE ticket SET ${set} WHERE ticket_id = $${values.length + 1} RETURNING ${COLONNES}`,
      [...values, id]
    );
    return rows[0] ?? null;
  }

  // B8 : tickets non fermés d'un technicien, du plus critique au moins critique
  static async findOuvertsByTechnicien(email) {
    const { rows } = await pool.query(
      `SELECT ${COLONNES} FROM ticket
       WHERE technicien_email = $1 AND statut <> 'ferme'
       ORDER BY CASE priorite
                  WHEN 'critique' THEN 1
                  WHEN 'haute'    THEN 2
                  WHEN 'normale'  THEN 3
                  ELSE 4
                END,
                date_ouverture`,
      [email]
    );
    return rows;
  }
}

module.exports = Ticket;

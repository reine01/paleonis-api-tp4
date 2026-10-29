const pool = require("../config/db");

class Serveur {
  // B6 : filtres datacenter, statut, libre/attribué (tous facultatifs et combinables)
  static async findAll({ datacenter, statut, libre } = {}) {
    const { rows } = await pool.query(
      `SELECT s.adresse_ip, s.nom_hote, s.statut, s.date_mise_service,
              s.datacenter_id, d.nom AS datacenter, s.abonnement_id,
              (s.abonnement_id IS NULL) AS libre
       FROM serveur s
       JOIN datacenter d ON d.id_datacenter = s.datacenter_id
       WHERE ($1::int IS NULL OR s.datacenter_id = $1)
         AND ($2::text IS NULL OR s.statut = $2)
         AND ($3::boolean IS NULL OR (s.abonnement_id IS NULL) = $3)
       ORDER BY d.nom, s.nom_hote`,
      [datacenter ?? null, statut ?? null, libre ?? null]
    );
    return rows;
  }
}

module.exports = Serveur;

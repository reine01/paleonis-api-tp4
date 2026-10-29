const pool = require("../config/db");

const SELECT = `SELECT t.email_technicien, t.nom, t.prenom, t.datacenter_id, d.nom AS datacenter
                FROM technicien t
                JOIN datacenter d ON d.id_datacenter = t.datacenter_id`;

class Technicien {
  static async findAll() {
    const { rows } = await pool.query(`${SELECT} ORDER BY t.nom, t.prenom`);
    return rows;
  }

  static async findByEmail(email) {
    const { rows } = await pool.query(`${SELECT} WHERE t.email_technicien = $1`, [email]);
    return rows[0] ?? null;
  }
}

module.exports = Technicien;

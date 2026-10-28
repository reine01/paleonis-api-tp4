const pool = require("../config/db");

class Datacenter {
  static async findAll() {
    const { rows } = await pool.query(
      "SELECT id_datacenter, nom, ville FROM datacenter ORDER BY nom"
    );
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query(
      "SELECT id_datacenter, nom, ville FROM datacenter WHERE id_datacenter = $1",
      [id]
    );
    return rows[0] ?? null;
  }
}

module.exports = Datacenter;
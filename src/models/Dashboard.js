const pool = require("../config/db");

class Dashboard {
  // B9 : CA mensuel des abonnements actifs (total + par catégorie) et serveurs par datacenter/statut
  static async get() {
    const { rows: [total] } = await pool.query(
      `SELECT COALESCE(SUM(prix_applique), 0)::float AS ca_mensuel_ht,
              COUNT(*)::int AS nb_abonnements_actifs
       FROM abonnement
       WHERE statut_abonnement = 'actif'`
    );

    const { rows: parCategorie } = await pool.query(
      `SELECT o.categorie,
              SUM(a.prix_applique)::float AS ca_mensuel_ht,
              COUNT(*)::int AS nb_abonnements
       FROM abonnement a
       JOIN offre o ON o.nom = a.offre_nom
       WHERE a.statut_abonnement = 'actif'
       GROUP BY o.categorie
       ORDER BY ca_mensuel_ht DESC`
    );

    const { rows: serveurs } = await pool.query(
      `SELECT d.nom AS datacenter, s.statut, COUNT(*)::int AS nb_serveurs
       FROM serveur s
       JOIN datacenter d ON d.id_datacenter = s.datacenter_id
       GROUP BY d.nom, s.statut
       ORDER BY d.nom, s.statut`
    );

    return {
      chiffre_affaires: { ...total, par_categorie: parCategorie },
      serveurs_par_datacenter: serveurs,
    };
  }
}

module.exports = Dashboard;

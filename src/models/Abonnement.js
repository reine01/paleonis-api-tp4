const pool = require("../config/db");
const HttpError = require("../utils/HttpError");

const COLONNES = `id_abonnement, client_email, offre_nom, date_debut, date_fin,
                  statut_abonnement, prix_applique::float AS prix_applique`;

class Abonnement {
  // B3 : souscription + attribution d'un serveur libre, en une seule transaction
  static async souscrire({ client_email, offre_nom, datacenter_id }) {
    const conn = await pool.connect();
    try {
      await conn.query("BEGIN");

      // 1. L'offre existe-t-elle et est-elle en vente ?
      const { rows: [offre] } = await conn.query(
        "SELECT categorie, prix_mensuel_ht, en_vente FROM offre WHERE nom = $1",
        [offre_nom]
      );
      if (!offre) throw new HttpError(404, "OFFRE_INTROUVABLE", "Offre introuvable");
      if (!offre.en_vente) throw new HttpError(409, "OFFRE_RETIREE", "Cette offre n'est plus en vente");

      const besoinServeur = offre.categorie !== "domaine";
      if (besoinServeur && (datacenter_id === undefined || datacenter_id === null)) {
        throw new HttpError(400, "CHAMP_MANQUANT", "datacenter_id est obligatoire pour un hébergement");
      }

      // 2. Création de l'abonnement au prix catalogue du moment (RG3)
      //    Si le client n'existe pas, la clé étrangère lève 23503 -> 404
      const { rows: [abonnement] } = await conn.query(
        `INSERT INTO abonnement (client_email, offre_nom, prix_applique)
         VALUES ($1, $2, $3)
         RETURNING ${COLONNES}`,
        [client_email, offre_nom, offre.prix_mensuel_ht]
      );

      // 3. Attribution d'un serveur libre du datacenter demandé
      abonnement.serveur = null;
      if (besoinServeur) {
        const { rowCount: dcExiste } = await conn.query(
          "SELECT 1 FROM datacenter WHERE id_datacenter = $1",
          [datacenter_id]
        );
        if (!dcExiste) throw new HttpError(404, "DATACENTER_INTROUVABLE", "Datacenter introuvable");

        // FOR UPDATE SKIP LOCKED : deux souscriptions simultanées ne prennent pas le même serveur
        const { rows: [serveur] } = await conn.query(
          `SELECT adresse_ip FROM serveur
           WHERE datacenter_id = $1 AND abonnement_id IS NULL AND statut = 'en_service'
           ORDER BY date_mise_service DESC
           LIMIT 1
           FOR UPDATE SKIP LOCKED`,
          [datacenter_id]
        );
        if (!serveur) {
          throw new HttpError(409, "AUCUN_SERVEUR_LIBRE", "Aucun serveur libre en service dans ce datacenter");
        }

        const { rows: [attribue] } = await conn.query(
          `UPDATE serveur SET abonnement_id = $1 WHERE adresse_ip = $2
           RETURNING adresse_ip, nom_hote, statut, datacenter_id`,
          [abonnement.id_abonnement, serveur.adresse_ip]
        );
        abonnement.serveur = attribue;
      }

      await conn.query("COMMIT");
      return abonnement;
    } catch (err) {
      await conn.query("ROLLBACK"); // rien n'est enregistré à moitié
      throw err;
    } finally {
      conn.release();
    }
  }

  // B4 : résiliation, le serveur redevient libre (transaction aussi)
  static async resilier(id) {
    const conn = await pool.connect();
    try {
      await conn.query("BEGIN");

      const { rows: [actuel] } = await conn.query(
        "SELECT statut_abonnement FROM abonnement WHERE id_abonnement = $1 FOR UPDATE",
        [id]
      );
      if (!actuel) throw new HttpError(404, "ABONNEMENT_INTROUVABLE", "Abonnement introuvable");
      if (actuel.statut_abonnement === "resilie") {
        throw new HttpError(409, "DEJA_RESILIE", "Cet abonnement est déjà résilié");
      }

      const { rows: [abonnement] } = await conn.query(
        `UPDATE abonnement
         SET statut_abonnement = 'resilie', date_fin = GREATEST(CURRENT_DATE, date_debut)
         WHERE id_abonnement = $1
         RETURNING ${COLONNES}`,
        [id]
      );

      const { rows: liberes } = await conn.query(
        "UPDATE serveur SET abonnement_id = NULL WHERE abonnement_id = $1 RETURNING adresse_ip, nom_hote",
        [id]
      );

      await conn.query("COMMIT");
      return { ...abonnement, serveur_libere: liberes[0] ?? null };
    } catch (err) {
      await conn.query("ROLLBACK");
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = Abonnement;

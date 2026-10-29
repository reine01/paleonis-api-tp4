const Serveur = require("../models/Serveur");
const HttpError = require("../utils/HttpError");

const STATUTS = ["en_service", "maintenance", "hors_service"];

exports.getAll = async (req, res) => {
  const { datacenter, statut, libre } = req.query;

  if (statut !== undefined && !STATUTS.includes(statut)) {
    throw new HttpError(400, "FORMAT_INVALIDE", `statut doit valoir ${STATUTS.join(", ")}`);
  }
  if (libre !== undefined && !["true", "false"].includes(libre)) {
    throw new HttpError(400, "FORMAT_INVALIDE", "libre doit valoir true ou false");
  }

  res.status(200).json(
    await Serveur.findAll({
      datacenter,
      statut,
      libre: libre === undefined ? undefined : libre === "true",
    })
  );
};

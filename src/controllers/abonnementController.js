const Abonnement = require("../models/Abonnement");
const { requireFields } = require("../utils/validation");

exports.souscrire = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["client_email", "offre_nom"]);
  res.status(201).json(await Abonnement.souscrire(body));
};

exports.resilier = async (req, res) => {
  res.status(200).json(await Abonnement.resilier(req.params.id));
};

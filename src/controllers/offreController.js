const Offre = require("../models/Offre");
const HttpError = require("../utils/HttpError");
const { requireFields, requireOneOf } = require("../utils/validation");

const notFound = () => new HttpError(404, "OFFRE_INTROUVABLE", "Offre introuvable");

// "true"/"false" en query string -> booléen, sinon 400
function parseBool(valeur, nomParam) {
  if (valeur === undefined) return undefined;
  if (valeur === "true") return true;
  if (valeur === "false") return false;
  throw new HttpError(400, "FORMAT_INVALIDE", `${nomParam} doit valoir true ou false`);
}

exports.getAll = async (req, res) => {
  const { categorie } = req.query;
  const en_vente = parseBool(req.query.en_vente, "en_vente");
  res.status(200).json(await Offre.findAll({ categorie, en_vente }));
};

exports.getByNom = async (req, res) => {
  const offre = await Offre.findByNom(req.params.nom);
  if (!offre) throw notFound();
  res.status(200).json(offre);
};

exports.create = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["nom", "categorie", "prix_mensuel_ht"]);
  res.status(201).json(await Offre.create(body));
};

exports.replace = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["categorie", "prix_mensuel_ht", "en_vente"]);
  const offre = await Offre.replace(req.params.nom, body);
  if (!offre) throw notFound();
  res.status(200).json(offre);
};

exports.update = async (req, res) => {
  const body = req.body ?? {};
  requireOneOf(body, ["nom", "categorie", "prix_mensuel_ht", "en_vente"]);
  const offre = await Offre.update(req.params.nom, body);
  if (!offre) throw notFound();
  res.status(200).json(offre);
};

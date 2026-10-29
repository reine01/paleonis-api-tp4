// Express 5 transmet automatiquement les erreurs des fonctions async au middleware d'erreurs
const Client = require("../models/Client");
const HttpError = require("../utils/HttpError");
const { requireFields, requireOneOf, checkEmail } = require("../utils/validation");

const notFound = () => new HttpError(404, "CLIENT_INTROUVABLE", "Client introuvable");

exports.getAll = async (req, res) => {
  const { nom, email } = req.query;
  res.status(200).json(await Client.findAll({ nom, email }));
};

exports.getByEmail = async (req, res) => {
  const client = await Client.findByEmail(req.params.email);
  if (!client) throw notFound();
  res.status(200).json(client);
};

exports.getFiche = async (req, res) => {
  const fiche = await Client.findFiche(req.params.email);
  if (!fiche) throw notFound();
  res.status(200).json(fiche);
};

exports.create = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["email", "nom", "type_client"]);
  checkEmail(body.email);
  res.status(201).json(await Client.create(body));
};

exports.replace = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["nom", "type_client"]);
  const client = await Client.replace(req.params.email, body);
  if (!client) throw notFound();
  res.status(200).json(client);
};

exports.update = async (req, res) => {
  const body = req.body ?? {};
  requireOneOf(body, ["email", "nom", "telephone", "siret", "type_client"]);
  if (body.email !== undefined) checkEmail(body.email);
  const client = await Client.update(req.params.email, body);
  if (!client) throw notFound();
  res.status(200).json(client);
};

exports.remove = async (req, res) => {
  const ok = await Client.delete(req.params.email);
  if (!ok) throw notFound();
  res.status(204).end();
};

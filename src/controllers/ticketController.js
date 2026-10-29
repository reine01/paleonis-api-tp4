const Ticket = require("../models/Ticket");
const Technicien = require("../models/Technicien");
const HttpError = require("../utils/HttpError");
const { requireFields, requireOneOf } = require("../utils/validation");

exports.create = async (req, res) => {
  const body = req.body ?? {};
  requireFields(body, ["sujet", "description", "client_email"]);
  res.status(201).json(await Ticket.create(body));
};

exports.update = async (req, res) => {
  const body = req.body ?? {};
  requireOneOf(body, ["statut", "priorite", "technicien_email"]);
  const ticket = await Ticket.update(req.params.id, body);
  if (!ticket) throw new HttpError(404, "TICKET_INTROUVABLE", "Ticket introuvable");
  res.status(200).json(ticket);
};

exports.getByTechnicien = async (req, res) => {
  const technicien = await Technicien.findByEmail(req.params.email);
  if (!technicien) throw new HttpError(404, "TECHNICIEN_INTROUVABLE", "Technicien introuvable");
  res.status(200).json(await Ticket.findOuvertsByTechnicien(req.params.email));
};

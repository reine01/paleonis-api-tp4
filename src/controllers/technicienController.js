const Technicien = require("../models/Technicien");
const HttpError = require("../utils/HttpError");

exports.getAll = async (req, res) => {
  res.status(200).json(await Technicien.findAll());
};

exports.getByEmail = async (req, res) => {
  const technicien = await Technicien.findByEmail(req.params.email);
  if (!technicien) throw new HttpError(404, "TECHNICIEN_INTROUVABLE", "Technicien introuvable");
  res.status(200).json(technicien);
};

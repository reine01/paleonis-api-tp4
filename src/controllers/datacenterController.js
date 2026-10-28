const Datacenter = require("../models/Datacenter");

exports.getAll = async (req, res, next) => {
  try {
    res.status(200).json(await Datacenter.findAll());
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const dc = await Datacenter.findById(req.params.id);
    if (!dc) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Datacenter introuvable" } });
    res.status(200).json(dc);
  } catch (err) { next(err); }
};
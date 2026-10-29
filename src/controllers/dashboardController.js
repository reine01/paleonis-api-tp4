const Dashboard = require("../models/Dashboard");

exports.get = async (req, res) => {
  res.status(200).json(await Dashboard.get());
};

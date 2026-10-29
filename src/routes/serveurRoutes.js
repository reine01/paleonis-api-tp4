const router = require("express").Router();
const ctrl = require("../controllers/serveurController");

router.get("/", ctrl.getAll);

module.exports = router;

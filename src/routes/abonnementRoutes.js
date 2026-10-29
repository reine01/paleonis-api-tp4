const router = require("express").Router();
const ctrl = require("../controllers/abonnementController");

router.post("/", ctrl.souscrire);
router.patch("/:id/resiliation", ctrl.resilier);

module.exports = router;

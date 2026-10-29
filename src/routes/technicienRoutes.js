const router = require("express").Router();
const ctrl = require("../controllers/technicienController");
const ticketCtrl = require("../controllers/ticketController");

// B10 : lecture seule
router.get("/", ctrl.getAll);
router.get("/:email", ctrl.getByEmail);
// B8
router.get("/:email/tickets", ticketCtrl.getByTechnicien);

module.exports = router;

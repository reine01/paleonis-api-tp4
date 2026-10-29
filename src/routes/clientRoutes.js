const router = require("express").Router();
const ctrl = require("../controllers/clientController");

router.get("/", ctrl.getAll);
router.get("/:email/fiche", ctrl.getFiche);
router.get("/:email", ctrl.getByEmail);
router.post("/", ctrl.create);
router.put("/:email", ctrl.replace);
router.patch("/:email", ctrl.update);
router.delete("/:email", ctrl.remove);

module.exports = router;

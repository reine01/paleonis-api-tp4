const router = require("express").Router();
const ctrl = require("../controllers/offreController");

router.get("/", ctrl.getAll);
router.get("/:nom", ctrl.getByNom);
router.post("/", ctrl.create);
router.put("/:nom", ctrl.replace);
router.patch("/:nom", ctrl.update);

module.exports = router;

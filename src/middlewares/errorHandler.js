module.exports = (err, req, res, next) => {
  const map = {
    "23505": [409, "DOUBLON"],
    "23503": [409, "CONTRAINTE_REFERENCE"],
    "23514": [422, "DONNEE_INVALIDE"],
    "22P02": [400, "FORMAT_INVALIDE"],
  };
  const [status, code] = map[err.code] || [500, "ERREUR_SERVEUR"];
  if (status === 500) console.error(err);
  res.status(status).json({ error: { code, message: err.message } });
};
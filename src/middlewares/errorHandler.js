module.exports = (err, req, res, next) => {
  const map = {
    "23505": [409, "DOUBLON"],
    "23503": [409, "CONTRAINTE_REFERENCE"],
    "23514": [422, "DONNEE_INVALIDE"],
    "22P02": [400, "FORMAT_INVALIDE"],
  };

  let status, code;
  if (err.status) {
    // erreur volontaire (AppError) ou erreur Express (JSON mal formé)
    [status, code] = [err.status, err.code || "REQUETE_INVALIDE"];
  } else if (err.name === "ValidationError") {
    [status, code] = [422, "DONNEE_INVALIDE"]; // Mongoose
  } else if (err.name === "CastError") {
    [status, code] = [400, "FORMAT_INVALIDE"]; // Mongoose
  } else if (err.code === 11000) {
    [status, code] = [409, "DOUBLON"]; // index unique Mongo
  } else {
    [status, code] = map[err.code] || [500, "ERREUR_SERVEUR"];
  }

  if (status === 500) console.error(err);
  res.status(status).json({ error: { code, message: err.message } });
};
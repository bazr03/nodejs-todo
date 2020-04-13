const jwt = require("jsonwebtoken");
// require("dotenv").config({ path: "variables.env" });

module.exports = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    // esto se manejara en los resolvers
    return next();
  }
  const token = authHeader.split(" ")[1];
  // console.log("token desde middleware auth: ", token);
  let decodedToken;
  try {
    decodedToken = await jwt.verify(token, process.env.JWT_KEY);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  // Una vez decodificado el token, es un objeto con la info que
  // le pasamos al crearlo, tons el id del usuario
  req.userId = decodedToken._id;
  req.isAuth = true;
  next();
};

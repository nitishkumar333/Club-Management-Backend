const jwt = require("jsonwebtoken");
const SERECT_KEY = process.env.SERECT_KEY;

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if(!authHeader){
    const error = new Error('Not authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = req.get("Authorization").split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, `${SERECT_KEY}`);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

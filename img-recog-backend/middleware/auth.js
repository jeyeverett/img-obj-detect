const redis = require("redis");

// Setup Redis
const redisClient = redis.createClient(
  process.env.REDIS_URL || process.env.REDIS_URI
);

module.exports.requireAuth = (req, res, next) => {
  const { authorization } = req.headers;

  const id = req.params.id || req.body.id;

  if (!authorization) {
    return res
      .status(401)
      .json({ errorMessage: "Unauthorized - Access Denied." });
  }

  redisClient.get(authorization.split(" ")[1], (err, reply) => {
    if (err || !reply) {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized - Access Denied." });
    } else if (Number(reply) === Number(id)) {
      return next();
    }
  });
};

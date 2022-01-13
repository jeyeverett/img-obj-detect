module.exports.handleSignout = (req, res, redisClient) => {
  const { authorization } = req.headers;
  const { id } = req.body;

  redisClient.get(authorization.split(" ")[1], (err, reply) => {
    if (err || !reply) {
      return res
        .status(401)
        .json({ errorMessage: "Unauthorized - Access Denied." });
    } else if (Number(reply) === Number(id)) {
      redisClient.del(authorization.split(" ")[1], (err, reply) => {
        return res
          .status(200)
          .json({ errorMessage: "Successfully signed out." });
      });
    }
  });
};

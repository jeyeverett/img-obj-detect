module.exports.handleProfileGet = async (req, res, db) => {
  const { id } = req.params;
  try {
    const getUser = db.select("*").from("users").where({ id });
    const getLeaderboard = db("global").orderBy("entries", "desc").limit(5);

    const [user, leaderboard] = await Promise.all([getUser, getLeaderboard]);

    if (user.length) {
      return res.json({ user: user[0], leaderboard });
    } else {
      return res.status(400).json({ error: "That user id does not exist." });
    }
  } catch (err) {
    res.status(400).json({ error: "Error retrieving user." });
  }
};

module.exports.handleProfileUpdate = (req, res, db) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  if (name === "") {
    return res.status(400).json("Name cannot be blank.");
  }

  db("users")
    .where({ id })
    .update({ name, bio })
    .returning("*")
    .then((user) => {
      if (user.length) {
        return res.status(200).json(user[0]);
      } else {
        throw new Error();
      }
    })
    .catch((err) => res.status(400).json("Error retrieving user."));
};

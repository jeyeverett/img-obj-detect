const jwt = require("jsonwebtoken");

const setToken = (key, value, redisClient) => {
  return Promise.resolve(redisClient.set(key, value));
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "2 days" });
};

const createSession = async (user, redisClient) => {
  const { email, id } = user;
  const token = signToken(email);
  await setToken(token, id, redisClient);
  return {
    user: { ...user },
    success: "true",
    token,
  };
};

module.exports.handleRegister = (req, res, db, bcrypt, redisClient) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json("Incorrect form submission - missing user information.");
  }

  // Not checking passwords yet - will implement later ******
  const formatPass = new RegExp(
    "^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})"
  );

  const formatEmail = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"
  );
  //Need to add password match later: !password.match(formatPass)
  if (!email.match(formatEmail)) {
    const message =
      "Error with credentials - email must be formatted as example@example.com - password..";
    return res.status(404).json(["Failed", { success: false, message }]);
  }

  const hash = bcrypt.hashSync(password, 10);

  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            return createSession(user[0], redisClient);
          })
          .then(async (data) => {
            const leaderboard = await db("global")
              .orderBy("entries", "desc")
              .limit(5);

            return res
              .status(200)
              .json({ success: true, userData: data, leaderboard });
          });
      })
      .then(trx.commit) //we have to commit the transaction at the end
      .catch(trx.rollback); //if there were any issues, we rollback everything to its initial state
  }).catch((err) => {
    if (err.detail.includes("already exists")) {
      res.status(400).json("Email already in use.");
    } else {
      res.status(400).json("Unable to register user.");
    }
  });
};

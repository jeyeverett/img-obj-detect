const jwt = require('jsonwebtoken');
const redis = require('redis');

// Setup Redis
const redisClient = redis.createClient(process.env.REDIS_URI);

const signInError = (status, message) => {
  let error = new Error();
  error.status = status;
  error.message = message;
  return error;
};

module.exports.handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return signInError(400, 'Incorrect form submission.');
  }

  return db
    .select('email', 'hash')
    .from('login')
    .where('email', '=', email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select('*')
          .from('users')
          .where('email', '=', email)
          .then((user) => user[0])
          .catch((err) => signInError(400, 'User not found.'));
      } else {
        return signInError(400, 'Wrong credentials.');
      }
    })
    .catch((err) => signInError(400, 'Wrong credentials.'));
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;

  return redisClient.get(authorization.split(' ')[1], (err, reply) => {
    if (err || !reply) {
      return res.status(401).json({ message: 'Unauthorized - Access Denied.' });
    }
    return res.json({ id: reply });
  });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' });
};

const createSession = (user) => {
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id).then(() => ({
    success: 'true',
    userId: id,
    token,
  }));
};

module.exports.handleAuthSignin = (req, res, db, bcrypt) => {
  const { authorization } = req.headers;

  return authorization
    ? getAuthTokenId(req, res)
    : this.handleSignin(req, res, db, bcrypt)
        .then((user) => {
          return user.id && user.email
            ? createSession(user)
            : signInError(400, 'Error signing in.');
        })
        .then((session) => res.status(200).json(session))
        .catch((err) =>
          res.status(err.status || 400).json(err.message || 'Sign in failed.')
        );
};

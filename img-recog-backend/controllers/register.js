const jwt = require('jsonwebtoken');
const redis = require('redis');

// Setup Redis
const redisClient = redis.createClient(process.env.REDIS_URI);

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const signToken = (email) => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '2 days' });
};

const createSession = async (user) => {
  const { email, id } = user;
  const token = signToken(email);
  await setToken(token, id);
  return {
    user: { ...user },
    success: 'true',
    token,
  };
};

module.exports.handleRegister = (req, res, db, bcrypt) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json('Incorrect form submission - missing user information.');
  }

  // Not checking passwords yet - will implement later ******
  const formatPass = new RegExp(
    '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
  );

  const formatEmail = new RegExp(
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$"
  );
  //Need to add password match later: !password.match(formatPass)
  if (!email.match(formatEmail)) {
    const message =
      'Error with credentials - email must be formatted as example@example.com - password..';
    return res.status(404).json(['Failed', { success: false, message }]); //On the front end we check for user[1].success, so I am returning an array here just to be consistent (i.e. so user[1].success is defined whether the registration is successful or not)
  }

  const hash = bcrypt.hashSync(password, 10);
  //Below we use knex syntax to insert a new user into our users table - note that returning('*') tells pg that after we insert, we will return all info on the newly created user - also note that we use the transaction syntax to make sure that if any database operation fails, the whole process fails (otherwise we would run into issues)
  db.transaction((trx) => {
    trx
      .insert({
        hash: hash,
        email: email,
      })
      .into('login')
      .returning('email')
      .then((loginEmail) => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date(),
          })
          .then((user) => {
            return createSession(user[0]);
          })
          .then((data) => {
            return res.status(200).json(data);
          });
      })
      .then(trx.commit) //we have to commit the transaction at the end
      .catch(trx.rollback); //if there were any issues, we rollback everything to its initial state
  }).catch((err) => {
    if (err.detail.includes('already exists')) {
      res.status(400).json('Email already in use.');
    } else {
      res.status(400).json('Unable to register user.');
    }
  });
};

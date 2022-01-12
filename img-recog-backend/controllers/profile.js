module.exports.handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select('*')
    .from('users')
    .where({ id })
    .then((user) => {
      if (user.length) {
        return res.json(user[0]);
      } else {
        return res.status(400).json('That user id does not exist.');
      }
    })
    .catch((err) => res.status(400).json('Error retrieving user.'));
};

module.exports.handleProfileUpdate = (req, res, db) => {
  const { id } = req.params;
  const { name, bio } = req.body;

  if (name === '') {
    return res.status(400).json('Name cannot be blank.');
  }

  db('users')
    .where({ id })
    .update({ name, bio })
    .returning('*')
    .then((user) => {
      if (user.length) {
        return res.status(200).json(user[0]);
      } else {
        throw new Error();
      }
    })
    .catch((err) => res.status(400).json('Error retrieving user.'));
};

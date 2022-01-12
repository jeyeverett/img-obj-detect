const Clarifai = require('clarifai');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = new Clarifai.App({
  apiKey: process.env.REACT_APP_CLARIFAI_API,
});

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json('API error.'));
};

const handleEntries = (req, res, db) => {
  const { id } = req.body;
  db('users')
    .where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then((entries) => {
      res.json(entries[0]);
    })
    .catch((err) => res.status(400).json('Error retrieving user.'));
};

module.exports = {
  handleEntries,
  handleApiCall,
};

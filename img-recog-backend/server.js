const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const cors = require('cors'); //No CORS is the default, so we use this package to enable CORS which we need to link our backend with our frontend
const morgan = require('morgan');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const signout = require('./controllers/signout');
const image = require('./controllers/image');
const profile = require('./controllers/profile');
const auth = require('./middleware/auth');

//This just allows us to use our environment valuables in development mode
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
//Knex is a package used to interact with a relational database
const db = require('knex')({
  client: 'pg',
  connection: process.env.POSTGRES_URI,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.get('/', (req, res) => res.json('home'));

//Passing in db and bcrypt to our register controller file is called dependency injection
app.post('/signin', (req, res) => {
  signin.handleAuthSignin(req, res, db, bcrypt);
});

app.post('/signout', auth.requireAuth, (req, res) => {
  signout.handleSignout(req, res);
});

app.post('/register', (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});

app.get('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.put('/profile/:id', auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.put('/image', auth.requireAuth, (req, res) => {
  image.handleEntries(req, res, db);
});

//Moved Clarifai API to backend because otherwise our API key would be visible over the network
app.post('/imageurl', auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server initiated on port ${PORT}.`);
  if (Boolean(db.client.connectionSettings)) {
    console.log('Database connected.');
  }
});

/*
ROUTES TEMPLATE

/ --> GET --> home page

/signin --> POST --> success/fail

/register --> POST --> return user

/profile/:userID --> GET --> return user

/image --> PUT --> return updated item


*/

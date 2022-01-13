const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const redis = require("redis");

const register = require("./controllers/register");
const signin = require("./controllers/signin");
const signout = require("./controllers/signout");
const image = require("./controllers/image");
const profile = require("./controllers/profile");
const auth = require("./middleware/auth");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const db = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL || process.env.POSTGRES_URI,
});

const redisClient = redis.createClient(
  process.env.REDIS_URL || process.env.REDIS_URI
);

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return next();
  });
}

app.use(express.static(path.join(__dirname, "img-recog-client/build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "img-recog-client/build", "index.html"));
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan("combined"));

//Passing in db and bcrypt to our register controller file is called dependency injection
app.post("/signin", (req, res) => {
  signin.handleAuthSignin(req, res, db, bcrypt, redisClient);
});

app.post("/signout", auth.requireAuth, (req, res) => {
  signout.handleSignout(req, res, redisClient);
});

app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt, redisClient);
});

app.get("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileGet(req, res, db);
});

app.put("/profile/:id", auth.requireAuth, (req, res) => {
  profile.handleProfileUpdate(req, res, db);
});

app.put("/image", auth.requireAuth, (req, res) => {
  image.handleEntries(req, res, db);
});

app.post("/imageurl", auth.requireAuth, (req, res) => {
  image.handleApiCall(req, res);
});

app.use((error, req, res, next) => {
  console.log(error);
  next();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server initiated on port ${PORT}.`);
  if (Boolean(db.client.connectionSettings)) {
    console.log("Database connected.");
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

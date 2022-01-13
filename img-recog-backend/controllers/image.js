if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const handleApiCall = (req, res) => {
  app.models
    .predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then((data) => {
      res.json(data);
    })
    .catch((err) => res.status(400).json("API error."));
};

const handleEntries = async (req, res, db) => {
  const { id, results } = req.body;
  const numObjects = Object.values(results).length;
  try {
    const entries = await db("users")
      .where("id", "=", id)
      .increment("entries", numObjects)
      .returning("entries");

    const global = await db("global").orderBy("entries", "desc");

    // const global = await db
    // .select("*")
    // .from("global")
    // .where("name", "=", "orange");

    console.log(global);

    res.json(entries[0]);
  } catch (err) {
    res.status(400).json("Error retrieving user.");
  }
};

module.exports = {
  handleEntries,
  handleApiCall,
};

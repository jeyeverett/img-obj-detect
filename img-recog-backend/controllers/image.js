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
  const detectedObjects = Object.keys(results);
  const numObjects = detectedObjects.length;

  try {
    const entries = await db("users")
      .where("id", "=", id)
      .increment("entries", numObjects)
      .returning("entries");

    for (const object of detectedObjects) {
      const name = object.toLowerCase();

      const exists = await db
        .select("*")
        .from("global")
        .where("name", "=", name);

      if (exists[0]) {
        await db("global").where("name", "=", name).increment("entries", 1);
      } else {
        await db("global").insert({ name, entries: 1 });
      }
    }

    const leaderboard = await db("global").orderBy("entries", "desc").limit(5);

    res.json({ entries: entries[0], leaderboard });
  } catch (err) {
    res.status(400).json({ error: "Error retrieving updated entries." });
  }
};

module.exports = {
  handleEntries,
  handleApiCall,
};

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/file.routes");
const connectToDB = require("./config/db");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/minxs-music", fileRoutes);

let isConnected = false;
const PORT = process.env.PORT || 5000;

connectToDB().then((status) => {
  isConnected = status;

  app.listen(PORT, () => console.log(`Server running on port - ${PORT}`));
});

app.get("/", (req, res) =>
  res.send({
    message: `Server running on port - ${PORT}`,
    db: isConnected ? "Connected to DB" : "Failed to connect to DB",
  })
);

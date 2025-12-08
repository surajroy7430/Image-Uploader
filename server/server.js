require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileRoutes = require("./routes/file.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/minxs-music", fileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port - ${PORT}`));

app.get("/", (req, res) =>
  res.send({
    message: "Server running successfully",
  })
);

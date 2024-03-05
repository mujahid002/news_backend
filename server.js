require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRouter = require("./components/routers/index.js");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(apiRouter);

app.get("/", (req, res) => {
  res.send("Hello Iam running on 5555!");
});

// Start the server and listen on port 5555
app.listen(5555, () => {
  console.log("App listening on port 5555");
  connectMongo();
});

const express = require("express");
const helmet = require("helmet");

const app = express();

// add some security-related headers to the response
app.use(helmet());

app.get("/", (req, res) => {
  res.set("Content-Type", "application/json");
  res.status(200).send(JSON.stringify({ status: "OK" }));
});

module.exports = app;

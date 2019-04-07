const express = require("express");
const helmet = require("helmet");

const app = express();
app.use(helmet());

app.get("*", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    200,
    `
  <h1>API List:</h1>
  <h2><a href="/api/val202">Val 202</a></h2>
  <h2><a href="/api/ra1">Radio Prvi</a></h2>
  <h2><a href="/api/rmb">Radio Maribor</a></h2>
`
  );
});

module.exports = app;

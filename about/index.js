const express = require("express");
const helmet = require("helmet");

const app = express();

// add some security-related headers to the response
app.use(helmet());

app.get("*", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    200,
    `
        <h1>Hello from Express path '/about' on Now 2.0!</h1>
        <h2>Go to <a href="/">/</a></h2>
    `
  );
});

module.exports = app;

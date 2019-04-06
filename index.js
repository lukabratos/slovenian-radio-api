import express from "express";
import helmet from "helmet";

const app = express();

// add some security-related headers to the response
app.use(helmet());

app.get("*", (req, res) => {
  res.set("Content-Type", "text/html");
  res.send(
    200,
    `
        <h1>Hello from Express path '/' on Now 2.0!</h1>
        <h2>Go to <a href="/about">/about</a></h2>
    `
  );
});

export default app;

const express = require("express");
const helmet = require("helmet");
const request = require("request");
const cheerio = require("cheerio");

const app = express();

// add some security-related headers to the response
app.use(helmet());

app.get("/api/val202", (req, res) => {
  res.set("Content-Type", "application/json");

  request("https://val202.rtvslo.si/spored/", function(error, response, body) {
    if (error != null) {
      console.error("error:", error);
    }

    var result = [];
    var scheduleTimeList = [];
    var scheduleTitleList = [];

    const $ = cheerio.load(body);
    const scheduleTime = $("div.schedule-time");
    const scheduleTitle = $("div.schedule-title");

    scheduleTime.each(function(i, e) {
      scheduleTimeList.push(
        $(this)
          .text()
          .trim()
      );
    });

    scheduleTitle.each(function(i, e) {
      scheduleTitleList.push(
        $(this)
          .text()
          .trim()
      );
    });

    for (i = 0; i < scheduleTitleList.length; i++) {
      result.push({ time: scheduleTimeList[i], title: scheduleTitleList[i] });
    }

    res.status(200).send(JSON.stringify(result));
  });
});

module.exports = app;

const express = require("express");
const helmet = require("helmet");
const request = require("request");
const cheerio = require("cheerio");

const app = express();
app.use(helmet());

function parseScheduleTime($) {
  var scheduleTimeList = [];
  const scheduleTime = $("div.schedule-time");

  scheduleTime.each(function() {
    scheduleTimeList.push(
      $(this)
        .text()
        .trim()
    );
  });

  return scheduleTimeList;
}

function parseScheduleTitle($) {
  var scheduleTitleList = [];
  const scheduleTitle = $("div.schedule-title");

  scheduleTitle.each(function() {
    scheduleTitleList.push(
      $(this)
        .text()
        .trim()
    );
  });

  return scheduleTitleList;
}

function generateScheduleJSON(timeList, titleList) {
  var result = [];
  for (i = 0; i < timeList.length; i++) {
    result.push({ time: timeList[i], title: titleList[i] });
  }

  return result;
}

app.get("/api/val202", (req, res) => {
  res.set("Content-Type", "application/json");

  request("https://val202.rtvslo.si/spored/", function(error, response, body) {
    if (error != null && response.statusCode != 200) {
      console.error("error:", error);
    }

    const $ = cheerio.load(body);
    var scheduleTimeList = parseScheduleTime($);
    var scheduleTitleList = parseScheduleTitle($);

    const result = generateScheduleJSON(scheduleTimeList, scheduleTitleList);
    res.status(200).send(JSON.stringify(result));
  });
});

module.exports = app;

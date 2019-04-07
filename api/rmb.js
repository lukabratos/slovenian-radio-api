const express = require("express");
const helmet = require("helmet");
const request = require("request");
const cheerio = require("cheerio");

const app = express();
app.use(helmet());

function appendZeroIfNeeded(input) {
  if (input < 10) {
    return "0" + input;
  }
}

function createFormattedDateString() {
  const date = new Date();
  return (
    date.getFullYear() +
    "-" +
    appendZeroIfNeeded(date.getMonth() + 1) +
    "-" +
    appendZeroIfNeeded(date.getDate())
  );
}

function loadRadioMariborSchedule(body) {
  const dateString = createFormattedDateString();
  var $ = cheerio.load(body);
  const schedule = $("div#schedule_" + dateString);
  const loadRadioMariborSchedule = cheerio.load(schedule.html());

  return loadRadioMariborSchedule;
}

function parseScheduleTime($) {
  var scheduleTimeList = [];
  const scheduleTime = $(".col-xs-2");

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
  const scheduleTitle = $(".col-xs-10");

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

app.get("/api/rmb", (req, res) => {
  res.set("Content-Type", "application/json");

  request("https://www.rtvslo.si/radiomaribor/spored", function(
    error,
    response,
    body
  ) {
    if (error != null && response.statusCode != 200) {
      console.error("error:", error);
    }

    const $ = loadRadioMariborSchedule(body);
    var scheduleTimeList = parseScheduleTime($);
    var scheduleTitleList = parseScheduleTitle($);

    const result = generateScheduleJSON(scheduleTimeList, scheduleTitleList);
    res.status(200).send(JSON.stringify(result));
  });
});

module.exports = app;

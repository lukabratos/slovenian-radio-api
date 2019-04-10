const express = require("express");
const helmet = require("helmet");
const request = require("request");
const cheerio = require("cheerio");
const MongoClient = require("mongodb").MongoClient;

const app = express();
app.use(helmet());

function appendZeroIfNeeded(input) {
  if (input < 10) {
    return "0" + input;
  } else {
    return input;
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
  const collectionName = "RadioMariborSchedule_" + createFormattedDateString();
  const user = process.env.USER;
  const pass = process.env.PASS;
  const uri =
    "mongodb+srv://" +
    user +
    ":" +
    pass +
    "@slovenian-radio-api-rxdpk.mongodb.net/slovenian-radio-api?retryWrites=true";

  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    if (err) throw err;
    client
      .db("slovenian-radio-api")
      .collection(collectionName)
      .find({})
      .toArray(function(err, result) {
        if (err) throw err;
        if (result.length !== 0) {
          res.status(200).send(JSON.stringify(result));
          client.db.close;
        } else {
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

            const scheduleJSON = generateScheduleJSON(
              scheduleTimeList,
              scheduleTitleList
            );

            client
              .db("slovenian-radio-api")
              .collection(collectionName)
              .insertMany(scheduleJSON, function(err, result) {
                if (err) throw err;
                res.status(200).send(JSON.stringify(result));
                client.db.close;
              });
          });
        }
      });
  });
});

module.exports = app;

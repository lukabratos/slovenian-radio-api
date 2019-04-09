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
  }
}

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
    var title = $(this)
      .text()
      .trim();

    // Remove any new lines in the string.
    var sanitizedTitle = title.replace(/(\r\n|\n|\r)/gm, "");
    // Some strings end with comma. Remove one if it exists.
    if (sanitizedTitle.charAt(sanitizedTitle.length - 1) === ",") {
      sanitizedTitle = sanitizedTitle.slice(0, -1);
    }

    // Replace multiple white spaces with -
    sanitizedTitle = sanitizedTitle.replace(/ +(?= )/g, " -");

    scheduleTitleList.push(sanitizedTitle);
  });

  return scheduleTitleList;
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

function generateScheduleJSON(timeList, titleList) {
  var result = [];
  for (i = 0; i < timeList.length; i++) {
    result.push({ time: timeList[i], title: titleList[i] });
  }

  return result;
}

app.get("/api/ra1", (req, res) => {
  res.set("Content-Type", "application/json");
  const collectionName = "RadioPrviSchedule_" + createFormattedDateString();
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
          request("https://radioprvi.rtvslo.si/spored/", function(
            error,
            response,
            body
          ) {
            if (error != null && response.statusCode != 200) {
              console.error("error:", error);
            }

            const $ = cheerio.load(body);
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

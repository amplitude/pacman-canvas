"use strict";

var Airtable = require("airtable");
var base = new Airtable({ apiKey: "keymW1ZElKs4tF7ib" }).base(
  "appCppypdYKJeG9QI"
);

function getHighscore() {
  $("#highscore-content").show();
  $("#highscore-list").text("");
  base("Scores")
    .select({
      fields: [ 'name', 'score' ],
      sort: [{ field: "score", direction: "desc" }],
      maxRecords: 25
    })
    .eachPage(
      function page(records, fetchNextPage) {
        records.forEach(function(record) {
          $("#highscore-list").append(
            "<li>" +
              record.get("name") +
              "<span id='score'>" +
              record.get("score") +
              "</span></li>"
          );
        });
        fetchNextPage();
      },
      function done(error) {
        console.log(error);
      }
    );
}
getHighscore();
setInterval(getHighscore, 10000);

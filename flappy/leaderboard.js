"use strict";

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'keymW1ZElKs4tF7ib' }).base('appCppypdYKJeG9QI');

let counter = 0;

function getHighscore() {
    $('#highscore-content').show();

    let title = 'Leaderboard';
    let baseString = 'Data Explorer Scores';
    if (counter % 2 === 1) {
        baseString = 'Data Explorer Scores (Hard)';
        title = 'Leaderboard (Hard)';
    }

    $('#hidden-list').text("");

    counter += 1;

    base(baseString).select({
        sort: [
            { field: 'score', direction: 'desc' }
        ],
        maxRecords: 20
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function (record) {
            $('#hidden-list').append("<li>" + record.get('name') + "<span id='score'>" + record.get('score') + "</span></li>");
        });
        fetchNextPage();
    }, function done(error) {
        console.log(error);
        $("#highscore-list").text('');
        $("#highscore-list").append($('#hidden-list').children());
        $("#highscore-title").text(title);
    });

}

$(document).ready(function() {

    getHighscore();

    setInterval(getHighscore, 10000);
})

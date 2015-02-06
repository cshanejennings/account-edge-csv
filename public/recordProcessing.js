
var RecordProcessor = (function () {
	"use strict";
    var dateFormat = "YYYY-MM-DD";

    function round (n) {
        return Math.round(n * 10) / 10;
    }

    function getSumOfEl(arr, ele) {
        return round(jStat.sum(_.pluck(arr, ele)));
    }

    function getAvgOfEl(arr, ele) {
        return round(jStat.sum(_.pluck(arr, ele)) / arr.length);
    }

    function getDateMetrics(dateIndex, ts, cal) {
        var startIndex,
            finishIndex = dateIndex;
        if (dateIndex >= ts) {
            startIndex = dateIndex - ts + 1;
        } else {
            startIndex = 0;
            finishIndex = ts - 1;
        }
        var arr = cal.slice(startIndex, finishIndex + 1),
            l = arr.length,
            date = cal[dateIndex];
        return {
            avgBought: getSumOfEl(arr, "bought") || 0,
            avgSold: getSumOfEl(arr, "sold") || 0,
            avgOnHand: getAvgOfEl(arr, "onHand") || 0
        };
    }

	return function getRecordStats(data) {
        var calendar = data.calendar,
            derived;
        _.map(calendar, function (el, i) {
            _.extend(calendar[i], getDateMetrics(i, data.timeWindow, calendar));
        });
        derived = {
            bought: getAvgOfEl(calendar, "avgBought"),
            sold: getAvgOfEl(calendar, "avgSold"),
            onHand: getAvgOfEl(calendar, "avgOnHand"),
        };
        derived.surplus = round(derived.onHand - derived.sold);
        return {
            period: derived,
            dates: calendar
        };
    };
}());
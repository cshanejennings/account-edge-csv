
var ItemTimeline = (function () {
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

    function plotAverages(dateIndex, ts, cal) {
        var startIndex,
            finishIndex = dateIndex,
            period = {};
        if (dateIndex >= ts) {
            startIndex = dateIndex - ts + 1;
        } else {
            startIndex = 0;
            finishIndex = ts - 1;
        }
        var arr = cal.slice(startIndex, finishIndex + 1),
            l = arr.length,
            date = cal[dateIndex];
        period.avgBought = getSumOfEl(arr, "bought") || 0;
        period.avgSold = getSumOfEl(arr, "sold") || 0;
        period.avgOnHand = getAvgOfEl(arr, "onHand") || 0;
        return period;
    }

    function processMetrics(dates) {
        var data = {};
        data.bought = getAvgOfEl(dates, "avgBought");
        data.sold = getAvgOfEl(dates, "avgSold");
        data.stock = getAvgOfEl(dates, "avgOnHand");
        data.surplus = round(data.stock - data.sold);
        return data;
    }

    function getPeriodMetrics(cal, calSize, days) {
        return processMetrics(cal.slice(calSize - days, calSize - 1));
    }

    function getReports(reports, cal, l) {
        var periods = {};
        _.forEach(reports, function (data, period) {
            periods[period] = getPeriodMetrics(cal, l, data.days);
        });
        return periods;
    }

    return function getRecordStats(item) {
        var calendar = item.calendar,
            periods = {};
        _.map(calendar, function (el, i) {
            _.extend(el, plotAverages(i, item.timeWindow, calendar));
        });
        return getReports(item.periods, calendar, calendar.length);
    };

}());

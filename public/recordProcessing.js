
var RecordProcessor = (function () {
	"use strict";
    var tableData,
        dateFormat = "YYYY-MM-DD";

	function createDateRange(start, stop) {
        var table = {},
            days = stop.diff(start, "days");
        _.times(days + 1, function(n) {
            table[moment(start).add(n, 'days').format(dateFormat)] = {
                sold: 0,
                bought: 0,
                onHand: 0
            };
        });
        return table;
    }

    function round (n) { return Math.round(n * 10) / 10; }

    function getDateTotalsForItem(records, start, stop) {
        tableData = tableData || createDateRange(start, stop);
        var dateCache = _.cloneDeep(tableData);
        _.map(records, function moveRecordToDate(record) {
            var date = dateCache[moment(record.date).format(dateFormat)] || {};
            if (!date) { return; }
            if (record.changeQty > 0) {
                date.sold += Number(record.changeQty);
            } else {
                date.bought -= Number(record.changeQty);
            }
            date.onHand += Number(record.onHand);
        });
        return (function backFill(currentOnHand, first) {
            var arr = _.map(_.keys(dateCache), function (dateString, i) {
                    var date = dateCache[dateString];
                    date.date = dateString;
                    if (date.onHand === 0 && date.sold === 0 && date.bought === 0) {
                        date.onHand = currentOnHand;
                    } else {
                        currentOnHand = date.onHand;
                        first.onHand = first.onHand || currentOnHand;
                        first.index = first.index || i;
                    }
                    return date;
                });
            _.map(arr.slice(0, first.index), function (el) {
                el.onHand = first.onHand; // backfill onHand Qty
            });
            return arr;
        }(0, {}));
    }

    function getSumOfEl(arr, ele) {
        return round(jStat.sum(_.pluck(arr, ele)));
    }

    function getAvgOfEl(arr, ele) {
        return round(jStat.sum(_.pluck(arr, ele)) / arr.length);
    }

    function getDateMetrics(dateIndex, ts, dateTotals) {
        var startIndex,
            finishIndex = dateIndex;
        if (dateIndex >= ts) {
            startIndex = dateIndex - ts + 1;
        } else {
            startIndex = 0;
            finishIndex = ts - 1;
        }
        var arr = dateTotals.slice(startIndex, finishIndex + 1),
            l = arr.length,
            date = dateTotals[dateIndex];
        date.avgBought = getSumOfEl(arr, "bought") || 0;
        date.avgSold = getSumOfEl(arr, "sold") || 0;
        date.avgOnHand = getAvgOfEl(arr, "onHand") || 0;    
        return date;
    }

	return function getRecordStats(data) {
        var dateTotals = getDateTotalsForItem(
                data.records,
                moment(data.start, dateFormat),
                moment(data.stop, dateFormat)
            ),
            l = dateTotals.length,
            derived;
        _.map(dateTotals, function (el, i) {
            getDateMetrics(i, data.timeWindow, dateTotals);
        });
        
        derived = {
            bought: getAvgOfEl(dateTotals, "avgBought"),
            sold: getAvgOfEl(dateTotals, "avgSold"),
            onHand: getAvgOfEl(dateTotals, "avgOnHand"),
        };
        derived.surplus = round(derived.onHand - derived.sold);
        return {
            period: derived,
            dates: dateTotals
        };
    };
}());

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
        records = records.concat();
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

    function getAvgOfEl(arr, ele, period) {
        period = period || 1;
        return round(jStat.sum(_.pluck(arr, ele)) / arr.length * period);
    }

	return function getRecordStats(data) {
        var dateTotals = getDateTotalsForItem(
                data.records,
                moment(data.start, dateFormat),
                moment(data.stop, dateFormat)
            ),
            l = dateTotals.length,
            derived;
        function getDateMetrics(start, finish) {
            if (finish - start < 0) {
                finish = data.timeWindow;
                start = 0;
            }
            var arr = dateTotals.slice(start, finish),
                date = dateTotals[finish];
            date.avgBought = getAvgOfEl(arr, "bought", data.timeWindow) || 0;
            date.avgSold = getAvgOfEl(arr, "sold", data.timeWindow) || 0;
            date.avgOnHand = getAvgOfEl(arr, "onHand") || 0;
        }
        while (l > 0) {
            l -= 1;
            getDateMetrics(l - data.timeWindow, l);
        }
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
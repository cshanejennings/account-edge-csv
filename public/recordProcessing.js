var RecordProcessor = (function () {
	"use strict";
	function getDateTable(start, stop) {
        start = moment(start);
        stop = (stop)? moment(stop): moment({hour: 0});
        var table = {
                hash: {},
                list: [],
                length: 0
            },
            days = stop.diff(start, "days"),
            range = {};
        _.times(days + 1, function(n) {
            var date = moment(start).add(n, 'days');
            table.list.push(date);
            table.hash[date.format("YYYY-MM-DD")] = {
                sold: 0,
                bought: 0,
                onHand: 0
            };
            table.length += 1;
        });
        return table;
    }

    var dataTable = getDateTable(
            moment("2014 01 01", "YYYY MM DD")._d,
            moment("2014 12 31", "YYYY MM DD")._d
        );
    var testRangeLength = dataTable.length;

    function getDateTotalsForItem(records) {
        records = records.concat();
        var dateCache = _.cloneDeep(dataTable.hash);
        function moveRecordToDate(record) {
            var date = dateCache[moment(record.date).format("YYYY-MM-DD")] || {};
            if (!date) { return; }
            if (record.changeQty > 0) {
                date.sold += Number(record.changeQty);
            } else {
                date.bought -= Number(record.changeQty);
            }
            date.onHand += Number(record.onHand);
        }
        while(records.length > 0) {
            moveRecordToDate(records.pop());
        }

        dateCache = (function () {
            var lastOnHand = 0,
                startIndex = 0,
                startQty = 0,
                arr = _.keys(dateCache).map(function (dateString, i) {
                    var date = dateCache[dateString];
                    date.date = dateString;
                    if (date.onHand === 0 && date.sold === 0 && date.bought === 0) {
                        date.onHand = lastOnHand;
                    } else {
                        lastOnHand = date.onHand;
                        startQty = startQty || lastOnHand;
                        startIndex = startIndex || i;
                    }
                    return date;
                });
            (function backFillonHandQty(index, qty) {
                while (index > 0) {
                    arr[index].onHand = qty;
                    index -=1;
                }
            }(startIndex, startQty));
            return arr;
        }());
        return dateCache;
    }
    function getAvgOfEl(arr, ele, period) {
        period = period || 1;
        return Math.round(jStat.sum(_.pluck(arr, ele)) / arr.length * period * 100) / 100;
    }
	return function getRecordStats(data) {
        var dateTotals = getDateTotalsForItem(data.records),
            l = testRangeLength,
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
        derived.surplus = Math.round((derived.onHand - derived.sold) * 100) / 100;
        //console.log(derived.inventoryToSales);
        return {
            period: derived,
            dates: dateTotals
        };
    };
}());
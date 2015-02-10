
var ItemCalendar = (function () {
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

    function backFillDates(dateCache, max) {
        var firstTrans = {},
            carry = 0,
            arr = _.map(_.keys(dateCache), function (dateString, i) {
                var date = dateCache[dateString];
                date.date = dateString;
                if (date.onHand === 0 && date.sold === 0 && date.bought === 0) {
                    date.onHand = carry;
                } else {
                    carry = date.onHand;
                    firstTrans.onHand = firstTrans.onHand || carry;
                    firstTrans.index = firstTrans.index || i;
                }
                return date;
            }),
            testArr;
        _.map(arr.slice(0, firstTrans.index), function (el) {
            el.onHand = firstTrans.onHand; // backfill onHand Qty
        });
        return arr;
    }

    function plotTransactions(records, start, stop) {
        tableData = tableData || createDateRange(start, stop);

        var dateCache = _.cloneDeep(tableData),
            max = jStat.max(_.map(_.pluck(records, "onHand"),
                function (el) { return Number(el) }));

        _.map(records, function moveRecordToDate(record) {
            var date = dateCache[moment(record.date).format(dateFormat)] || {};
            if (!date) { return; }
            if (record.changeQty > 0) {
                date.sold += Number(record.changeQty);
            } else {
                date.bought -= Number(record.changeQty);
            }
            date.onHand = Number(record.onHand);
        });
        return backFillDates(dateCache, max);
    }

	return function getRecordStats(data) {
        return plotTransactions(
            data.records,
            moment(data.start, dateFormat),
            moment(data.stop, dateFormat)
        );
    };
}());
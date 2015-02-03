(function (_, $, jStat, createRecordTable, createRecordChart) {
    "use strict";
    _.mixin({
        toArrayFromObj: function (object, keyName)
        {
            return _(object).keys().map(function (item)
            {
                object[item][keyName] = item;
                return object[item];
            }).value();
        }
    });

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

    function getDateRange(records, defaultValues, max) {
        max = (max)? moment(max): moment({hour: 0});
        var dates = _.pluck(records, "date"),
            start = moment(jStat.min(dates)),
            days = max.diff(start, "days"),
            range = [start._d],
            date;
        _.times(days, function(n) {
            range.push(moment(start).add(n, 'days')._d);
        });
        return range;
    }

    function getDateTotalsForItem(records) {
        records = records.concat();
        var dateCache = _.cloneDeep(dataTable.hash);
        function moveRecordToDate(record) {
            var date = dateCache[moment(record.date).format("YYYY-MM-DD")];
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
        dateCache = _.keys(dateCache).map(function (dateString) {
            dateCache[dateString].date = dateString;
            return dateCache[dateString];
        });
        return dateCache;
    }
    function getAvgOfEl(arr, ele, period) {
        period = period || 1;
        return Math.round(jStat.sum(_.pluck(arr, ele)) / arr.length * period * 100) / 100;
    }

    // This function receives a list of records containing:
    //      date
    //      changeQty - amount is negative if sold, positive if purchased
    //      onHandQty
    function getRecordStats(records, period) {
        var dateTotals = getDateTotalsForItem(records),
            l = testRangeLength;
        function getDateMetrics(start, finish) {
            if (finish - start < 0) {
                finish = period;
                start = 0;
            }
            var arr = dateTotals.slice(start, finish),
                date = dateTotals[finish];
            date.avgBought = getAvgOfEl(arr, "bought", period) || 0;
            date.avgSold = getAvgOfEl(arr, "sold", period) || 0;
            date.avgOnHand = getAvgOfEl(arr, "onHand") || 0;
        }
        while (l > 0) {
            l -= 1;
            getDateMetrics(l - period, l);
        }
        return {
            period: {
                bought: getAvgOfEl(dateTotals, "avgBought"),
                sold: getAvgOfEl(dateTotals, "avgSold"),
                onHand: getAvgOfEl(dateTotals, "avgOnHand"),
            },
            dates: dateTotals
        };
    }

    function processRecords(records) {
        var i, l = records.length,
            record;
        for (i = 0; i < l; i += 1) {
            record = records[i];
            record.changeQty = Number(record.changeQty);
            record.date = new Date(record.date);
            record.displayDate = moment(record.date).format("MMM-DD-YYYY");
        }
        if (records.length > 100) {
            window.testRecords= records.concat();
        }
        return records;
    }

    function print_supplements(json) {
        var table = [],
            result,
            row,
            item,
            stats,
            testCount = 10;
        for (item in json) {
            row = json[item];
            row.records = processRecords(row.records);
            stats = getRecordStats(row.records.concat().reverse(), 30);
            
            table.push({
                id: item,
                pn: row.pn,
                transactions: Number(row.transactions),
                avgInv: Number(stats.period.onHand),
                avgBought: Number(stats.period.bought),
                avgSold: Number(stats.period.sold),
                onHand: Number(row.onHand),
                bought: Number(row.bought),
                sold: Number(row.sold),
                records: row.records
            });
        }
        
        $('#items').dataTable({
            aaData: table,
            aoColumns: [
                { mData: 'id' },
                { mData: 'pn' },
                {
                    mData: 'transactions',
                    sType: "number"
                },
                {
                    mData: 'avgBought',
                    sType: "number"
                },
                {
                    mData: 'avgSold',
                    sType: "number"
                },
                {
                    mData: 'avgInv',
                    sType: "number"
                },
                {
                    mData: 'onHand',
                    sType: "number"
                },
                {
                    mData: 'bought',
                    sType: "number"
                },
                {
                    mData: 'sold',
                    sType: "number"
                }
            ],
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                nRow = $(nRow);
                var checked = nRow.hasClass("checked");
                function checkClass() {
                    if (checked) {
                        nRow.addClass("checked");
                    } else {
                        nRow.removeClass("checked");
                    }
                }
                
                function rowClick(event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    checked  = !nRow.hasClass("checked");
                    if (checked) {
                        var table = createRecordTable(aData.records);
                        var chart = createRecordChart(aData.records, table);
                    }
                    checkClass();
                }
                nRow.unbind("click", rowClick);
                nRow.bind("click", rowClick);
                checkClass();
            }
        });
        window.tableData = table;
    }

    function initLocal() {
        $.getJSON('data/data.json', print_supplements);
    }

    function initFromCMS() {
        $.getJSON('//localhost:1337/supplement-inventory/', function (json) {
            if (json.status === 200) {
                print_supplements(json.data);
            }
        });
    }
    
    $(initLocal);
}(window._, jQuery, window.jStat, ItemView, window.ItemChart));
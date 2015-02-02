(function (_, $, jStat, createRecordTable, createRecordChart) {
    "use strict";
    /*
        data {
            hash: {
                sold: 0,
                bought: 0,
                onHand
            },
            list: [] // <moment>
        }

    */
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
        var dateCache = _.cloneDeep(dataTable.hash),
            dateIndex = dataTable.length;
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
        return dateCache;
    }


    // This function receives a list of records containing:
    //      date
    //      changeQty - amount is negative if sold, positive if purchased
    //      onHandQty
    function getNewPurchasingVolume(records, timeWindow) {
        var dateTotals = getDateTotalsForItem(records);
        debugger;
    }

    // I need to create a date range for the supplements
    // the result will be a date range that will display 
    function getPurchasingVolume(records, timeWindow) {
        var dateRange = getDateRange(records),
            ol = records.length,
            l = ol,
            list = [],
            period = {
                max: 0, // sales
                avgSold: 0
            };
        // Add in calculations for avg sold and avg bought over time period
        // avg purchase
        // avg on hand
        // avg sold
        // This tests the timewindow for a particular record against the other
        // records to see how many purchases happened in the following x days
        function testRecord(record) {
            var r,
                tw = { // time window
                    //first date of time window
                    s: record.date,
                    // last date of time window
                    f: moment(record.date).add(timeWindow, 'days')._d,
                    // period sales
                    ps: [],
                    // period purchases
                    pp: [],
                    // total sold in period
                    ts: 0,
                    // total purchased in period
                    tp: 0
                },
                range = moment().range(tw.s, tw.f);

            function compareRecord(date)  {
                if (range.contains(date) && record.changeQty < 0) {
                    tw.ps.push(-record.changeQty);
                } else {
                    tw.pp.push(record.changeQty);
                }
            }
            for (r = l - 2; r > 0; r -= 1) {
                compareRecord(records[r].date);
            }
            tw.ts = jStat.max(tw.ts);
            period.max = jStat.max([period.max, tw.ts]);
            list.push(jStat.sum(tw.ps));
        }
        for (l = records.length; l > 0; l  -= 1) {
            testRecord(records.pop());
        }
        period.avgSold = Math.round(jStat.sum(list) / list.length);
        return {
            peak: period.max,
            avgSold: period.avgSold
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
            item;
        for (item in json) {
            row = json[item];
            row.records = processRecords(row.records);
            if (row.pn === "Royal Jelly") {
                //debugger;
            }
            row.purchaseSummary = getPurchasingVolume(row.records.concat().reverse(), 30);
            getNewPurchasingVolume(row.records.concat().reverse(), 30);
            if (row.pn === "Royal Jelly") {
                console.log(row.purchaseSummary.avgSold, row.purchaseSummary.peak);
            }
            
            table.push({
                id: item,
                pn: row.pn,
                transactions: Number(row.transactions),
                peak: Number(row.purchaseSummary.peak),
                avgSold: Number(row.purchaseSummary.avgSold),
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
                    mData: 'peak',
                    sType: "number"
                },
                {
                    mData: 'avgSold',
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
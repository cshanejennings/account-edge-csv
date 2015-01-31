(function ($, createRecordTable, createRecordChart) {
    "use strict";

    function getPurchasingVolume(records, days) {
        var ol = records.length,
            l = ol,
            list = [],
            highest = 0;
        // Add in calculations for avg sold and avg bought over time period
        function testRecord(record, timeWindow) {
            var len,
                comp,
                start = record.date,
                finish = new Date(record.date).addDays(timeWindow),
                period = [],
                count = 0;
            for (len = l - 2; len > 0; len -= 1) {
                comp = records[len];
                if (comp.date.between(start, finish) && record.changeQty < 0) {
                    count -= record.changeQty;
                    period.push(-record.changeQty);
                }
            }
            if (highest < count) {
                highest = count;
            }
            if (period.length) {
                list.push(period.reduce(function(p, c) { return p + c; }));
            } else {
                list.push(0);
            }
        }
        for (l = records.length; l > 0; l  -= 1) {
            testRecord(records.pop(), days);
        }
        var avg = (function (li) {
            if (!li.length) {
                return 0;
            }
            return Math.round(li.reduce(function(a, b) { return a + b; }) / list.length);
        }(list.concat()));
        return {
            peak: highest,
            avg: avg
        };
    }

    function processRecords(records) {
        var i, l = records.length,
            record;
        for (i = 0; i < l; i += 1) {
            record = records[i];
            record.changeQty = Number(record.changeQty);
            record.date = new Date(record.date);
            record.displayDate = record.date.toString("MMM-dd-yyyy");
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
                debugger;
            }
            row.purchaseVolume = getPurchasingVolume(row.records.concat().reverse(), 30);
            if (row.pn === "Royal Jelly") {
                console.log(row.purchaseVolume.avg, row.purchaseVolume.peak);
            }
            
            table.push({
                id: item,
                pn: row.pn,
                transactions: Number(row.transactions),
                peak: Number(row.purchaseVolume.peak),
                avg: Number(row.purchaseVolume.avg),
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
                    mData: 'avg',
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
}(jQuery, ItemView, window.ItemChart));
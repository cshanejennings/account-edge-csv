(function ($, createRecordTable, createRecordChart) {
    "use strict";

    function print_supplements(json) {
        var table = [],
            result,
            row,
            item;
        function processRecords(records) {
            records = records.concat().reverse();
            var record,
                changeQty,
                result = {
                    startQty: 0,
                    bought: 0,
                    sold: 0,
                    onHand: 0,
                    changeQty: 0
                };
            while (records.length) {
                record = records.pop();
                changeQty = Number(record.changeQty);
                if (!isNaN(changeQty)) {
                    if (changeQty > 0) {
                        result.sold += changeQty;
                    } else {
                        result.bought -= changeQty;
                    }
                }
                result.onHand = record.onHand;
            }
            return result;
        }
        for (item in json) {
            row = json[item];
            result = processRecords(row.records);

            table.push({
                id: item,
                pn: row.pn,
                transactions: Number(row.transactions),
                onHand: Number(result.onHand),
                bought: Number(result.bought),
                sold: Number(result.sold),
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
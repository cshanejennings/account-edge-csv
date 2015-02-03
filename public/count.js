(function (
        _,
        $,
        jStat,
        createInventoryTable,
        recordProcessor,
        createRecordTable,
        createRecordChart
    ) {
    "use strict";
    console.log("new");
    function processRecords(records) {
        var i, l = records.length,
            record;
        for (i = 0; i < l; i += 1) {
            record = records[i];
            record.changeQty = Number(record.changeQty);
            record.date = new Date(record.date);
            record.displayDate = moment(record.date).format("MMM-DD-YYYY");
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
            if (item === "Royal Jelly") {
                window.rjStats = stats;
            }
            //stats = getRecordStats(row.records.concat().reverse(), 30);
            stats = recordProcessor(row.records.concat().reverse(), 30);
            
            table.push({
                id: item,
                pn: row.pn,
                transactions: Number(row.transactions),
                surplus: Number(stats.period.surplus),
                avgInv: Number(stats.period.onHand),
                avgBought: Number(stats.period.bought),
                avgSold: Number(stats.period.sold),
                onHand: Number(row.onHand),
                bought: Number(row.bought),
                sold: Number(row.sold),
                records: row.records
            });
        }
        createInventoryTable(table);

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
}(
    window._, jQuery,
    window.jStat,
    window.InventoryTable,
    window.RecordProcessor,
    window.ItemView,
    window.ItemChart
));
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
    function tableRowFor(data) {
        var records = _.forEach(data.records, function (record) {
                record.changeQty = Number(record.changeQty);
                record.date = new Date(record.date);
                record.displayDate = moment(record.date).format("MMM-DD-YYYY");
            }),
            stats = recordProcessor({
                pn: data.pn,
                records: data.records.concat(),
                start: "2014-01-01",
                stop: "2014-12-31",
                timeWindow: 7
            });
        return {
            id: data.id,
            pn: data.pn,
            transactions: Number(data.transactions),
            // surplus: 0,
            // avgInv: 0,
            // avgBought: 0,
            // avgSold: 0,
            surplus: Number(stats.period.surplus),
            avgInv: Number(stats.period.onHand),
            avgBought: Number(stats.period.bought),
            avgSold: Number(stats.period.sold),
            
            onHand: Number(data.onHand),
            bought: Number(data.bought),
            sold: Number(data.sold),
            records: records
        };
    }
    function print_supplements(json) {
        var table = _.map(_.keys(json), function (key) {
            return tableRowFor(json[key]);
        });
        createInventoryTable(table);
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

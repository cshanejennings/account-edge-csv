(function (
        _,
        $,
        jStat,
        createInventoryTable,
        createItemCalendar,
        itemTimeline,
        createRecordTable,
        createRecordChart
    ) {
    "use strict";
    var config = {
        periods: {
            "annual": {
                "days": 365,
                "label" : "Last 365 days"
            },
            "biannual": {
                "days": 180,
                "label" : "Last 180 days"
            },
            "quarterly": {
                "days": 90,
                "label" : "Last 90 days"
            },
            "monthly": {
                "days": 30,
                "label" : "Last 30 days"
            }
        },
        metrics: [
            "bought",
            "sold",
            "stock",
            "surplus"
        ]
    };
    function getTableRowData(rawData) {  
        var records = _.forEach(rawData.records, function (record) {
                record.changeQty = Number(record.changeQty);
                record.date = new Date(record.date);
                record.displayDate = moment(record.date).format("MMM-DD-YYYY");
            }),
            stats = itemTimeline({
                timeWindow: 7,
                pn: rawData.pn,
                periods: config.periods,
                calendar: createItemCalendar({
                    pn: rawData.pn,
                    periods: config.periods,
                    records: rawData.records.concat(),
                    start: "2014-01-01",
                    stop: "2014-12-31"
                })
            }),
            row = {
                id: rawData.id,
                pn: rawData.pn,
                transactions: Number(rawData.transactions),                
                onHand: Number(rawData.onHand),
                bought: Number(rawData.bought),
                sold: Number(rawData.sold),
                records: records
            };
        _.forEach(config.periods, function(days, period) {
            _.map(stats[period], function(val, key) {
                row[period + "_" + key] = val;
            });
        });
        return row;
    }
    function print_supplements(json) {
        var table = _.map(_.keys(json), function (key) {
            return getTableRowData(json[key]);
        });
        createInventoryTable(table, config);
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
    window._,
    window.jQuery,
    window.jStat,
    window.InventoryTable,
    window.ItemCalendar,
    window.ItemTimeline,
    window.ItemTable,
    window.ItemChart
));

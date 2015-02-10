var InventoryTable = (function (
        $,
        createRecordTable,
        createRecordChart
    ) {
    var table,
        selectedPeriod = "quarterly",
        colVis,
        tableRows = [
            {
                title: 'ID',
                mData: 'id',
                sClass: 'memo_cell'
            },
            {
                title: 'Part Number',
                mData: 'pn',
                sClass: 'memo_cell'
            },
            {
                title: 'records',
                mData: 'transactions',
                sClass: 'smNumber_cell'
            },
            {
                title: 'current stock',
                mData: 'onHand',
                sClass: 'smNumber_cell'
            },
            {
                title: 'cost',
                mData: 'cost',
                sClass: 'smNumber_cell'
            },
            {
                title: 'bought',
                mData: 'bought',
                sClass: 'smNumber_cell'
            },
            {
                title: 'sold',
                mData: 'sold',
                sClass: 'smNumber_cell'
            }
            
        ],
        sClass = {
            smNumber_cell: {
                searchable: false,
                type: "number"
            },
            memo_cell: {
                searchable: true,
                type: "number"
            }
        };

    function addPeriodMetricsToTable(metrics, periods) {
        _.map(periods, function (period) {
            _.map(metrics, function (metric) {
                tableRows.push({
                    title: 'avg ' + metric,
                    mData: period + "_" + metric,
                    sClass: 'smNumber_cell',
                    visible: false,
                    period: period
                });
            });
        });
    }

    function get_columnDefs() {
        return _.map(tableRows.concat(), function (el, i) {
            return {
                title: el.title,
                columnSelector: el.title,
                searchable: (sClass[el.sClass].searchable),
                visible: (el.hasOwnProperty("visible"))? el.visible : true,
                targets: i
            };
        });
    }

    function get_aoColumns() {
        return _.map(tableRows.concat(), function (el, i) {
            return {
                mData: el.mData || el.title,
                sClass: el.sClass,
                visible: (el.hasOwnProperty("visible"))? el.visible : true,
                sType: sClass[el.sClass].type
            };
        });
    }

    function setPeriod(period) {
        selectedPeriod = period;
        _.map(tableRows, function (el, i) {
            var display = (el.period === selectedPeriod);
            if (el.hasOwnProperty("period")) {
                table.column(i).visible(display);
            }
        });
    }

    function createButtons(periods) {
        _.forEach(periods, function (data, period) {
            $('<button class="timePeriod" data-period="' + period + '">' + data.label + '</button>').appendTo("#report_selection");
        });
        $("button.timePeriod").click(function() {
            setPeriod($(this).attr("data-period"));
        });
    }
    
	return function createInventoryTable(tableData, config) {
        addPeriodMetricsToTable(config.metrics, _.keys(config.periods));
        table = $('#items').DataTable({
            aaData: tableData,
            columnDefs: get_columnDefs(),
            columns: get_columnDefs(),
            aoColumns: get_aoColumns(),
            fnRowCallback: function( nRow, aData, iDisplayIndex, iDisplayIndexFull ) {
                nRow = $(nRow);
                function rowClick(event) {
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    var table = createRecordTable(aData.records);
                    var chart = createRecordChart(aData.records, table);
                }
                nRow.unbind("click", rowClick);
                nRow.bind("click", rowClick);
            }
        });
        $(function () {
            createButtons(config.periods);
        });
    };
}(
    jQuery,
    window.ItemTable,
    window.ItemChart
));
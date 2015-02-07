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
                title: 'avg surplus',
                mData: 'surplus',
                sClass: 'smNumber_cell',
                period: 'lastQuarter'
            },
            {
                title: 'avg bought',
                mData: 'avgBought',
                sClass: 'smNumber_cell',
                period: 'lastQuarter'
            },
            {
                title: 'avg sold',
                mData: 'avgSold',
                sClass: 'smNumber_cell',
                period: 'lastQuarter'
            },
            {
                title: 'avg stock',
                mData: 'avgInv',
                sClass: 'smNumber_cell',
                period: 'lastQuarter'
            },
            {
                title: 'current stock',
                mData: 'onHand',
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
    function get_columnDefs() {
        return _.map(tableRows.concat(), function (el, i) {
            return {
                title: el.title,
                columnSelector: el.title,
                searchable: (sClass[el.sClass].searchable),
                targets: i
            };
        });
    }
    function get_aoColumns() {
        return _.map(tableRows.concat(), function (el, i) {
            return {
                mData: el.mData || el.title,
                sClass: el.sClass,
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
    $(function () {
        $("button.timePeriod").click(function() {
            setPeriod($(this).attr("data-period"));
        });
    });
    
	return function createInventoryTable(tableData) {
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
    };
}(
    jQuery,
    window.ItemTable,
    window.ItemChart
));
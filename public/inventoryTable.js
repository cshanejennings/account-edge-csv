var InventoryTable = (function (
        $,
        createRecordTable,
        createRecordChart
    ) {
    var dataTable,
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
                title: 'surplus',
                mData: 'surplus',
                sClass: 'smNumber_cell'
            },
            {
                title: 'avgBought',
                mData: 'avgBought',
                sClass: 'smNumber_cell'
            },
            {
                title: 'avgSold',
                mData: 'avgSold',
                sClass: 'smNumber_cell'
            },
            {
                title: 'avgInv',
                mData: 'avgInv',
                sClass: 'smNumber_cell'
            },
            {
                title: 'onHand',
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
    $(function () {
        $("#showRecords").click(function() {
            // not able to get columns variable
            // see here: http://datatables.net/extensions/colvis/
            var column = dataTable.column('records');
            column.visible(!column.visible);
        });
    });
    
	return function createInventoryTable(table) {
        dataTable = $('#items').dataTable({
            aaData: table,
            columnDefs: get_columnDefs(),
            columns: get_columnDefs(),
            aoColumns: get_aoColumns(),
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
    };
}(
    jQuery,
    window.ItemTable,
    window.ItemChart
));
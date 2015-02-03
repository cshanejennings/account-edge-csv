var InventoryTable = (function (
        $,
        createRecordTable,
        createRecordChart
    ) {
	return function createInventoryTable(table) {
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
                    mData: 'inventoryToSales',
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
    };
}(
    jQuery,
    window.ItemView,
    window.ItemChart
));
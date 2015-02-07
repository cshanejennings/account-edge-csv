var ItemTable = (function ($) {
	return function createRowTable(records) {
		var table;
        $("#supplement-history-modal").modal();
        table = $("#supplement_history_chart").dataTable({
            aaData: records,
            columnDefs: [
            { title: 'Date', targets: 0 },
            { title: 'src', targets: 1 },
            { title: 'memo', targets: 2 },
            { title: 'onHand', targets: 3 },
            { title: 'changeQty', targets: 4 },
            { title: 'startQty', targets: 5 }
        ],
            aoColumns: [
            { mData: 'displayDate' },
            { mData: 'src' },
            { mData: 'memo' },
            {
                mData: 'onHand',
                sType: "number"
            },
            {
                mData: 'changeQty',
                sType: "number"
            },
            {
                mData: 'startQty',
                sType: "number"
            }
        ]});
        return {
        	displayRow: function (r) {
        		table.fnDisplayRow(table.fnGetNodes()[r]);
        	}
        };
    };
}(jQuery));
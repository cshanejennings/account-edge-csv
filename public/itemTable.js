var ItemView = (function ($) {
	return function createRowTable(records) {
        console.log(records[0].displayDate);

		var table;
        $("#supplement-history-modal").modal();
        table = $("#supplement_history_chart").dataTable({
            aaData: records,
            columnDefs: [
            { title: 'Date' },
            { title: 'src' },
            { title: 'memo' },
            { title: 'onHand' },
            { title: 'changeQty' },
            { title: 'startQty' }
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
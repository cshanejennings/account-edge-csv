var ItemView = (function ($) {
	return function createRowTable(records) {
        $("#supplement-history-modal").modal();
            $("#supplement_history_chart").dataTable({
                aaData: records,
                columnDefs: [
                { title: 'date' },
                { title: 'src' },
                { title: 'memo' },
                { title: 'onHand' },
                { title: 'changeQty' },
                { title: 'startQty' }
            ],
                aoColumns: [
                { mData: 'date' },
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
    };
}(jQuery));
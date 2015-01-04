var datejs = require('datejs'),
	debugMode = false;
function processTable(arr) {
	var i, l = arr.length, supplements = {};
	function addSupplement(obj) {
		var s = supplements[obj.pn] || {
			pn: obj.pn,
			id: obj["id"],
			transactions: 0,
			min: null,
			max: null,
			records: []
		};
		//pn,ID#,Src,Date,Memo,Debit,Credit
		s.transactions = s.records.push({
			date: Date.parse(obj["Date"]),
			memo: obj["Memo"],
			debit: obj["Credit"],
			credit: obj["Debit"]
		});
		supplements[obj.pn] = s;
	}
	for (i = 0; i < l; i += 1) {
		addSupplement(arr[i]);
	}
	return supplements;
}

module.exports = function (str, callback) {
	str = str.replace("ID#", "id");
	var parse = require('csv-parse');
	parse(str, {
		columns: true
		},
		function(err, output) {
			if (err) {
				console.error(err);
			} else if (debugMode) {
				require('jsonfile').writeFile('./tmp/raw.json', output, function (err) {
					if (err) {
						console.error(err);
					} else {
						callback(processTable(output));
					}
				})
			} else {
				callback(processTable(output));
			}
	});
};
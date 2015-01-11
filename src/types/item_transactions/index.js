var datejs = require('datejs'),
	process = require('./process'),
	debugMode = false;

function sanitize_csv_string(str, start, max) {
	var line_array = [],
		i,
		row,
		item;
	function match_records(columns) {
		if (columns[0] !== "") {
			item = {
				id: columns[0],
				name: columns[1]
			};
			return "";
		} else if (item) {
			columns[0] = item.id;
			columns[1] = item.name;
		}
		return (columns.join) ? columns.join(',') : "";
	}
	start = start || 0;
	str = str.split("\n");
	max = (max) ? max + start : str.length;
	for (i = start; i < max; i += 1) {
		row = str[i];
		if (row.length && row.indexOf(',,,') !== 0) {
			row = match_records(row.split(','));
			if (row.length) {
				line_array.push(row);
			}
		}
	}
	return line_array;
}

function processTable(arr) {
	var i, l = arr.length, items = {};
	function addItem(obj) {
		var s = items[obj.pn] || {
			pn: obj.pn,
			id: obj["ID#"],
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
		items[obj.pn] = s;
	}
	for (i = 0; i < l; i += 1) {
		addItem(arr[i]);
	}
	return process(items);
}

module.exports = function (data, callback) {
	var parse = require('csv-parse'),
		json,
		inventory_json;
	data.sanitized_csv_string =	"pn" + sanitize_csv_string(data.csv_str, 10).join("\n")
	parse(data.sanitized_csv_string, { columns: true }, function(err, output) {
		if (err) {
			console.error(err);
		} else {
			data.raw_json = output;
			json = processTable(output);
			callback(json);
		}
	});
};
var datejs = require('datejs'),
	process = require('./process'),
	debugMode = false;

function sanitize_csv_string(str, start, max) {
	var items = {},
		i,
		row,
		item;
	start = start || 0;
	str = str.split("\n");
	max = (max) ? max + start : str.length;
	for (i = start; i < max; i += 1) {
		row = str[i];
		if (row.length && row.indexOf('Item') === 0) {
			pn = row.split(',')[1];
		} else if (row.length && row.indexOf('Value:') === 0) {
			items[pn] = {
				cost: row.split(',')[1].replace("$", "")
			};
		}
	}
	return items;
}

module.exports = function (data, callback) {
	callback(sanitize_csv_string(data.csv_str, 1));
};
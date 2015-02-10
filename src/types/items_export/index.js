var datejs = require('datejs'),
	debugMode = false;

function getNumber(str) {
	return Math.round(Number(str.replace("$", "")) * 100) / 100;
}

function sanitize_csv_string(str, start, max) {
	var items = {},
		i,
		row,
		item;
	start = start || 0;
	str = str.split("\n");
	max = (max) ? max + start : str.length;
	for (i = start; i < max; i += 1) {
		row = str[i].split(',');
		item = items[row.shift()] = {};
		item.cost = getNumber(row.shift() || "");
		item.value = getNumber(row.shift() || "");
	}
	return items;
}

module.exports = function (data, callback) {
	callback(sanitize_csv_string(data.csv_str, 1));
};
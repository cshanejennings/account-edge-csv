var fs = require('fs'),
	rf = require('read-file'),
	debugMode = false;
function sanitize_csv(file_name, start, max) {
	var line_array = [],
		str = rf.readFileSync(file_name),
		i,
		row,
		item;
	function sanitize(columns) {
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
			row = sanitize(row.split(','));
			if (row.length) {
				line_array.push(row);
			}
		}
	}
	return line_array;
}
function cleanCSV(file_name, complete) {
	var csv = sanitize_csv(file_name, 10);
	if (debugMode) {
		fs.writeFile("tmp/" + 'tmp.csv', "pn" + csv.join("\n"), function (err) {
		    if(err) {
		        console.error(err);
		    } else {
		    	complete("pn" + csv.join("\n"));
		    }
		});
	} else {
		complete("pn" + csv.join("\n"));
	}
}

module.exports = cleanCSV;
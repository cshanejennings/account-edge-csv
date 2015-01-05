var fs = require('fs'),
	rf = require('read-file'),
	transform = require('./transform'),
	debugMode = false,
	api = {};
function sanitize_csv_string(str, start, max) {
	var line_array = [],
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
function create_json(csv, done) {
	transform(csv, function (json) {
		require('jsonfile').writeFile('./tmp/data.json', json, function (err) {
			if (err) {
				console.log(err);
			} else {
				done(json);
			}
		})
	});
}
api.parse_csv_data = function (csv_str, complete) {
	var sanitized_csv_string = "pn" + sanitize_csv_string(csv_str, 10).join("\n");
	if (debugMode) {
		fs.writeFile("tmp/" + 'tmp.csv', sanitized_csv_string, function (err) {
		    if(err) {
		        console.error(err);
		    } else {
		    	create_json(sanitized_csv_string, complete);
		    }
		});
	} else {
		create_json(sanitized_csv_string, complete);
	}
	
};

api.parse_csv_file = function (file_name, complete) {
	var raw_csv_str = rf.readFileSync(file_name);
	api.parse_csv_data(raw_csv_str, complete);
};
module.exports = api;
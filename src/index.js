var fs = require('fs'),
	rf = require('read-file'),
	extend = require('shallow-extend'),
	debugMode = false,
	api = {},
	types = {
		"item-transactions": require('./types/item_transactions/index.js')
	};

function create_json(raw_data, type, done) {
	var func = types[type];
	try {
		func(raw_data, function (json) {
			raw_data.json = json;
			done(null, raw_data);
		});
	} catch (error) {
		done
	}
}


api.parse_csv_data = function (csv_str, complete, options) {
	var raw_data = {
		csv_str: csv_str
	};
	create_json(raw_data, "item-transactions", complete);
	
};


api.parse_csv_file = function (file_name, complete, options) {
	var raw_csv_str = rf.readFileSync(file_name);
	api.parse_csv_data(raw_csv_str, complete);
};


module.exports = api;
var fs = require('fs'),
	rf = require('read-file'),
	extend = require('shallow-extend'),
	debugMode = false,
	api = {},
	types = {
		"item-transactions": require('./types/item_transactions/index.js'),
		"item-register-detail": require('./types/item_register_detail/index.js')
	};

function create_json(sessionData, done) {
	var func = types[sessionData.type];
	try {
		func(sessionData, function (json) {
			sessionData.json = json;
			done(null, sessionData);
		});
	} catch (error) {
		console.error(error);
	}
}


api.parse_csv_data = function (sessionData, done) {
	create_json(sessionData, done);
};


api.parse_csv_file = function (sessionData, done) {
	sessionData.csv_str = rf.readFileSync(sessionData.file_name);
	create_json(sessionData, done);
};


module.exports = api;
var csv_parser = require('./src/index.js'),
	debugMode = true,
	config = {
		write_folder: "./tmp/"
	};

function print_supplements(supplements, threshold, count) {
	count = count || -1;
	var pn,
		s;
	for (pn in supplements) {
		s = supplements[pn];
		if (count && s.transactions >= threshold) {
			console.log(s.id);
			count --;
		}
	}
}
var options1 = {
	file_name: 'Item Transactions.csv',
	type: "item-transactions"
}
var options2 = {
	file_name: 'Items Register Detail.csv',
	type: "item-register-detail"
}

csv_parser.parse_csv_file(options2, function (err, output) {
	print_supplements(output.json, 50);
	if(err) {
		console.error(err);
	} else {
		require('jsonfile').writeFile(config.write_folder + 'data.json', output.json, function (err) {
			if (err) {
				console.log(err);
			} else if (debugMode) {
				require('jsonfile').writeFile('./tmp/raw_json.json', output.raw_json, function (err) {
					if (err) {
						console.error(err);
					} 
				});
				require('jsonfile').writeFile('./tmp/sanitized_csv.csv', output.sanitized_csv_string, function (err) {
					if (err) {
						console.error(err);
					} 
				});
			}
		});
	}
});
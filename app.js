var csv_parser = require('./src/index.js'),
	debugMode = true,
	argv = require('minimist')(process.argv.slice(2)),
	config = {
		write_folder: "./public/data/"
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

function addParam(arr, obj) {
	return obj[arr.shift()] = arr.pop() || true;
}

var options = (function(args) {
	var i,
		opts = {};
	if (args.length > 0) {
		for (i = 0; i < args.length; i += 1) {
			addParam(args[i].split("="), opts);
		}
	}
	return opts;
}(argv._));
if (!options.hasOwnProperty("file_name")) {
	throw 'set file_name parameter as the file name for the csv for parsing, ex: file_name="Item Transactions.csv"';
}

if (!options.hasOwnProperty("type")) {
	throw 'set type parameter to select the csv parser you wish to use with this csv file, ex: type="item-transactions"';
}
// node app file_name="Item Transactions.csv" type=item-transactions
// node app Item Transactions.csv type=item-register-detail

csv_parser.parse_csv_file(options, function (err, output) {
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
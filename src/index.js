var sanitize = require('./sanitize.js'),
	transform = require('./transform');

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

exports.parse_csv_file= function (name) {
	sanitize(name, function (str) {
		transform(str, function (supplements) {
			//print_supplements(supplements, 10);
			require('jsonfile').writeFile('./tmp/supplements.json', supplements, function (err) {
				if (err) {
					console.log(err);
				} else {
					print_supplements(supplements, 50);
				}
			})
		});
	});
}

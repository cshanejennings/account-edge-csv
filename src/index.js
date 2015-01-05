var sanitize = require('./sanitize.js'),
	transform = require('./transform');

exports.parse_csv_file= function (name, done) {
	sanitize(name, function (str) {
		transform(str, function (supplements) {
			//print_supplements(supplements, 10);
			require('jsonfile').writeFile('./tmp/supplements.json', supplements, function (err) {
				if (err) {
					console.log(err);
				} else {
					done(supplements);
				}
			})
		});
	});
}

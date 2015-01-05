var csv_parser = require('./src/index.js');

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

csv_parser.parse_csv_file('Item Transactions.csv', function (json) {
	print_supplements(json, 50);
});
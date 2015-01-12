    "use strict";
    function _$(v) {
        v = v || "0";
        return Number(v.replace("$", ""));
    }
    function __$(num) {
        var p = num.toFixed(2).split(".");
        return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
            return  num + (i && !(i % 3) ? "," : "") + acc;
        }, "") + "." + p[1];
    }
    var supplements,
        s_sort = {
            transaction_count: function (s1, s2) {
                return s1.transactions - s2.transactions;
            },
            purchasing_total: function (s1, s2) {
                return s1.balance - s2.balance;
            },
            balance: function (s1, s2) {
                return _$(s2.balance) - _$(s1.balance);
            }
        },
        rows = [];
    function get_record_value(r, b) {
        b +=  _$(r.debit) + _$(r.credit);
        b = Math.round(b * 100) / 100;
        r.balance = __$(b);
        return b;
    }
    function process_supplement(data) {
        var rs = data.records,
            b = 0,
            c = rs.length,
            i;
        for (i = 0; i < c; i++) {
            b = get_record_value(rs[i], b);
        }
        data.balance = __$(b);
        return data;
    }
    function prepare_supplement_data(data) {
        var s;
        supplements = data;
        for (s in supplements) {
            if (supplements.hasOwnProperty(s)) {
                rows.push(process_supplement(supplements[s]));
            }
        }
        return data;
    }
    
module.exports = function (json) {
    return json;
    //return prepare_supplement_data(json);
}
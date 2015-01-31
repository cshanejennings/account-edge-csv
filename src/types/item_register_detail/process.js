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


function processRecords(records) {
    records = records.concat().reverse();
    var record,
        changeQty,
        result = {
            startQty: 0,
            bought: 0,
            sold: 0,
            onHand: 0,
            changeQty: 0
        };
    while (records.length) {
        record = records.pop();
        changeQty = Number(record.changeQty);
        if (!isNaN(changeQty)) {
            if (changeQty > 0) {
                result.sold += changeQty;
            } else {
                result.bought -= changeQty;
            }
        }
        result.onHand = record.onHand;
    }
    return result;
}

function processItems(items) {
    var i,
        data,
        item;
    for (i in items) {
        if (items.hasOwnProperty(i)) {
            item = items[i];
            data = processRecords(item.records);
            item.onHand = Number(data.onHand);
            item.bought = Number(data.bought);
            item.sold = Number(data.sold);
        }
    }
    return items;
}

function processTable(arr) {
    var i, l = arr.length, items = {};
    function addItem(obj) {
        var s = items[obj.pn] || {
            pn: obj.pn,
            id: obj["ID#"],
            transactions: 0,
            min: null,
            max: null,
            records: []
        };
        //pn,ID#,Src,Date,Memo,Debit,Credit
        //Date,Src,ID#,Memo,Starting Qty,Qty Changed,Amount,On Hand,Current Value,Master Item 
        s.transactions = s.records.push({
            date: Date.parse(obj.Date),
            memo: obj.Memo,
            src: obj.Src,
            invoice: obj["Inv#"],
            startQty: obj["Starting Qty"],
            changeQty: obj["Qty Changed"],
            onHand: obj["On Hand"],
            currentValue: obj["Current Value"],
            masterItem: obj["Master Item"]
        });
        items[obj.pn] = s;
    }
    for (i = 0; i < l; i += 1) {
        addItem(arr[i]);
    }

    return items;
}

module.exports = function (arr) {
    console.log(typeof processTable);
    var json = processTable(arr);
    return processItems(json);
    //return prepare_supplement_data(json);
};

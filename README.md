#Parse CSV files from accountedge

test project for parsing csv files produced by accountEdge accounting application

two formats are currently supported
* item-transactions
* item-register-detail

you can test these from the command line if you have exported csv files using the following syntax

node app file_name="Item Transactions.csv" type="item-transactions"
node app file_name="Items Register Detail.csv" type="item-register-detail"
var myArgs = process.argv.slice(2);

var db = myArgs[0];

var credentials = require('./credentials.json');

var mysql=require("mysql");

credentials.host="ids";

var connection = mysql.createConnection(credentials);

tables = ['supply', 'till_buttons', 'transactions'];
tableIndex = 0;

//FOREIGN KEY (itemID) REFERENCES supply(itemID)
supplyCreate = "CREATE TABLE IF NOT EXISTS supply (itemID INT PRIMARY KEY, itemName TEXT, price DOUBLE(5,2));";
till_buttonsCreate = "CREATE TABLE IF NOT EXISTS till_buttons (buttonID int primary key, `left` INT, `top` INT, `width` INT, label TEXT, itemID INT);";
transactionsCreate = "CREATE TABLE IF NOT EXISTS transactions (itemID INT UNIQUE, quantity INT, totalPrice INT)";
createTableCommands = [supplyCreate, till_buttonsCreate, transactionsCreate];

//datafiles
dataFiles = ['items.txt', 'buttons.txt', 'DONTLOADFILE'];

useDB(db);

function useDB(db) {
  str = "USE " + db + ";";
  connection.query(str , function(err) {
    if (err) {
      console.log("Problems with MySQL: "+err);
      connection.end();
    }
    else {
      console.log("Use DB: Success");
      createTable(tableIndex);
    }
  });
}

function createTable(tableIndex) {
  connection.query(createTableCommands[tableIndex], function(err) {
    if(err) {
      console.log("Problems with MySQL: "+err);
      connection.end();
    }
    else {
      console.log("createTable: Success");
      truncate(tableIndex);
    }
  });
}

function truncate(tableIndex) {
  connection.query("TRUNCATE " + tables[tableIndex] + ";", function(err) {
    if(err) {
      console.log("Problems with MySQL: "+err);
      connection.end();
    }
    else {
      console.log("Truncate: Success");
      loadDataFiles(tableIndex);
    }
  });
}

function loadDataFiles(tableIndex) {
  if(dataFiles[tableIndex] == 'DONTLOADFILE') {
    connection.end();
  }
  else {
  //  fileName = "\'" + dataFiles
    connection.query("LOAD DATA LOCAL INFILE 'resources/" + dataFiles[tableIndex] + "' INTO TABLE " + tables[tableIndex] + ";", function(err) {
      if(err) {
        console.log("Problems with MySQL: "+err);
        connection.end();
      }
      else {
        console.log("Load DB: Success");
        if(tableIndex < tables.length - 1) {
          tableIndex ++;
          createTable(tableIndex);
        }
        else {
          connection.end();
        }
      }
    });
  }
}

function loadInventory() {
  sql = "CREATE TABLE IF NOT EXISTS supply (itemID INT PRIMARY KEY, itemName TEXT, price DOUBLE(5,2));";
  createTable(sql, 'supply');

  connection.query("LOAD DATA LOCAL INFILE 'resources/buttons.txt' INTO TABLE till_buttons;", function(err){
    if(err) {
      console.log("Problems with MySQL: "+err);
      connection.end();
    }
    else {
      console.log("Load DB: Success");
      //
    }
  });

}

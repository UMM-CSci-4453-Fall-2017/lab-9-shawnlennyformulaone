var myArgs = process.argv.slice(2);

var db = myArgs[0];

var credentials = require('./credentials.json');

var mysql=require("mysql");

credentials.host="ids";

var connection = mysql.createConnection(credentials);

tables = ['supply', 'till_buttons', 'transactions', 'users', 'archive'];
tableIndex = 0;

//FOREIGN KEY (itemID) REFERENCES supply(itemID)
supplyCreate = "CREATE TABLE IF NOT EXISTS supply (itemID INT PRIMARY KEY, itemName TEXT, price DOUBLE(5,2));";
till_buttonsCreate = "CREATE TABLE IF NOT EXISTS till_buttons (buttonID int primary key, `left` INT, `top` INT, `width` INT, label TEXT, itemID INT);";
transactionsCreate = "CREATE TABLE IF NOT EXISTS transactions (itemID INT UNIQUE, itemName TEXT, quantity INT, totalPrice INT, `timeStamp` TIMESTAMP)";
usersCreate = "CREATE TABLE IF NOT EXISTS  users (userID INT PRIMARY KEY, userName TEXT, userPswd TEXT)";
archiveCreate = "CREATE TABLE IF NOT EXISTS archive (transactionID INT, userName TEXT, itemID INT, itemName TEXT, quantity TEXT, totalPrice INT, `timeStamp` TIMESTAMP)";
createTableCommands = [supplyCreate, till_buttonsCreate, usersCreate, transactionsCreate, archiveCreate];

//datafiles
dataFiles = ['items.txt', 'buttons.txt', 'DONTLOADFILE', 'users.txt', 'DONTLOADFILE'];

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
  console.log("*** TABLE: " + tables[tableIndex]);
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
    if(tableIndex == tables.length - 1) {
        //connection.end();
        dropExistingView();
    }
    else {
        tableIndex++;
        createTable(tableIndex);
    }
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
          //connection.end();
          dropExistingView();
        }
      }
    });
  }
}

function dropExistingView() {
    console.log("*** DROP VIEW");
    sql = "DROP VIEW IF EXISTS transactionSummary;";
    connection.query(sql, function(err){
        if(err) {
            console.log("Problem Dropping View: " + err);
            connection.end();
        }
        else {
            console.log("Drop Success");
            connection.end();
        }
    });
}

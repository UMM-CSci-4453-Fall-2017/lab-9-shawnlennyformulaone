//Seting up the connection
var credentials=require('./credentials.json');
var mysql=require("mysql");
var Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);
credentials.host="ids"
var connection = mysql.createConnection(credentials);
var pool=mysql.createPool(credentials);


var getConnection=function(){
  return pool.getConnectionAsync().disposer(
    function(connection){return connection.release();}
  );
};

var query=function(command){ //SQL comes in and a promise comes out.
  return using(getConnection(),function(connection){
    return connection.queryAsync(command);
  });
};

//This function returns `till_buttons` content
var selectButtonRecord = function(db){
  var sql  = "select * from "+db+".till_buttons;"
  return query(mysql.format(sql));
}

var checkSupply = function(itemID, timeStamp, db){
  var sql = "select * from "+db+".supply where itemID = "+itemID+";"; //sql which checks if the item is in supply table
  var recordExists = false;
  var price;
  var itemName;
  return query(mysql.format(sql)) //Sends the query to the database
  .then(function(result){ //then we assign "then" handler to the promise and define the anonymous function
  if(result.length > 0){ // if iten in supply table then lenght of result will be greater than 0
    price = result[0].price; // we save the price of that item so then we can update our transactions table
    itemName = result[0].itemName;
    recordExists = true;
    //checkTransaction(itemID, price, db);
  }else{
    console.log("No item in supply with itemID "+itemID);
  }
})
.then(function() {
  if(recordExists) { // If record exists then we call checkTransaction function
    checkTransaction(itemID, price, itemName, db, timeStamp); // We also giving price, itemName, and id of the item as the arguments
  }else{
    console.log("No item in supply with itemID "+itemID);
  }
  });
}

var checkTransaction = function(itemID, price, itemName, db, timeStamp){
  //This query will insert a record into transactions table if this item hasn't been add yet or just increment the quantity of that item if it was there already
  var sql = "INSERT INTO " + db + ".transactions VALUES (" + itemID + ", " + "\"" +itemName + "\"" + ", " + 1 + ", " + price + ", \"" + timeStamp + "\"" + ") ON DUPLICATE KEY UPDATE totalPrice = (quantity + 1)* " + price + " , quantity  = quantity+1, timeStamp = timeStamp;";
  query(mysql.format(sql));
}

var getTotalPrice = function(db){
  //This query will get the data from transactions table in a way so we can have itemName, itemID, quantity and the totalPrice
  var sql = "select itemID, itemName, quantity, totalPrice from "+db+".transactions;";
  return query(mysql.format(sql));
}

var deleteRow = function(db, id) {
  //This quey will delete the record with corresponding id from transactions table.
  var sql = 'DELETE FROM ' + db + '.transactions WHERE itemID = ' + id + ';';
  return query(mysql.format(sql));
}

var checkCredentials = function(db, userName, userPassword){
  var sql = "SELECT * from "+ db + ".users WHERE userName = " + "\""+userName+ "\"" + " AND userPswd = " + "\"" + userPassword + "\"" + ";";
  return query(mysql.format(sql));
}

var Void = function(db){
  var sql = "TRUNCATE " + db + ".transactions"
  return query(mysql.format(sql));
}

var sale = function(db, userName){
  var sql = "call " + db + ".saleProcedure(" + "\"" + userName + "\"" + ");";
  return query(mysql.format(sql));
}

exports.selectButtonRecord = selectButtonRecord;
exports.click = checkSupply;
exports.getTotalPrice = getTotalPrice;
exports.deleteRow = deleteRow;
exports.checkCredentials = checkCredentials;
exports.Void = Void;
exports.sale = sale;

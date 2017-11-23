//Handles the commandline argument
var myArgs = process.argv.slice(2);
var commandInput = myArgs[0];

//Importing getButtons.js which has function which handle the queries
GetButtons=require('./getButtons.js');
var express=require('express'),

app = express(),
port = process.env.PORT || 1337;

var buttons;

app.use(express.static(__dirname + '/public'));

//Call receivedButtons function wich returns buttons data from `till_buttons` table
GetButtons.selectButtonRecord(commandInput)
.then(function(result){buttons = result});


app.get("/buttons",function(req,res){ // handles the /buttons API
  res.send(buttons); //send `till_buttons` content to this API
});


app.get("/click",function(req,res){ // handles the /click API
  var id = req.param('id');// Once button is clicked it should have the `id`
  var timestamp = req.param('timestamp');
  GetButtons.click(id, timestamp, commandInput) // Call function `checkSupply` from getButtons.js which updates the `transactions` table
  .then(function(){
    res.send(); // Sends empty response back once finishes the updating
  });
});

app.get("/transactions", function(req, res){ // handles the /transactions API
  GetButtons.getTotalPrice(commandInput)// Once we get this API, we call function getTotalPrice from getButtons.js to get current state of `transactions` table
  .then(function(result){
    res.send(result); // Sending the content of `transactions` table to this API
  });
});

app.get("/deleteItem", function(req, res) { //handles the /deleteItem API
  var id = req.param('id'); // Once we clcik on iten in price-list it should have the id of that item
  GetButtons.deleteRow(commandInput, id)// Call function deleteRow from getButtons.js which deletes the record from `transactions` table
  .then(function() {
    res.send(); // Sends empty response back once finishes the deleting
  });
});

app.get("/login", function(req, res){ //handles the /login API
  var userName = req.param('userName'); //url will contain userName
  var userPassword = req.param('userPassword'); //url will contain userPassword
  GetButtons.checkCredentials(commandInput, userName, userPassword) //checkCredentials function will send query to the database and will return row which matches
  .then(function(result){ //then we check the result
    if(result.length == 1){ //if result is 1, that means there is such row thus this user is valid
      res.send(true); //if user is valid the true will be sent
    }else{
      res.send(false);// otherwise false will be sent
    }
  });
});

app.get('/void', function(req, res){ //handles the /void API
  GetButtons.Void(commandInput) // Void function will truncate the transaction table
  .then(function() {
    res.send();
  });
});

app.get('/sale', function(req, res){// handles the /sale API
  var currentUser = req.param('userName'); //the url will contain the currentUser who pressed the "sale" button
  GetButtons.sale(commandInput, currentUser) //sale function will call saleProcedure
  .then(function(){
     GetButtons.Void(commandInput) //once sale is done we void 'transaction' table
     .then(function () {
       res.send();
     })
  });
});

app.listen(port);

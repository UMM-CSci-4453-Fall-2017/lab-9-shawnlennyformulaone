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
  GetButtons.click(id, commandInput) // Call function `checkSupply` from getButtons.js which updates the `transactions` table
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

app.listen(port);

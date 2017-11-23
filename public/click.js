angular.module('buttons',[])
.controller('buttonCtrl',ButtonCtrl)
.factory('buttonApi',buttonApi)
.constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!


function ButtonCtrl($scope,buttonApi){
  $scope.buttons=[]; //Initially all was still
  $scope.priceList=[];
  $scope.errorMessage='';
  $scope.isLoading=isLoading;
  $scope.refreshButtons=refreshButtons;
  $scope.buttonClick=buttonClick;
  $scope.deleteItem=deleteItem;
  $scope.totalPrice=0;
  $scope.loggedIn = localStorage.getItem('loggedIn'); //We are using localStorage so that the user is would be still logged in even if we refresh the page
  $scope.wrongPassword = false; // If user will type wrong password or username we will use this boolean to show message to user which tells him taht his input is incorrect
  $scope.login = login;
  $scope.logout=logout;
  $scope.Void=Void;
  $scope.sale=sale;
  $scope.receipt = {};
  $scope.emptyTill = false; //this variable is used for the case when user will try press sale when the till is empty
  var price = 0;
  var loading = false;
  var TotalPrice = 0;

  function logout(){ //Once we press the logout button this function set value `loggedIn` to false and reload the page so buttons won't be shown anymore
  localStorage.setItem('loggedIn', false);
  location.reload();
}

function isLoading(){
  return loading;
}

function refreshButtons(){
  loading=true;
  $scope.errorMessage='';
  buttonApi.getButtons()
  .success(function(data){
    $scope.buttons=data;
    loading=false;
  })
  .error(function () {
    $scope.errorMessage="Unable to load Buttons:  Database request failed";
    loading=false;
  });
}

function buttonClick($event){
  //time stamp set up
  var currentTime = new Date();
  var date =  currentTime.getFullYear()+'-'+(currentTime.getMonth()+1)+'-'+currentTime.getDate(); //Month is incremenetd by one since it zero based in Javascript
  var time = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds();
  var timeStamp = date + ' ' + time; //date is (year, month, day) and time is (hour, minute, second)

  $scope.errorMessage='';
  buttonApi.clickButton($event.target.id, timeStamp) //clickButton sends api request to the server. Then server updates the transaction table in the database
  .success(function(){
    getTransaction() // refresh till
  })
  .error(function(){$scope.errorMessage="Unable click";});
}

function deleteItem($event){
  $scope.errorMessage='';
  buttonApi.deleteItem($event.target.id) //deleteItem sends request to the server. Then server deletes the item from 'transactions' table
  .success(function(){
    getTransaction() // refresh till
  })
  .error(function(){$scope.errorMessage="Unable click";});
}

function getTransaction(){
  $scope.errorMessage='';
  buttonApi.getTransaction() // Sends request to the server. The server sends query (select * from 'transactions' table) thus gets the lates status of records in this table
  .success(function(items){
    for(var i = 0; i < items.length; i++){ //This for loop calculates the total price
      TotalPrice += items[i].totalPrice;
    }
    $scope.totalPrice = TotalPrice;
    $scope.priceList = items; //array of items
    TotalPrice = 0;
    loading=false;
  })
  .error(function(){$scope.errorMessage="Unable to get transactions table";});
}

function login(userName, userPassword){
  $scope.errorMessage='';
  buttonApi.login(userName, userPassword)
  .success(function(data){
    if(data == false){
      $scope.wrongPassword = true; //If user type password or username wrong we set wrongPassword to true
      localStorage.setItem('loggedIn', false);
    }else{
      localStorage.setItem('currentUser', userName);
      localStorage.setItem('loggedIn', true);
      location.reload();
    }
  })
  .error(function(){$scope.errorMessage="Unable to Login";});
  document.getElementById('userName').value = ""; // removes the text from username input
  document.getElementById('userPassword').value = ""; // removes the text from password input
}

function Void(){
  $scope.errorMessage='';
  buttonApi.Void() //sends request to the server to truncate the "transactions" table
  .success(function(){
    getTransaction() //refresh till
  })
  .error(function(){});
}

function sale(){
  //time stamp set up
  var currentTime = new Date();
  var date =  currentTime.getFullYear()+'-'+(currentTime.getMonth()+1)+'-'+currentTime.getDate(); //Month is incremenetd by one since it zero based in Javascript
  var time = currentTime.getHours()+':'+currentTime.getMinutes()+':'+currentTime.getSeconds();
  var timeStamp = date + ' ' + time;

  //receipt set up
  var currentUser = localStorage.getItem('currentUser');
  var modal = document.getElementById('myModal'); // corresponds to pop up receipt
  var span = document.getElementsByClassName("close")[0]; // X button
  var receipt  = {};

  if($scope.totalPrice > 0){
    $scope.errorMessage='';
    buttonApi.sale(currentUser)
    .success(function(){
      receipt.items = $scope.priceList; // receipt object will have "items" field which is an array of items in the cash till
      receipt.user = currentUser; //receipt object will have "user" field so receipt can show who was the cashier
      receipt.totalPrice = $scope.totalPrice; // total price for receipt
      receipt.date = timeStamp; // date for receipt
      $scope.receipt = receipt; // now receipt object in the scope so it can be  used in html especially in (pop up receipt)
      getTransaction(); //refresh till
      modal.style.display = "block"; // once 'sale' button is clicked the modal will be displayed  (pop up receipt)
      span.onclick = function() { // There X button if its clicked then pop up window will dissapear
        modal.style.display = "none";
      }
    })
    .error(function(){$scope.errorMessage="Unable to sale";});
  }else{
    $scope.emptyTill = true;
  }
}

getTransaction();
refreshButtons();  //make sure the buttons are loaded
}

function buttonApi($http,apiUrl){
  return{
    sale: function(userName){ // userName is also in the url since our saleProcedure takes it as argument and inserts into 'archive' table
      var url = apiUrl + '/sale?userName=' + userName;
      return $http.get(url);
    },
    Void: function(){
      var url = apiUrl + '/void';
      return $http.get(url);
    },
    login: function(userName, userPassword){ //using API to send username and password to the server
      var url = apiUrl + '/login?userName='+userName+'&userPassword='+userPassword;
      return $http.get(url);
    },
    deleteItem: function(id){
      var url = apiUrl + '/deleteItem?id='+id;
      return $http.get(url);
    },
    getButtons: function(){
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id, timeStamp, currentUser){
      var url = apiUrl + '/click?id=' + id + '&timestamp=' + timeStamp;
      return $http.get(url);
    },
    getTransaction: function(){
      var url = apiUrl+'/transactions';
      return $http.get(url);
    }
  };
}

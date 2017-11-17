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
    $scope.errorMessage='';
    buttonApi.clickButton($event.target.id)
    .success(function(){
      getTransaction()
    })
    .error(function(){$scope.errorMessage="Unable click";});
  }

  function deleteItem($event){
    console.log("id: " + $event.target.id);
    $scope.errorMessage='';
    buttonApi.deleteItem($event.target.id)
    .success(function(){
      getTransaction()
    })
    .error(function(){$scope.errorMessage="Unable click";});
  }

  function getTransaction(){
    $scope.errorMessage='';
    buttonApi.getTransaction()
    .success(function(data){
      console.log("About to calculate totalPrice with "+data.length+"elements");
      for(var i = 0; i < data.length; i++){
        TotalPrice += data[i].totalPrice;
      }
      $scope.totalPrice = TotalPrice;
      $scope.priceList = data;
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
        localStorage.setItem('loggedIn', data);
      }else{
        localStorage.setItem('loggedIn', data);
        location.reload();
      }
    })
    .error(function(){});
    document.getElementById('userName').value = ""; // removes the text from username input
    document.getElementById('userPassword').value = ""; // removes the text from password input
  }

  getTransaction();
  refreshButtons();  //make sure the buttons are loaded
}

function buttonApi($http,apiUrl){
  return{
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
    clickButton: function(id){
      var url = apiUrl+'/click?id='+id;
      return $http.get(url);
    },
    getTransaction: function(){
      var url = apiUrl+'/transactions';
      return $http.get(url);
    }
  };
}

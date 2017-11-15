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
  var price = 0;
  var loading = false;
  var TotalPrice = 0;

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
  getTransaction();
  refreshButtons();  //make sure the buttons are loaded
}

function buttonApi($http,apiUrl){
  return{
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

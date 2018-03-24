var app = angular.module("App", ["ngMaterial", "md.data.table"]);

app.controller("mainController", function($scope) {
  var self = this;
  var assetObj = {
    selected: [],
    data: [],
    order: {
      property: "contractName",
      reverse: true
    },
    orderProp: "-contractName"
  };
  $scope.asset = assetObj;
  $scope.reArrangeAssets = function(sorter) {
    let isReverse = sorter.startsWith("-") ? true : false;
    let propertyName = sorter.replace("-", "");
    $scope.asset.orderProp = (isReverse ? "-" : "") + propertyName;
    $scope.asset.order = {
      reverse: isReverse,
      property: propertyName
    };
  };
});

app.controller("searchCtrl", function($scope, $q, $mdToast, assetsService) {
  var self = this;
  $scope.count = 0;
  self.querySearch = queryAjaxSearch;
  self.selectedItemChange = selectedItemChange;

  function queryAjaxSearch(query) {
    if (query) {
      var deferred;
      deferred = $q.defer();
      assetsService.getAssets(getAssetsApiUrl(query)).then(function(results) {
        $scope.count = results.length;
        deferred.resolve(results);
      });
      return deferred.promise;
    } else {
      $scope.count = 0;
      return [];
    }
  }

  function selectedItemChange(item) {
    if (item) {
      assetsService
        .getAssets(getAssetDetailApiUrl(item.id))
        .then(function(result) {
          // Todo: Need to add check is value is already in table.
          $scope.$parent.asset.data.push(result);
        })
        .catch(error => {
          $mdToast.show(
            $mdToast
              .simple()
              .textContent("Something not right! Please try again later")
              .position("bottom")
              .hideDelay(3000)
          );
        });
    }
  }

  function getAssetsApiUrl(query) {
    return (
      "https://services.investo2o.com/assetmanager-ws/api/v1/assets/getassets?asseType=STK&filter=&isCustom=false&query=" +
      query
    );
  }

  function getAssetDetailApiUrl(assetId) {
    return (
      "https://services.investo2o.com/assetmanager-ws/api/v3/getassetdetails?type=STK&isCustom=false&date=&asset=" +
      assetId
    );
  }
});

app.factory("assetsService", function($http) {
  return {
    getAssets: function(apiUrl) {
      return $http({
        method: "GET",
        url: apiUrl,
        headers: {
          "User-ID": 4524,
          "Access-Token":
            "ZmIyOTEwMDItYTY2Ni00OGNkLTg0MzctNzg5YmNkOGE5MWU4JVVTRVIlNDUyNA==",
          "User-IP": "0.0.0.0",
          Agent: "agent"
        }
      }).then(function(result) {
        return result.data;
      });
    }
  };
});

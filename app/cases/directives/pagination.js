'use strict';

class Pagination {
    constructor($scope, $rootScope, gettextCatalog) {

        // this is 4 because currentPage range is 0 ... n-1.
        $scope.skipSize = 5;
        $scope.onlyNumbers = /^\d+$/;
        $scope.disablePageInput = false;
        $scope.pageData = {
            currentPage: 0,
            currentPageNumber: 1,
            pageSize: 15
        };

        // ng-model-options makes input only throw even when  user clicks outside of input (blur) or presses "enter" (change)
        // http://embed.plnkr.co/2hCAxnClv68Dl5c06Brm/ https://docs.angularjs.org/api/ng/directive/ngModelOptions
        $scope.ngModelOptions = { updateOn: 'change blur' };

        $scope.numberOfPages = () => Math.ceil($scope.datalength / $scope.pageData.pageSize) || 0;
        $scope.getCurrentPage = () => $scope.pageData.currentPage + 1;
        $scope.showSkipBtns = () => $scope.numberOfPages() > $scope.skipSize;

        $scope.isForwardBtnDisabled = () => $scope.getCurrentPage() >= $scope.numberOfPages();
        $scope.isSkipForwardBtnDisabled = () => $scope.getCurrentPage() + $scope.skipSize  > $scope.numberOfPages();
        $scope.goForward = () => $scope.pageData.currentPage++;
        $scope.skipForward = () => {
            const numberOfPages = $scope.numberOfPages();
            const isLessThanNumOfPages = $scope.getCurrentPage() + $scope.skipSize < numberOfPages;

            if ($scope.pageData.currentPage === 0) {
                $scope.pageData.currentPage += $scope.skipSize - 1;
            } else if (isLessThanNumOfPages) {
                $scope.pageData.currentPage += $scope.skipSize;
            } else {
                $scope.pageData.currentPage = numberOfPages - 1;
            }
        };

        $scope.isBackBtnDisabled = () => $scope.getCurrentPage() === 1;
        $scope.isSkipBackBtnDisabled = () => $scope.getCurrentPage() - $scope.skipSize < 0;
        $scope.goBack = () => $scope.pageData.currentPage--;
        $scope.skipBack = () => {
            const isGTZero = $scope.getCurrentPage() - $scope.skipSize > 0;
            const isEqualZero = $scope.getCurrentPage() - $scope.skipSize === 0;

            if (isGTZero) {
                $scope.pageData.currentPage -= $scope.skipSize;
            } else if (isEqualZero) {
                $scope.pageData.currentPage -= $scope.skipSize - 1;
            } else {
                $scope.pageData.currentPage = 0;
            }
        };

        $scope.setParentScopeVariables = () => $scope.setdata({
            pageSize: $scope.pageData.pageSize,
            currentPage: $scope.pageData.currentPage
        });

        $scope.$watch('pageData.currentPage', () => {
            $scope.pageData.currentPageNumber = $scope.pageData.currentPage + 1;
            $scope.setParentScopeVariables();
        });

        $scope.$watch('pageData.currentPageNumber', (newv) => {
            const numOfPages = $scope.numberOfPages();

            if (newv && Number.isInteger(Number(newv)) && numOfPages > 0) {
                const isValid = newv >= 1 && newv <= numOfPages;
                const gtMax = newv > numOfPages;
                const ltMin = newv < 1;

                switch (true) {
                    case isValid:
                        $scope.pageData.currentPage = newv - 1;
                        $scope.pageData.currentPageNumber = newv;
                        break;
                    case gtMax:
                        $scope.pageData.currentPage = numOfPages - 1;
                        $scope.pageData.currentPageNumber = numOfPages;
                        break;
                    case ltMin:
                        $scope.pageData.currentPage = 0;
                        $scope.pageData.currentPageNumber = 1;
                        break;
                }
            } else {
                $scope.pageData.currentPageNumber = $scope.pageData.currentPage + 1;
            }

            $scope.setParentScopeVariables();
        });

        $scope.setParentScopeVariables();
    }
}

export default () => ({
    template: require('../views/pagination.jade')(),
    controller: Pagination,
    scope: {
        datalength: '<',
        setdata: '&'
    }
});

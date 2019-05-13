'use strict';

class Pagination {
    constructor($scope) {

        // this is 4 because currentPage range is 0 ... n-1.
        $scope.skipSize = 5;
        $scope.onlyNumbers = /^\d+$/;
        $scope.state = { inputCurrentPageNumber: $scope.currentPageNumber, inputPageSize: $scope.pageSize };
        $scope.minPageSize = 15;
        $scope.pageSizeOptions = [
            { pageSize: '15' },
            { pageSize: '30' },
            { pageSize: '100' }
        ];

        $scope.sanatizeInput = (_input) => {
            const numOfPages = $scope.numberOfPages();

            if (_input && Number.isInteger(Number(_input)) && numOfPages > 0) {
                const input = parseInt(_input, 10);
                const isValid = input >= 1 && input <= numOfPages;
                const gtMax = input > numOfPages;
                const ltMin = input < 1;

                switch (true) {
                    case isValid:
                        return input;
                    case gtMax:
                        return numOfPages;
                    case ltMin:
                        return 1;
                }
            } else {
                return $scope.currentPageNumber;
            }
        };

        $scope.onInputBoxChange = (value) => {
            let pageNumber = $scope.sanatizeInput(value);
            $scope.setCurrentPageNumber({ pageNumber });
            // setting inputcurrentPageNumber here as well as in watcher of currentPageNumber, because we cann't rely on watcher to be called everytime because when value is same as previous value watchers doesn't get called.
            $scope.state.inputCurrentPageNumber = pageNumber;
        };

        $scope.$watch('currentPageNumber', (newv) => {
            $scope.state.inputCurrentPageNumber = newv;
        }, true);

        $scope.$watch('pageSize', (newv) => {
            $scope.state.inputPageSize = newv;
        }, true);

        $scope.$watch('state.inputPageSize', (newv) => {
            $scope.setPageSize({ pageSize: newv })
        }, true);

        // ng-model-options makes input only throw even when  user clicks outside of input (blur) or presses "enter" (change)
        // http://embed.plnkr.co/2hCAxnClv68Dl5c06Brm/ https://docs.angularjs.org/api/ng/directive/ngModelOptions
        $scope.ngModelOptions = { updateOn: 'change blur' };

        $scope.numberOfPages = () => Math.ceil($scope.datalength / $scope.pageSize) || 0;
        $scope.showSkipBtns = () => $scope.numberOfPages() > $scope.skipSize;

        $scope.isForwardBtnDisabled = () => $scope.currentPageNumber >= $scope.numberOfPages();
        $scope.isSkipForwardBtnDisabled = () => $scope.currentPageNumber + $scope.skipSize > $scope.numberOfPages();
        $scope.goForward = () => $scope.setCurrentPageNumber({ pageNumber: $scope.currentPageNumber + 1 });
        $scope.skipForward = () => $scope.setCurrentPageNumber({ pageNumber: $scope.currentPageNumber + $scope.skipSize });

        $scope.isBackBtnDisabled = () => $scope.currentPageNumber === 1;
        $scope.isSkipBackBtnDisabled = () => $scope.currentPageNumber - $scope.skipSize < 1;
        $scope.goBack = () => $scope.setCurrentPageNumber({ pageNumber: $scope.currentPageNumber - 1 });
        $scope.skipBack = () => $scope.setCurrentPageNumber({ pageNumber: $scope.currentPageNumber - $scope.skipSize });

    }
}

export default () => ({
    template: require('../views/pagination.jade')(),
    controller: Pagination,
    scope: {
        currentPageNumber: '<',
        datalength: '<',
        pageSize: '<',
        setCurrentPageNumber: '&',
        setPageSize: '&'
    }
});

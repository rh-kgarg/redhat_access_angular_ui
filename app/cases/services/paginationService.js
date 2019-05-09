'use strict';

export default class PaginationService {
  constructor() {
    'ngInject';

    this.initialValues = () => {
      return {
        currentPageNumber: 1,
        pageSize: 15
      }
    };

    this.discussionSection = this.initialValues();
    this.attachmentsSection = this.initialValues();

    this.firstItemNumberShownOnThePage = (key, datalength) => {
      const lastCommentNumberShownOnPreviousPage = (this[key].currentPageNumber - 1) * this[key].pageSize;
      return datalength && lastCommentNumberShownOnPreviousPage + 1
    }

    this.lastItemNumberShownOnThePage = (key, datalength) => {
      const currentPage = this[key].currentPageNumber - 1;
      const pageSize = this[key].pageSize;
      const x = (currentPage * pageSize) + pageSize;
      const mod = (datalength % pageSize);
      return (x > datalength) ? ((currentPage * pageSize) + mod) : x
    }

    this.setPageSize = (key, pageSize) => {
      this[key].pageSize = pageSize;
      this[key].currentPageNumber = 1;
    }

  }
}
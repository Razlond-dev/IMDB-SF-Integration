/* eslint-disable @lwc/lwc/no-api-reassignments */
import { LightningElement, api } from 'lwc';

export default class imdbPagination extends LightningElement {
    currentPage = 1;
    moviesPerPage;
    totalPage = 0;
    totalRecords;
    visibleRecords;
    get records() {
        return this.totalRecords;
    }
    @api
    set records(data) {
        if (data) {
            this.totalRecords = data;
            if (this.moviesPerPage && this.totalRecords) {
                this.totalPage = Math.ceil(data.length / this.recordsPerPage);
                if (this.currentPage > this.totalPage) {
                    this.currentPage = 1;
                }
                this.updateRecords();       
            }
        }
    }
    @api
    set recordsPerPage(data) {
        if (data) {
            this.moviesPerPage = Number(data);
            if (this.moviesPerPage && this.totalRecords) {
                this.totalPage = Math.ceil(this.totalRecords.length / this.moviesPerPage);
                if (this.currentPage > this.totalPage) {
                    this.currentPage = 1;
                }
                this.updateRecords();       
            }
        }
    }
    get recordsPerPage() {
        return this.moviesPerPage;
    }
    recordPerPageOptions = [
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '25', value: '25' },
        { label: '50', value: '50' }
    ];

    get disablePrevious() {
        return this.currentPage <= 1;
    }
    get disableNext() {
        return this.currentPage >= this.totalPage;
    }
    previousHandler() {
        if (this.currentPage > 1) {
            this.currentPage = this.currentPage - 1;
            this.updateRecords();
        }
    }
    nextHandler() {
        if (this.currentPage < this.totalPage) {
            this.currentPage = this.currentPage + 1;
            this.updateRecords();
        }
    }
    updateRecords() {
        const startOfPagination = (this.currentPage - 1) * this.moviesPerPage;
        const endOfPagination = this.moviesPerPage * this.currentPage;
        this.visibleRecords = this.totalRecords.slice(
            startOfPagination,
            endOfPagination
        );
        this.dispatchEvent(
            new CustomEvent('paginate', {
                detail: {
                    records: this.visibleRecords
                }
            })
        );
    }
}

/* eslint-disable guard-for-in */
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDefaultIMDBSettings from '@salesforce/apex/IMDB_SettingsCtrl.getDefaultIMDBSettings';
import Error_text from '@salesforce/label/c.Error_text';
export default class ImdbSettings extends LightningElement {
    @api isSearchPage;
    isShowModal = false;
    imdbSettings;
    moviesAmountValue;
    moviesAmountOptions = [
        { label: '50', value: '50' },
        { label: '100', value: '100' },
        { label: '250', value: '250' }
    ];
    recordsPerPageValue;
    recordsPerPageOptions = [
        { label: '5', value: '5' },
        { label: '10', value: '10' },
        { label: '25', value: '25' },
        { label: '50', value: '50' }
    ];
    imdbAPIKeyValue;
    @api
    set settings(data) {
        console.log('has');
        if (data) {
            this.imdbSettings = data;
            this.imdbAPIKeyValue = data.IMDB_API_Key__c;
            this.recordsPerPageValue = data.IMDB_Records_Per_Page__c.toString();
            this.moviesAmountValue = data.IMDB_Movies_Amount__c.toString();
        }
    }
    get settings() {
        return this.imdbSettings;
    }

    showModalBox() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
    }

    submitHandler(event) {
        event.preventDefault();
        try {
            const formData = new FormData(event.target);
            const formProps = Object.fromEntries(formData);
            for (const property in formProps) {
                if (formProps[property] === '') {
                    formProps[property] = null;
                }
            }
            console.log('FORM PROPS - ' + JSON.stringify(formProps));
            this.dispatchEvent(
                new CustomEvent('settingschange', {
                    detail: { value: formProps }
                })
            );
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Settings changed',
                    message: 'Settings were successfully changed',
                    variant: 'success'
                })
            );
            this.hideModalBox();
        } catch (error) {
            console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: Error_text,
                    message: 'Oops, something went wrong. Please, contact System Administrator.',
                    variant: 'error'
                })
            );
        }
    }

    handleChangeMoviesAmount(event) {
        this.moviesAmountValue = event.detail.value;
    }

    handleChangeRecordsPerPage(event) {
        this.recordsPerPageValue = event.detail.value;
    }

    handleChangeRecordsPerPageNonSearch(event) {
        this.recordsPerPageValue = event.detail.value;
        this.dispatchEvent(
            new CustomEvent('settingschange', {
                detail: { value: { recordsPerPage: this.recordsPerPageValue } }
            })
        );
    }

    handleChangeimdbAPIKey(event) {
        this.imdbAPIKeyValue = event.detail.value;
    }

    async revertToDefaults() {
        let defaultSettings = await getDefaultIMDBSettings();
        this.imdbAPIKeyValue = defaultSettings.IMDB_API_Key__c;
        this.recordsPerPageValue = defaultSettings.IMDB_Records_Per_Page__c.toString();
        this.moviesAmountValue = defaultSettings.IMDB_Movies_Amount__c.toString();
    }

    submitForm() {
        this.template.querySelector('[data-id="overview"]').click();
    }
}

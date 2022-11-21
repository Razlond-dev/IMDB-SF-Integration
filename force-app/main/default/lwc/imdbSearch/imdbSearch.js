import { LightningElement } from 'lwc';
import fetchFilms from '@salesforce/apex/IMDB_SearchCtrl.fetchFilms';
import queryAddedMovieIds from '@salesforce/apex/IMDB_SearchCtrl.queryAddedMovieIds';
import updateIMDBSettings from '@salesforce/apex/IMDB_SearchCtrl.updateIMDBSettings';
import getIMDBSettings from '@salesforce/apex/IMDB_SearchCtrl.getIMDBSettings';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
// labels
import Error_text from '@salesforce/label/c.Error_text';

const FAVORITES_PAGE_API_NAME = 'IMDB_Favorites';
const NAVIGATION_TAB_TYPE = 'standard__navItemPage';
const INITIAL_SEARCH_PARAMETERS = {"fromUserRating":"1.0","fromNumberOfVotes":"1000","sortBy":"release_date,desc"};

export default class ImdbSearch extends NavigationMixin(LightningElement) {
    responseFromAPI;
    arrayOfMovies = [];
    arrayOfMoviesBefore;
    imdbSettings;
    recordsPerPage = 0;
    isSearchPage = true;
    isLoading = false;

    async connectedCallback() {
        this.imdbSettings = await getIMDBSettings();
        this.recordsPerPage = this.imdbSettings.IMDB_Records_Per_Page__c;
        this.responseFromAPI = this.testResponse;
        await this.fetchFilmsFromApex(INITIAL_SEARCH_PARAMETERS);
    }

    async fetchFilmsFromApex(filterParameters) {
        this.isLoading = true;
        let responseFromAPI;
        try {
            console.log('filter params - '+JSON.stringify(filterParameters));
            responseFromAPI = await fetchFilms({
                jsonFilterParameters: JSON.stringify(filterParameters)
            });
            console.log('responseFromAPI - '+JSON.stringify(responseFromAPI));
            let resultArray = await this.markAlreadyAddedMovies(responseFromAPI.results);
            this.arrayOfMoviesBefore = [...resultArray];
        } catch (error) {
            console.log(error);
            let errorMessage = 'Oops, something went wrong. Please, contact System Administrator.';
            if (responseFromAPI.errorMessage === 'Invalid API Key') {
                errorMessage = 'Invalid API Key. Please go to settings and change it';
            }
            this.dispatchEvent(
                new ShowToastEvent({
                    title: Error_text,
                    message: errorMessage,
                    variant: 'error'
                })
            );
        }
        this.isLoading = false;
    }

    async markAlreadyAddedMovies(arrayToCheck) {
        this.isLoading = true;
        let arrayOfExistedMovieIds = await queryAddedMovieIds();
        this.isLoading = false;
        return arrayToCheck.map((movie) => {
            movie.isAddedToSF = arrayOfExistedMovieIds.includes(movie.id);
            return movie;
        });
    }

    searchHandler(event) {
        try {
            let filterParameters = event.detail.value;
            let isValidParameters = false;
            for (const parameter in filterParameters) {
                if (
                    (!Array.isArray(filterParameters[parameter]) &&
                        filterParameters[parameter] != null &&
                        parameter !== 'sortBy') ||
                    (Array.isArray(filterParameters[parameter]) &&
                        filterParameters[parameter].length > 0)
                ) {
                    isValidParameters = true;
                }
            }

            if (isValidParameters) {
                this.fetchFilmsFromApex(event.detail.value);
            } else {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: Error_text,
                        message: 'Please select at least one filter option except sorting or fill search bar.',
                        variant: 'error'
                    })
                );
            }
        } catch (error) {
            console.log(error);
        }
    }

    paginateHandler(event){
        this.arrayOfMovies = [...event.detail.records];
        console.log(JSON.stringify(event.detail.records));
    }

    toggleFavoriteHandler(event) {
        let changedMovie = {...event.detail.movie, isAddedToSF: !event.detail.movie.isAddedToSF};
        let foundIndex = this.arrayOfMoviesBefore.findIndex(movie => movie.id === changedMovie.id);
        this.arrayOfMoviesBefore[foundIndex] = changedMovie;
    }

    navigateToFavorites() {
        this[NavigationMixin.Navigate]({
            type: NAVIGATION_TAB_TYPE,
            attributes: {
                apiName: FAVORITES_PAGE_API_NAME
            }
        });
    }

    settingsChangeHandler(event) {
        this.recordsPerPage = event.detail.value.recordsPerPage;
        this.imdbSettings.IMDB_API_Key__c = event.detail.value.imdbAPIKey;
        this.imdbSettings.IMDB_Records_Per_Page__c = event.detail.value.recordsPerPage;
        this.imdbSettings.IMDB_Movies_Amount__c = event.detail.value.moviesAmount;
        updateIMDBSettings({updatedSettings: this.imdbSettings});
    }

}

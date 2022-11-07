import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
import queryAddedMovies from '@salesforce/apex/IMDB_FavoritesCtrl.queryAddedMovies';
import getIMDBSettings from '@salesforce/apex/IMDB_FavoritesCtrl.getIMDBSettings';
import updateIMDBSettings from '@salesforce/apex/IMDB_FavoritesCtrl.updateIMDBSettings';
// labels
import Error_text from '@salesforce/label/c.Error_text';
import Records_updated_error from '@salesforce/label/c.Records_updated_error';

const SEARCH_PAGE_API_NAME = 'IMDB_Search';
const NAVIGATION_TAB_TYPE = 'standard__navItemPage';

export default class ImdbFavorites extends NavigationMixin(LightningElement) {
    responseFromAPI;
    arrayOfMovies = [];
    arrayOfMoviesBefore;
    imdbSettings;
    recordsPerPage;

    async connectedCallback() {
        this.imdbSettings = await getIMDBSettings();
        this.recordsPerPage = this.imdbSettings.IMDB_Records_Per_Page__c;
        await this.queryAddedMovies();
    }

    async queryAddedMovies(filterParameters) {
        try {
            console.log('value2 - '+JSON.stringify(filterParameters));
            let responseFromAPI = await queryAddedMovies({
                jsonFilterParameters: JSON.stringify(filterParameters)
            });
            console.log('MOVIES');
            let resultArray = responseFromAPI.results;
            console.log(JSON.stringify(resultArray));
            this.arrayOfMoviesBefore = [...resultArray];
        } catch (error) {
            console.log(error);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: Error_text,
                    message: Records_updated_error,
                    variant: 'error'
                })
            );
        }
    }

    searchHandler(event) {
        console.log('value - '+JSON.stringify(event.detail.value));
        this.queryAddedMovies(event.detail.value);
    }

    paginateHandler(event){
        this.arrayOfMovies = [...event.detail.records];
        console.log(JSON.stringify(event.detail.records));
    }

    toggleFavoriteHandler(event) {
        let changedMovie = {...event.detail.movie, isAdded: !event.detail.movie.isAdded};
        let foundIndex = this.arrayOfMoviesBefore.findIndex(movie => movie.id === changedMovie.id);
        this.arrayOfMoviesBefore[foundIndex] = changedMovie;
    }

    navigateToSearch() {
        this[NavigationMixin.Navigate]({
            type: NAVIGATION_TAB_TYPE,
            attributes: {
                apiName: SEARCH_PAGE_API_NAME
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
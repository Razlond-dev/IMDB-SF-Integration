import { LightningElement } from 'lwc';
import fetchFilms from '@salesforce/apex/IMDB_SearchCtrl.fetchFilms';
import queryAddedMovieIds from '@salesforce/apex/IMDB_SearchCtrl.queryAddedMovieIds';
import updateIMDBSettings from '@salesforce/apex/IMDB_SearchCtrl.updateIMDBSettings';
import getIMDBSettings from '@salesforce/apex/IMDB_SearchCtrl.getIMDBSettings';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from "lightning/navigation";
// labels
import Error_text from '@salesforce/label/c.Error_text';
import Records_updated_error from '@salesforce/label/c.Records_updated_error';

const FAVORITES_PAGE_API_NAME = 'IMDB_Favorites';
const NAVIGATION_TAB_TYPE = 'standard__navItemPage';
const INITIAL_SEARCH_PARAMETERS = {"fromUserRating":"1.0","fromNumberOfVotes":"1000","sortBy":"release_date,desc"};

export default class ImdbSearch extends NavigationMixin(LightningElement) {
    responseFromAPI;
    // to delete later
    testResponse =
        '{"queryString":"?title=Dumb%20and%20Dumber&user_rating=1.0,10&num_votes=1,&moviemeter=1,","results":[{"id":"tt0109686","image":"https://m.media-amazon.com/images/M/MV5BZDQwMjNiMTQtY2UwYy00NjhiLTk0ZWEtZWM5ZWMzNGFjNTVkXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_Ratio0.6837_AL_.jpg","title":"Dumb and Dumber","description":"(1994)","runtimeStr":"107 min","genres":"Comedy","genreList":[{"key":"Comedy","value":"Comedy"}],"contentRating":"PG-13","imDbRating":"7.3","imDbRatingVotes":"384604","metacriticRating":"41","plot":"After a woman leaves a briefcase at the airport terminal, a dumb limo driver and his dumber friend set out on a hilarious cross-country road trip to Aspen to return it.","stars":"Peter Farrelly, Bobby Farrelly, Jim Carrey, Jeff Daniels, Lauren Holly, Mike Starr","starList":[{"id":"tt0109686","name":"Peter Farrelly"},{"id":"tt0109686","name":"Bobby Farrelly"},{"id":"tt0109686","name":"Jim Carrey"},{"id":"tt0109686","name":"Jeff Daniels"},{"id":"tt0109686","name":"Lauren Holly"},{"id":"tt0109686","name":"Mike Starr"}]},{"id":"tt2096672","image":"https://m.media-amazon.com/images/M/MV5BMTYxMzA0MzAyMF5BMl5BanBnXkFtZTgwMjMyNjcwMjE@._V1_Ratio0.6837_AL_.jpg","title":"Dumb and Dumber To","description":"(2014)","runtimeStr":"109 min","genres":"Comedy","genreList":[{"key":"Comedy","value":"Comedy"}],"contentRating":"PG-13","imDbRating":"5.6","imDbRatingVotes":"137955","metacriticRating":"36","plot":"20 years since their first adventure, Lloyd and Harry go on a road trip to find Harrys newly discovered daughter, who was given up for adoption.","stars":"Bobby Farrelly, Peter Farrelly, Jim Carrey, Jeff Daniels, Rob Riggle, Laurie Holden","starList":[{"id":"tt2096672","name":"Bobby Farrelly"},{"id":"tt2096672","name":"Peter Farrelly"},{"id":"tt2096672","name":"Jim Carrey"},{"id":"tt2096672","name":"Jeff Daniels"},{"id":"tt2096672","name":"Rob Riggle"},{"id":"tt2096672","name":"Laurie Holden"}]},{"id":"tt0329028","image":"https://m.media-amazon.com/images/M/MV5BMTcyMjk5MDQzM15BMl5BanBnXkFtZTYwNzYxNzk5._V1_Ratio0.6837_AL_.jpg","title":"Dumb and Dumberer: When Harry Met Lloyd","description":"(2003)","runtimeStr":"85 min","genres":"Comedy","genreList":[{"key":"Comedy","value":"Comedy"}],"contentRating":"PG-13","imDbRating":"3.4","imDbRatingVotes":"40094","metacriticRating":"19","plot":"Set back in the 80s when Harry met Lloyd in high school where they cross paths with a mean principal and a bunch of other outcasts much like themselves.","stars":"Troy Miller, Derek Richardson, Eric Christian Olsen, Eugene Levy, Timothy Stack","starList":[{"id":"tt0329028","name":"Troy Miller"},{"id":"tt0329028","name":"Derek Richardson"},{"id":"tt0329028","name":"Eric Christian Olsen"},{"id":"tt0329028","name":"Eugene Levy"},{"id":"tt0329028","name":"Timothy Stack"}]},{"id":"tt0111946","image":"https://m.media-amazon.com/images/M/MV5BOTkyZjkzNzYtYjU4ZC00ZjI4LWFhNzgtZWM4NTk4NWE1M2I3XkEyXkFqcGdeQXVyNTA4NzExMDg@._V1_Ratio0.7041_AL_.jpg","title":"Dumb and Dumber","description":"(1995–1996)","runtimeStr":"21 min","genres":"Animation, Short, Adventure","genreList":[{"key":"Animation","value":"Animation"},{"key":"Short","value":"Short"},{"key":"Adventure","value":"Adventure"}],"contentRating":"TV-Y7","imDbRating":"5.5","imDbRatingVotes":"806","metacriticRating":null,"plot":"The continuing nutty adventures of Lloyd and Harry and their pet beaver, as they drive around the country in their Dogmobile.","stars":"Bill Fagerbakke, Matt Frewer, Tom Kenny, Maurice LaMarche","starList":[{"id":"tt0111946","name":"Bill Fagerbakke"},{"id":"tt0111946","name":"Matt Frewer"},{"id":"tt0111946","name":"Tom Kenny"},{"id":"tt0111946","name":"Maurice LaMarche"}]}],"errorMessage":null}';
    arrayOfMovies = [];
    arrayOfMoviesBefore;
    imdbSettings;
    recordsPerPage = 0;

    async connectedCallback() {
        this.imdbSettings = await getIMDBSettings();
        this.recordsPerPage = this.imdbSettings.IMDB_Records_Per_Page__c;
        this.responseFromAPI = this.testResponse;
        this.arrayOfMoviesBefore = await this.fetchFilmsFromApex(INITIAL_SEARCH_PARAMETERS);
        // this.arrayOfMoviesBefore = await this.markAlreadyAddedMovies(JSON.parse(this.responseFromAPI).results);
    }

    async fetchFilmsFromApex(filterParameters) {
        let responseFromAPI;
        try {
            console.log('value2 - '+JSON.stringify(filterParameters));
            responseFromAPI = await fetchFilms({
                jsonFilterParameters: JSON.stringify(filterParameters)
            });
            let resultArray = await this.markAlreadyAddedMovies(JSON.parse(responseFromAPI).results);
            console.log('MOVIES SIZE - '+JSON.stringify(resultArray.length));
            this.arrayOfMoviesBefore = [...resultArray];
        } catch (error) {
            let errorMessage = Records_updated_error;
            if (JSON.parse(responseFromAPI).errorMessage === 'Invalid API Key') {
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
    }

    async markAlreadyAddedMovies(arrayToCheck) {
        let arrayOfExistedMovieIds = await queryAddedMovieIds();
        return arrayToCheck.map((movie) => {
            movie.isAdded = arrayOfExistedMovieIds.includes(movie.id);
            return movie;
        });
    }

    searchHandler(event) {
        try {
            console.log('value1 - ' + JSON.stringify(event.detail.value));
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
                        message: 'Please select at least one filter option except sorting',
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
        let changedMovie = {...event.detail.movie, isAdded: !event.detail.movie.isAdded};
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

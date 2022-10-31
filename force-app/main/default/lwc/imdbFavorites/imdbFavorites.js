import { LightningElement } from 'lwc';
import queryAddedMovies from '@salesforce/apex/IMDB_FavoritesCtrl.queryAddedMovies';

export default class ImdbFavorites extends LightningElement {
    responseFromAPI;
    arrayOfMovies = [];

    async connectedCallback() {
        let response = await queryAddedMovies();
        this.arrayOfMovies = JSON.parse(response);
    }
}
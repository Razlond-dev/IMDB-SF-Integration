import { LightningElement, api, track } from 'lwc';
import addMovieToFavorites from '@salesforce/apex/IMDB_MovieItemCtrl.addMovieToFavorites';
import removeMovieFromFavorites from '@salesforce/apex/IMDB_MovieItemCtrl.removeMovieFromFavorites';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// labels
import Success_text from '@salesforce/label/c.Success_text';
import Error_text from '@salesforce/label/c.Error_text';
import Records_updated from '@salesforce/label/c.Records_updated';
import Records_updated_error from '@salesforce/label/c.Records_updated_error';

export default class ImdbMovieItem extends LightningElement {
    @api movie;
    @api isInitiallyAdded;
    @track isAdded;
    image;
    title;
    imDbRating;
    plot;

    connectedCallback() {
        this.image = this.movie.image;
        this.title = this.movie.title;
        this.imDbRating = this.movie.imDbRating;
        this.plot = this.movie.plot;
        this.isAdded = this.movie.isAdded;
        console.log('item');
        console.log(JSON.stringify(this.movie.isAdded));
        console.log(JSON.stringify(this.isAdded));
        console.log(JSON.stringify(this.isInitiallyAdded));
    }


    async addMovie() {
        console.log('start');
        console.log(this.movie.isAdded);
        console.log(JSON.stringify(this.movie.isAdded));
        try {
            if (this.isAdded) {
                await removeMovieFromFavorites({ externalId: this.movie.id });
                this.isAdded = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: Success_text,
                        message: 'removed successfully',
                        variant: 'success'
                    })
                );
            } else {
                await addMovieToFavorites({
                    jsonMovie: JSON.stringify(this.movie)
                });
                this.isAdded = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: Success_text,
                        message: Records_updated,
                        variant: 'success'
                    })
                );
            }
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
        console.log('end');
    }

    get tabClass() {
        return this.isAdded ? 'removeButton' : 'addButton';
    }
}
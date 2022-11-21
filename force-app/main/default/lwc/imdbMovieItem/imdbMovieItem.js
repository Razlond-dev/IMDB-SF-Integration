import { LightningElement, api, track } from 'lwc';
import addMovieToFavorites from '@salesforce/apex/IMDB_MovieItemCtrl.addMovieToFavorites';
import removeMovieFromFavorites from '@salesforce/apex/IMDB_MovieItemCtrl.removeMovieFromFavorites';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import IMDB_images from '@salesforce/resourceUrl/IMDB_images';
// labels
import Success_text from '@salesforce/label/c.Success_text';
import Error_text from '@salesforce/label/c.Error_text';

const NO_IMAGE_IMDB = 'https://imdb-api.com/images/original/nopicture.jpg';
export default class ImdbMovieItem extends LightningElement {
    @api movie;
    @api isInitiallyAdded;
    @track isAddedToSF;
    title;
    imdbImage = IMDB_images + '/IMDB_images/icons8-imdb-48.png';
    metascoreImage = IMDB_images + '/IMDB_images/icons8-metascore-48.png';
    noImageMock = IMDB_images + '/IMDB_images/no_image.png';
    isShowMovieDetails = false;
    isLoading = false;

    connectedCallback() {
        this.title = this.movie.title;
        this.isAddedToSF = this.movie.isAddedToSF;
    }

    renderedCallback() {
        this.updateColorThemes();
    }

    updateColorThemes() {
        const topElement = this.template.querySelector('div');
        let metascoreBackgroundColor = 'green';
        let metascoreColor = 'white';
        if (this.metacriticRating > 60) {
            metascoreBackgroundColor = 'green';
            metascoreColor = 'white';
        } else if (this.metacriticRating > 39) {
            metascoreBackgroundColor = 'yellow';
            metascoreColor = 'black';
        } else if (this.metacriticRating <= 39) {
            metascoreBackgroundColor = 'red';
            metascoreColor = 'white';
        }
        topElement.style.setProperty('--metascore-background-color', metascoreBackgroundColor);
        topElement.style.setProperty('--metascore-color', metascoreColor);
    }

    async addMovie() {
        try {
            this.isLoading = true;
            if (this.isAddedToSF) {
                await removeMovieFromFavorites({ externalId: this.movie.id });
                this.isAddedToSF = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: Success_text,
                        message: 'Movie was successfully removed from Favorites.',
                        variant: 'success'
                    })
                );
            } else {
                await addMovieToFavorites({
                    jsonMovie: JSON.stringify(this.movie)
                });
                this.isAddedToSF = true;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: Success_text,
                        message: 'Movie was successfully added to Favorites.',
                        variant: 'success'
                    })
                );
            }
            this.dispatchEvent(
                new CustomEvent('togglefavorite', {
                    detail: {
                        movie: this.movie
                    }
                })
            );
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
        this.isLoading = false;
    }

    openMovieDetails() {
        this.isShowMovieDetails = true;
    }

    hideMovieDetails() {
        this.isShowMovieDetails = false;
    }

    get tabClass() {
        return this.isAddedToSF ? 'removeButton' : 'addButton';
    }

    get favoritesLabel() {
        return this.isAddedToSF ? 'Remove from Favorites' : 'Add to Favorites';
    }
    get favoritesVariant() {
        return this.isAddedToSF ? 'destructive' : 'success';
    }
    get metacriticRating() {
        return this.movie.metacriticRating ? this.movie.metacriticRating : '-';
    }
    get imDbRating() {
        return this.movie.imDbRating ? this.movie.imDbRating : '-';
    }
    get imDbRatingVotes() {
        return this.movie.imDbRatingVotes ? this.movie.imDbRatingVotes : '-';
    }
    get image() {
        if (!this.movie.image || this.movie.image == '' || this.movie.image == NO_IMAGE_IMDB) {
            return this.noImageMock;
        }
        return this.movie.image;
    }
    get description() {
        return this.movie.description ? this.movie.description : '-';
    }
    get runtimeStr() {
        return this.movie.runtimeStr ? this.movie.runtimeStr : '-';
    }
    get genres() {
        return this.movie.genres ? this.movie.genres : '-';
    }
    get contentRating() {
        return this.movie.contentRating ? this.movie.contentRating : '-';
    }
    get plot() {
        return this.movie.plot ? this.movie.plot : '-';
    }
    get stars() {
        return this.movie.stars ? this.movie.stars : '-';
    }
}

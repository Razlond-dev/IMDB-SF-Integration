/* eslint-disable guard-for-in */
import { LightningElement } from 'lwc';

export default class ImdbAdvancedSearch extends LightningElement {
    genresValue = [];
    genresOptions = [
        { label: 'Action', value: 'Action' },
        { label: 'Adventure', value: 'Adventure' },
        { label: 'Animation', value: 'Animation' },
        { label: 'Biography', value: 'Biography' },
        { label: 'Comedy', value: 'Comedy' },
        { label: 'Crime', value: 'Crime' },
        { label: 'Documentary', value: 'Documentary' },
        { label: 'Drama', value: 'Drama' },
        { label: 'Family', value: 'Family' },
        { label: 'Fantasy', value: 'Fantasy' },
        { label: 'Film-Noir', value: 'Film-Noir' },
        { label: 'Game-Show', value: 'Game-Show' },
        { label: 'History', value: 'History' },
        { label: 'Horror', value: 'Horror' },
        { label: 'Music', value: 'Music' },
        { label: 'Musical', value: 'Musical' },
        { label: 'Mystery', value: 'Mystery' },
        { label: 'News', value: 'News' },
        { label: 'Reality-TV', value: 'Reality-TV' },
        { label: 'Romance', value: 'Romance' },
        { label: 'Sci-Fi', value: 'Sci-Fi' },
        { label: 'Sport', value: 'Sport' },
        { label: 'Talk-Show', value: 'Talk-Show' },
        { label: 'Thriller', value: 'Thriller' },
        { label: 'War', value: 'War' },
        { label: 'Western', value: 'Western' }
    ];
    contentRatingValue = [];
    contentRatingOptions = [
        { label: 'G', value: 'G' },
        { label: 'PG', value: 'PG' },
        { label: 'PG-13', value: 'PG-13' },
        { label: 'R', value: 'R' },
        { label: 'NC-17', value: 'NC-17' }
    ];

    sortByValue = '';
    sortByOptions = [
        { label: 'A-Z Ascending', value: 'alpha,asc' },
        { label: 'A-Z Descending', value: 'alpha,desc' },
        { label: 'User Rating Ascending', value: 'user_rating,asc' },
        { label: 'User Rating Descending', value: 'user_rating,desc' },
        { label: 'Num Votes Ascending', value: 'num_votes,asc' },
        { label: 'Num Votes Descending', value: 'num_votes,desc' },
        { label: 'Runtime Ascending', value: 'runtime,asc' },
        { label: 'Runtime Descending', value: 'runtime,desc' },
        { label: 'Release Date Ascending', value: 'release_date,asc' },
        { label: 'Release Date Descending', value: 'release_date,desc' }
    ];

    submitHandler(event) {
        event.preventDefault();
        let numberInputNames = ['fromNumberOfVotes', 'toNumberOfVotes', 'fromRuntime', 'toRuntime'];
        const formData = new FormData(event.target);
        const formProps = Object.fromEntries(formData);
        formProps.genres = this.genresValue;
        formProps.contentRating = this.contentRatingValue;
        formProps.sortBy = this.sortByValue;
        for (const property in formProps) {
            if (formProps[property] === '') {
                formProps[property] = null;
            }
            if (numberInputNames.includes(property) && formProps[property] != null) {
                formProps[property] = formProps[property].replace(/\s/g, '');
            } 
            if (property === 'fromUserRating' && formProps[property] !== null) {
                formProps[property] = formProps[property].toString().replace(',', '.');
            }
            if (property === 'toUserRating' && formProps[property] !== null) {
                formProps[property] = formProps[property].toString().replace(',', '.');
            }
        }
        console.log('FORM PROPS - '+JSON.stringify(formProps));
        this.dispatchEvent(
            new CustomEvent('search', {
                detail: { value: formProps }
            })
        );
    }

    handleChangeGenres(event) {
        this.genresValue = event.detail.selected;
    }

    handleChangeContentRating(event) {
        this.contentRatingValue = event.detail.selected;
    }

    handleChangeSortBy(event) {
        this.sortByValue = event.detail.value;
    }

    toggleFilters() {
        this.template.querySelector('.slide-up').classList.toggle('slide-down');
    }

}

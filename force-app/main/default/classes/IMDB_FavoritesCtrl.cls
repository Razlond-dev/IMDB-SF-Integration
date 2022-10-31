public with sharing class IMDB_FavoritesCtrl {
    @AuraEnabled
    public static String queryAddedMovies() {
        List<IMDB_MovieItemCtrl.MovieWrapper> listOfMovieWrappers = new List<IMDB_MovieItemCtrl.MovieWrapper>();
        try {
            List<IMDB_Movie__c> listOfMovies = [
                SELECT
                    IMDB_Content_Rating__c,
                    IMDB_Description__c,
                    IMDB_Genres__c,
                    IMDB_Image_URL__c,
                    IMDB_Id__c,
                    IMDB_Rating__c,
                    IMDB_Rating_Votes__c,
                    IMDB_Metacritic_Rating__c,
                    IMDB_Plot__c,
                    IMDB_Runtime__c,
                    IMDB_Stars__c,
                    IMDB_Title__c
                FROM IMDB_Movie__c
                WHERE OwnerId = :UserInfo.getUserId()
            ];
            for (IMDB_Movie__c movie : listOfMovies) {
                IMDB_MovieItemCtrl.MovieWrapper wrapper = new IMDB_MovieItemCtrl.MovieWrapper();
                wrapper.id = movie.IMDB_Id__c;
                wrapper.title = movie.IMDB_Title__c;
                wrapper.description = movie.IMDB_Description__c;
                wrapper.image = movie.IMDB_Image_URL__c;
                wrapper.runtimeStr = movie.IMDB_Runtime__c;
                wrapper.genres = movie.IMDB_Genres__c;
                wrapper.contentRating = movie.IMDB_Content_Rating__c;
                wrapper.imDbRating = movie.IMDB_Rating__c;
                wrapper.imDbRatingVotes = movie.IMDB_Rating_Votes__c;
                wrapper.metacriticRating = movie.IMDB_Metacritic_Rating__c;
                wrapper.plot = movie.IMDB_Plot__c;
                wrapper.stars = movie.IMDB_Stars__c;
                wrapper.isAdded = true;
                listOfMovieWrappers.add(wrapper);
            }
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(
                System.Label.Records_updated_error
            );
            error.setMessage(System.Label.Records_updated_error);
            System.debug(catchedException.getMessage());
            throw error;
        }
        return JSON.serialize(listOfMovieWrappers);
    }
}
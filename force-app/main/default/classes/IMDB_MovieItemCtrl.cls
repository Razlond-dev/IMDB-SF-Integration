public with sharing class IMDB_MovieItemCtrl {
    @AuraEnabled
    public static void addMovieToFavorites(String jsonMovie) {
        try {
            MovieWrapper movie = (MovieWrapper) JSON.deserialize(
                jsonMovie,
                MovieWrapper.class
            );
            insertMovieFromWrapper(movie);
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(
                System.Label.Records_updated_error
            );
            error.setMessage(System.Label.Records_updated_error);
            System.debug(catchedException.getMessage());
            throw error;
        }
    }

    @AuraEnabled
    public static void removeMovieFromFavorites(String externalId) {
        try {
            delete [
                SELECT Id
                FROM IMDB_Movie__c
                WHERE IMDB_Id__c = :externalId
            ];
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(
                System.Label.Records_updated_error
            );
            error.setMessage(System.Label.Records_updated_error);
            System.debug(catchedException.getMessage());
            throw error;
        }
    }

    public static void insertMovieFromWrapper(MovieWrapper movieWrapper) {
        // Decimal runtimeDecimal;
        // if (movieWrapper.runtimeStr != null) {
        //     runtimeDecimal = Decimal.valueOf(movieWrapper.runtimeStr.replaceAll('min', '').trim());
        //     System.debug(runtimeDecimal);
        // }
        IMDB_Movie__c movie = new IMDB_Movie__c(
            IMDB_Id__c = movieWrapper.id,
            IMDB_Title__c = movieWrapper.title,
            IMDB_Description__c = movieWrapper.description,
            IMDB_Image_URL__c = movieWrapper.image,
            IMDB_Runtime__c = movieWrapper.runtimeStr,
            IMDB_Genres__c = movieWrapper.genres,
            IMDB_Content_Rating__c = movieWrapper.contentRating,
            IMDB_Rating__c = movieWrapper.imDbRating,
            IMDB_Rating_Votes__c = movieWrapper.imDbRatingVotes,
            IMDB_Metacritic_Rating__c = movieWrapper.metacriticRating,
            IMDB_Plot__c = movieWrapper.plot,
            IMDB_Stars__c = movieWrapper.stars
        );
        insert movie;
    }

    public class MovieWrapper {
        public String id { get; set; }
        public String image { get; set; }
        public String title { get; set; }
        public String description { get; set; }
        public String runtimeStr { get; set; }
        public String genres { get; set; }
        public String contentRating { get; set; }
        public Decimal imDbRating { get; set; }
        public Decimal imDbRatingVotes { get; set; }
        public Decimal metacriticRating { get; set; }
        public String plot { get; set; }
        public String stars { get; set; }
        public Boolean isAdded { get; set; }
    }
}
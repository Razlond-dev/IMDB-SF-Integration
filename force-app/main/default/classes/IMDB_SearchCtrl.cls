public with sharing class IMDB_SearchCtrl {
    @AuraEnabled
    public static String fetchFilms() {
        try {
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(
                'https://imdb-api.com/en/API/SearchMovie/k_1rk0yomw/inception 2010'
            );
            req.setMethod('GET');
            HttpResponse resp = http.send(req);
            return resp.getBody();
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
    public static List<String> queryAddedMovieIds() {
        List<String> listOfAddedMovieExternalIds = new List<String>();
        try {
            List<IMDB_Movie__c> listOfMovies = [
                SELECT IMDB_Id__c
                FROM IMDB_Movie__c
                WHERE OwnerId = :UserInfo.getUserId()
            ];
            for (IMDB_Movie__c movie : listOfMovies) {
                listOfAddedMovieExternalIds.add(movie.IMDB_Id__c);
            }
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(
                System.Label.Records_updated_error
            );
            error.setMessage(System.Label.Records_updated_error);
            System.debug(catchedException.getMessage());
            throw error;
        }
        return listOfAddedMovieExternalIds;
    }
}
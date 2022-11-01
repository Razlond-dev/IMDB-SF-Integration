public with sharing class IMDB_MovieTriggerHandler {
    public static void onBeforeInsert(List<IMDB_Movie__c> listOfNewMovies) {
        for (IMDB_Movie__c newMovie : listOfNewMovies) {
            newMovie.IMDB_Unique_Id__c = newMovie.IMDB_Id__c + '-' + newMovie.OwnerId;
        }
    }

    public static void onBeforeUpdate(List<IMDB_Movie__c> listOfNewMovies, Map<Id,IMDB_Movie__c> mapOfOldMoviesById) {
        for (IMDB_Movie__c newMovie : listOfNewMovies) {
            if (newMovie.IMDB_Id__c != mapOfOldMoviesById.get(newMovie.Id).IMDB_Id__c)
            newMovie.IMDB_Unique_Id__c = newMovie.IMDB_Id__c + '-' + newMovie.createdById;
        }
    }
}

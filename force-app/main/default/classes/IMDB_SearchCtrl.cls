public with sharing class IMDB_SearchCtrl {
    @AuraEnabled
    public static IMDB_ResponseWrapper fetchFilms(String jsonFilterParameters) {
        try {
            FilterParameters filterParameters = (FilterParameters) JSON.deserialize(
                jsonFilterParameters,
                FilterParameters.class
            );
            System.debug('json - ' + jsonFilterParameters);
            System.debug(filterParameters);

            String endPoint = 'https://imdb-api.com/API/AdvancedSearch/';
            endPoint += constructQueryString(filterParameters);
            
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod('GET');
            req.setTimeout(30000);
            HttpResponse resp = http.send(req);
            IMDB_ResponseWrapper responseWrapper = IMDB_ResponseWrapper.parse(resp.getBody());
            if (responseWrapper.results != null && !responseWrapper.results.isEmpty()) {
                for (IMDB_ResponseWrapper.IMDB_ResponseMovie fetchedMovie : responseWrapper.results) {
                    fetchedMovie.isAdded = false;
                }
            }
            System.debug('RESP WRAP - '+responseWrapper);
            return responseWrapper;
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
                WHERE CreatedById = :UserInfo.getUserId()
            ];
            for (IMDB_Movie__c movie : listOfMovies) {
                listOfAddedMovieExternalIds.add(movie.IMDB_Id__c);
            }
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(
                System.Label.Records_updated_error
            );
            error.setMessage(System.Label.Records_updated_error);
            System.debug(catchedException);
            throw error;
        }
        return listOfAddedMovieExternalIds;
    }

    @AuraEnabled
    public static IMDB_Settings__c getIMDBSettings() {
        return IMDB_Settings__c.getInstance();
    }

    public static String constructQueryString(FilterParameters filterParameters) {
        IMDB_Settings__c imdbSettings = IMDB_Settings__c.getInstance();
        String queryParams = '';
        if (filterParameters.title != null) {
            queryParams += '&title=' + filterParameters.title;
        }
        queryParams += '&title_type=feature,tv_movie,tv_series,tv_episode,tv_special,tv_miniseries,documentary,short,tv_short';
        if (filterParameters.genres != null && !filterParameters.genres.isEmpty()) {
            queryParams += '&genres=' + String.join(filterParameters.genres, ',');
        }
        if (filterParameters.contentRating != null && !filterParameters.contentRating.isEmpty()) {
            for (String certificate : filterParameters.contentRating) {
                certificate = 'us:' + certificate;
            }
            queryParams += '&certificates=' + String.join(filterParameters.contentRating, ',');
        }
        if (filterParameters.fromReleaseDate != null || filterParameters.toReleaseDate != null) {
            queryParams += '&release_date=';
            queryParams += filterParameters.fromReleaseDate != null ? filterParameters.fromReleaseDate : '';
            queryParams += ',';
            queryParams += filterParameters.toReleaseDate != null ? filterParameters.toReleaseDate : '';
        }
        if (filterParameters.fromUserRating != null || filterParameters.toUserRating != null) {
            queryParams += '&user_rating=';
            queryParams += filterParameters.fromUserRating != null ? filterParameters.fromUserRating : '';
            queryParams += ',';
            queryParams += filterParameters.toUserRating != null ? filterParameters.toUserRating : '';
        }
        if (filterParameters.fromNumberOfVotes != null || filterParameters.toNumberOfVotes != null) {
            queryParams += '&num_votes=';
            queryParams += filterParameters.fromNumberOfVotes != null ? filterParameters.fromNumberOfVotes : '';
            queryParams += ',';
            queryParams += filterParameters.toNumberOfVotes != null ? filterParameters.toNumberOfVotes : '';
        }
        if (filterParameters.fromRuntime != null || filterParameters.toRuntime != null) {
            queryParams += '&moviemeter=';
            queryParams += filterParameters.fromRuntime != null ? filterParameters.fromRuntime : '';
            queryParams += ',';
            queryParams += filterParameters.toRuntime != null ? filterParameters.toRuntime : '';
        }
        if (filterParameters.plot != null) {
            queryParams += '&plot=' + filterParameters.plot;
        }
        queryParams += '&count=' + imdbSettings.IMDB_Movies_Amount__c.intValue();
        if (filterParameters.sortBy != null) {
            queryParams += '&sort=' + filterParameters.sortBy;
        }
        if (queryParams != '') {
            queryParams = queryParams.substring(1, queryParams.length());
        }
        System.debug('query params - '+queryParams);
        return imdbSettings.IMDB_API_Key__c + '?' + queryParams;
    }

    @AuraEnabled
    public static void updateIMDBSettings(IMDB_Settings__c updatedSettings) {
        try {
            upsert updatedSettings;
        } catch (Exception catchedException) {
            AuraHandledException error = new AuraHandledException(System.Label.Records_access_error);
            error.setMessage(System.Label.Records_access_error);
            System.debug(catchedException.getMessage());
            throw error;
        }
    }

    public class FilterParameters {
        public String title { get; set; }
        public List<String> genres { get; set; }
        public List<String> contentRating { get; set; }
        public String fromReleaseDate { get; set; }
        public String toReleaseDate { get; set; }
        public String fromUserRating { get; set; }
        public String toUserRating { get; set; }
        public String fromNumberOfVotes { get; set; }
        public String toNumberOfVotes { get; set; }
        public String fromRuntime { get; set; }
        public String toRuntime { get; set; }
        public String plot { get; set; }
        public String sortBy { get; set; }
    }
  
}
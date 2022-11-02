public with sharing class IMDB_SearchCtrl {
    @AuraEnabled
    public static String fetchFilms(String jsonFilterParameters) {
        try {
            FilterParameters filterParameters = (FilterParameters) JSON.deserialize(
                jsonFilterParameters,
                FilterParameters.class
            );
            System.debug(filterParameters);
            String endPoint = 'https://imdb-api.com/API/AdvancedSearch/k_1rk0yomw?';
            String queryParams = '';
            if (filterParameters.title != null) {
                queryParams += '&title=' + filterParameters.title;
            }
            if (!filterParameters.genres.isEmpty()) {
                queryParams += '&genres=' + String.join(filterParameters.genres, ',');
            }
            if (!filterParameters.contentRating.isEmpty()) {
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
            if (filterParameters.sortBy != null) {
                queryParams += '&sort=' + filterParameters.sortBy;
            }
            if (queryParams != '') {
                queryParams = queryParams.substring(1, queryParams.length());
            }
            endPoint += queryParams;
            Http http = new Http();
            HttpRequest req = new HttpRequest();
            req.setEndpoint(endPoint);
            req.setMethod('GET');
            HttpResponse resp = http.send(req);
            return resp.getBody();
            // return endPoint;
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
            System.debug(catchedException.getMessage());
            throw error;
        }
        return listOfAddedMovieExternalIds;
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
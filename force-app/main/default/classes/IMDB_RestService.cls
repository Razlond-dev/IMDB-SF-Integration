@RestResource(urlMapping='/IMDBMovies/*')
global with sharing class IMDB_RestService {
    @HttpGet
    global static void doGet() {
        IMDB_SearchCtrl.FilterParameters filterParameters = handleParams(
            RestContext.request.params
        );
        System.debug('fil params - ' + filterParameters);
        RestResponse response = RestContext.response;
        try {
            IMDB_ResponseWrapper responseWrapper = IMDB_FavoritesCtrl.queryAddedMoviesHandler(
                JSON.serialize(filterParameters)
            );
            System.debug('FAV RESULTS - ' + responseWrapper.results);
            if (!responseWrapper.results.isEmpty()) {
                responseWrapper.queryString = '';
                response.responseBody = Blob.valueOf(JSON.serialize(responseWrapper));
            } else {
                response.responseBody = Blob.valueOf(
                    JSON.serialize(IMDB_SearchCtrl.fetchFilmsIMDB(JSON.serialize(filterParameters)))
                );
            }
            response.statusCode = 200;
        } catch (Exception e) {
            response.statusCode = 500;
            response.responseBody = Blob.valueOf(e.getMessage());
        }
    }

    @HttpPost
    global static void doPost() {
        RestResponse response = RestContext.response;
        try {
            RestRequest req = RestContext.request;
            Blob body = req.requestBody;
            String requestString = body.toString();
            IMDB_ResponseWrapper requestWrapper = (IMDB_ResponseWrapper) JSON.deserialize(
                requestString,
                IMDB_ResponseWrapper.class
            );

            List<IMDB_Movie__c> listOfMovies = new List<IMDB_Movie__c>();
            for (IMDB_ResponseWrapper.IMDB_ResponseMovie movie : requestWrapper.results) {
                listOfMovies.add(transformMovieToSFObject(movie));
            }
            insert listOfMovies;
            String responseEnding = listOfMovies.size() == 1 ? ' movie.' : ' movies.';
            response.responseBody = Blob.valueOf(
                JSON.serialize('Successfully inserted ' + listOfMovies.size() + responseEnding)
            );
            response.statusCode = 200;
        } catch (Exception e) {
            response.statusCode = 500;
            response.responseBody = Blob.valueOf(e.getMessage());
        }
    }

    private static IMDB_Movie__c transformMovieToSFObject(
        IMDB_ResponseWrapper.IMDB_ResponseMovie movieWrapper
    ) {
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
        return movie;
    }

    private static IMDB_SearchCtrl.FilterParameters handleParams(Map<String, String> params) {
        List<String> listOfArrayParams = new List<String>{ 'genres', 'certificates' };
        IMDB_SearchCtrl.FilterParameters filteredParam = new IMDB_SearchCtrl.FilterParameters();

        for (String paramKey : params.keySet()) {
            switch on paramKey {
                when 'title' {
                    filteredParam.title = params.get(paramKey);
                }
                when 'plot' {
                    filteredParam.plot = params.get(paramKey);
                }
                when 'sort' {
                    filteredParam.sortBy = params.get(paramKey);
                }
                when 'user_rating' {
                    filteredParam.fromUserRating = params.get(paramKey).split(',')?.get(0);
                    filteredParam.toUserRating = params.get(paramKey).split(',')?.get(1);
                }
                when 'release_date' {
                    filteredParam.fromReleaseDate = params.get(paramKey).split(',')?.get(0);
                    filteredParam.toReleaseDate = params.get(paramKey).split(',')?.get(1);
                }
                when 'num_votes' {
                    filteredParam.fromNumberOfVotes = params.get(paramKey)?.split(',')?.get(0);
                    if (params.get(paramKey)?.split(',').size() > 1) {
                        filteredParam.toNumberOfVotes = params.get(paramKey)?.split(',')?.get(1);
                    }
                }
                when 'moviemeter' {
                    filteredParam.fromRuntime = params.get(paramKey)?.split(',')?.get(0);
                    filteredParam.toRuntime = params.get(paramKey)?.split(',')?.get(1);
                }
                when 'genres' {
                    filteredParam.genres = params.get(paramKey)?.split(',');
                }
                when 'certificates' {
                    filteredParam.contentRating = params.get(paramKey)?.split(',');
                }
            }
        }

        return filteredParam;
    }
}

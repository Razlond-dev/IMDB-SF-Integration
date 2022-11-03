public with sharing class IMDB_FavoritesCtrl {
    @AuraEnabled
    public static String queryAddedMovies(String jsonFilterParameters) {
        List<IMDB_MovieItemCtrl.MovieWrapper> listOfMovieWrappers = new List<IMDB_MovieItemCtrl.MovieWrapper>();
        List<IMDB_Movie__c> listOfMovies = new List<IMDB_Movie__c>();
        try {
            String userId = UserInfo.getUserId();
            String query = 'SELECT IMDB_Content_Rating__c, IMDB_Description__c, IMDB_Genres__c, ';
            query += 'IMDB_Image_URL__c, IMDB_Id__c, IMDB_Rating__c, IMDB_Rating_Votes__c, IMDB_Metacritic_Rating__c, ';
            query += 'IMDB_Plot__c, IMDB_Runtime__c, IMDB_Runtime_Number__c, IMDB_Stars__c, IMDB_Title__c FROM IMDB_Movie__c';
            query += ' WHERE CreatedById = :userId';
            System.debug(jsonFilterParameters);
            if (jsonFilterParameters != null) {
                IMDB_SearchCtrl.FilterParameters filterParameters = (IMDB_SearchCtrl.FilterParameters) JSON.deserialize(
                    jsonFilterParameters,
                    IMDB_SearchCtrl.FilterParameters.class
                );
                String queryParams = '';
                if (filterParameters.title != null) {
                    queryParams += ' AND IMDB_Title__c LIKE \'%' + filterParameters.title + '%\'';
                }
                if (!filterParameters.genres.isEmpty()) {
                    for (Integer i = 0; i < filterParameters.genres.size(); i++) {
                        if (i == 0) {
                            queryParams +=
                                ' AND (IMDB_Genres__c LIKE \'%' +
                                filterParameters.genres[i] +
                                '%\'';
                            queryParams += filterParameters.genres.size() == 1 ? ')' : '';
                        } else if (i == filterParameters.genres.size() - 1) {
                            queryParams +=
                                ' OR IMDB_Genres__c LIKE \'%' +
                                filterParameters.genres[i] +
                                '%\')';
                        } else {
                            queryParams +=
                                ' OR IMDB_Genres__c LIKE \'%' +
                                filterParameters.genres[i] +
                                '%\'';
                        }
                    }
                }

                if (!filterParameters.contentRating.isEmpty()) {
                    for (Integer i = 0; i < filterParameters.contentRating.size(); i++) {
                        if (i == 0) {
                            queryParams +=
                                ' AND (IMDB_Content_Rating__c LIKE \'%' +
                                filterParameters.contentRating[i] +
                                '%\'';
                            queryParams += filterParameters.contentRating.size() == 1 ? ')' : '';
                        } else if (i == filterParameters.contentRating.size() - 1) {
                            queryParams +=
                                ' OR IMDB_Content_Rating__c LIKE \'%' +
                                filterParameters.contentRating[i] +
                                '%\')';
                        } else {
                            queryParams +=
                                ' OR IMDB_Content_Rating__c LIKE \'%' +
                                filterParameters.contentRating[i] +
                                '%\'';
                        }
                    }
                }
                if (filterParameters.fromUserRating != null) {
                    queryParams += ' AND IMDB_Rating__c >= ' + filterParameters.fromUserRating;
                }
                if (filterParameters.toUserRating != null) {
                    queryParams += ' AND IMDB_Rating__c <= ' + filterParameters.toUserRating;
                }
                if (filterParameters.fromNumberOfVotes != null) {
                    queryParams +=
                        ' AND IMDB_Rating_Votes__c >= ' + filterParameters.fromNumberOfVotes;
                }
                if (filterParameters.toNumberOfVotes != null) {
                    queryParams +=
                        ' AND IMDB_Rating_Votes__c <= ' + filterParameters.toNumberOfVotes;
                }
                if (filterParameters.fromRuntime != null) {
                    queryParams += ' AND IMDB_Runtime_Number__c >= ' + filterParameters.fromRuntime;
                }
                if (filterParameters.toRuntime != null) {
                    queryParams += ' AND IMDB_Runtime_Number__c <= ' + filterParameters.toRuntime;
                }
                if (filterParameters.plot != null) {
                    queryParams += ' AND IMDB_Plot__c LIKE \'%' + filterParameters.plot + '%\'';
                }
                if (filterParameters.sortBy != null) {
                    // first element is field, second desc/asc
                    List<String> listOfSortParameters = filterParameters.sortBy.split(',');
                    String fieldToSort;

                    switch on listOfSortParameters[0] {
                        when 'alpha' {
                            fieldToSort = 'IMDB_Title__c';
                        }
                        when 'user_rating' {
                            fieldToSort = 'IMDB_Rating__c';
                        }
                        when 'num_votes' {
                            fieldToSort = 'IMDB_Rating_Votes__c';
                        }
                        when 'runtime' {
                            fieldToSort = 'IMDB_Runtime_Number__c';
                        }
                    }

                    queryParams += ' ORDER BY ' + fieldToSort + ' ' + listOfSortParameters[1];
                }
                System.debug(queryParams);
                query += queryParams;
            }

            listOfMovies = Database.query(query);
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

    @AuraEnabled
    public static IMDB_Settings__c getIMDBSettings() {
        return IMDB_Settings__c.getInstance();
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
}

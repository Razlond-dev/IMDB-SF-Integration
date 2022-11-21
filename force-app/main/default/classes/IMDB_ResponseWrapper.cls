global class IMDB_ResponseWrapper {
    @AuraEnabled
    global String queryString { get; set; }
    @AuraEnabled
    global Object errorMessage { get; set; }
    @AuraEnabled
    global List<IMDB_ResponseMovie> results { get; set; }

    global class IMDB_ResponseMovie {
        @AuraEnabled
        global String id { get; set; }
        @AuraEnabled
        global String image { get; set; }
        @AuraEnabled
        global String title { get; set; }
        @AuraEnabled
        global String description { get; set; }
        @AuraEnabled
        global String runtimeStr { get; set; }
        @AuraEnabled
        global String genres { get; set; }
        @AuraEnabled
        global String contentRating { get; set; }
        @AuraEnabled
        global Decimal imDbRating { get; set; }
        @AuraEnabled
        global Decimal imDbRatingVotes { get; set; }
        @AuraEnabled
        global Decimal metacriticRating { get; set; }
        @AuraEnabled
        global String plot { get; set; }
        @AuraEnabled
        global String stars { get; set; }
        @AuraEnabled
        global Boolean isAddedToSF { get; set; }
    }

    @AuraEnabled
    global static IMDB_ResponseWrapper parse(String json) {
        return (IMDB_ResponseWrapper) System.JSON.deserialize(json, IMDB_ResponseWrapper.class);
    }
}

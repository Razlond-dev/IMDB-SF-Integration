public with sharing class IMDB_Utility {
    public static IMDB_Settings__c getIMDBSettings() {
        return IMDB_Settings__c.getInstance();
    }

    public class ResponseMovie {
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

    public class ResponseWrapper {
        public String queryString { get; set; }
        public List<ResponseMovie> results { get; set; }
    }
}

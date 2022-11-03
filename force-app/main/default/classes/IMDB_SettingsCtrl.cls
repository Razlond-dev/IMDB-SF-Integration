public with sharing class IMDB_SettingsCtrl {
    @AuraEnabled
    public static IMDB_Settings__c getDefaultIMDBSettings() {
        return IMDB_Settings__c.getOrgDefaults();
    }
}

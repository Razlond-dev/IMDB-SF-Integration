trigger IMDB_MovieTrigger on IMDB_Movie__c (before insert, before update) {
    if (Trigger.isInsert) {
        IMDB_MovieTriggerHandler.onBeforeInsert(Trigger.new);
    }
    if (Trigger.isUpdate) {
        IMDB_MovieTriggerHandler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
    }
}
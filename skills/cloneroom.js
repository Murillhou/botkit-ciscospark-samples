//
// Command: cloneroom
//
const CiscoSpark = require('node-ciscospark'),
    async = require('async');

const spark = new CiscoSpark(process.env.SPARK_TOKEN);

module.exports = function (controller) {

    controller.hears(["clone", "clone room", "clonar", "clonar sala"], 'direct_message,direct_mention', function (bot, message) {
        let email = message.user;
        bot.startConversation(message, function (err, convo) {
            var question = "What name do you want for the new room?";
            convo.ask(question, [
                {
                    default: true,
                    callback: function (response, convo) {
                        var membershipParameters = {"roomId": message.channel };
                        var roomName = response.text;
                        convo.say("Creating room " + "**"+response.text +"**...");
                        async.waterfall([
                            function (callback){
                                spark.rooms.create({"title": roomName}, function(err, response) {
                                    if(err){
                                        convo.say("I am sorry, there was an error creating the room, Please contact administrator.");
                                        convo.next(); 
                                    }else{
                                        var responseObj = JSON.parse(response);
                                        callback(null, responseObj.id);
                                    }
                                });
                            },
                            function (roomId, callback){
                                spark.memberships.list(membershipParameters, function(err, response) {
                                    if(err){
                                        convo.say("I am sorry, there was an error creating the room, Please contact administrator.");
                                        convo.next();
                                    }else{
                                        callback(null, response, roomId);
                                    }
                                });
                            },
                            function (response, roomId, callback){
                                var responseObj = JSON.parse(response);
                                if(responseObj.items.length > 0){
                                    responseObj.items.forEach(function(element) {
                                    var param = {"teamId": roomId, "roomId" : roomId, "personEmail" : element.personEmail, "isModerator" : element.isModerator };
                                    spark.memberships.create(param, function(err, response){
                                        console.log(err);   });
                                    });
                                    convo.say("I have created the room. You can check it now.");
                                    convo.next();
                                }else{
                                    convo.say("I am sorry, there was an error creating the room, Please contact administrator.");
                                    convo.next();
                                }
                            }
                        ]);
                    }
                }
            ]);
        });
    });
};
        

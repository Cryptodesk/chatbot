let dotenv = require('dotenv');
let botkit = require('botkit');
let commandLineArgs = require('command-line-args');
let localtunnel = require('localtunnel');

dotenv.config();

const CONVERSATION_STATUS_HELLO = 1;
const CONVERSATION_STATUS_OFERTAS = 2;
const CONVERSATION_STATUS_DIRECCION = 3;
const CONVERSATION_STATUS_PAGO = 4;
const CONVERSATION_STATUS_FEEDBACK = 5;
const CONVERSATION_STATUS_USUAL_USER = 6;
const CONVERSATION_STATUS_CRYPTO = 7;
const CONVERSATION_STATUS_INIT = 8;

let typing_on = {

    sender_action: "typing_on"
}

let typing_off = {

    sender_action: "typing_off"
}

let conversations = {};

const ops = commandLineArgs([
      {
          alias: 'l',
          name: 'lt',
          args: 1,
          description: 'Use localtunnel.me to make your bot available on the web.',
          type: Boolean,
          defaultValue: false
      },
      {
          name: 'ltsubdomain',
          alias: 's',
          args: 1,
          description: 'Custom subdomain for the localtunnel.me URL. This option can only be used together with --lt.',
          type: String,
          defaultValue: null
      },
]);

let controller = botkit.facebookbot({
    debug: false,
    log: true,
    access_token: process.env.FACEBOOK_PAGE_TOKEN,
    verify_token: process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    validate_requests: true,
    receive_via_postback: true,
    require_delivery: true,  // aixo ho he ficat despres!!
});

let bot = controller.spawn({});

controller.setupWebserver(process.env.port || 3000, (err,webserver) => {
    controller.createWebhookEndpoints(controller.webserver, bot, () => {
        if(ops.lt) {
            var tunnel = localtunnel(process.env.port || 3000, {subdomain: ops.ltsubdomain}, function(err, tunnel) {
                if (err) {
                    console.log(err);
                    process.exit();
                }
                console.log('Your bot is available on the web at the following URL: ' + tunnel.url + '/facebook/receive');
            });

            tunnel.on('close', function() {
                console.log('Your bot is no longer available on the web at the localtunnnel.me URL.');
                process.exit();
            });
        }
    });
});
















let flag= true ;
controller.on('message_received', (bot, message) => {
    if(flag){
        flag = false ;
        //bot.reply(message,typing_on);
        bot.startConversation(message, (err, convo) => {
            convo.say('Hey! I am Deskie your cryptotrading assistant:)');
            //bot.reply(message2,typing_on);
            convo.say({
                attachment: {
                    'type':'template',
                    'payload':{
                        'template_type':'button',
                        'text':'Do you know how can I help you?',
                        'buttons':[
                            {
                                'type':'postback',
                                'title':'Yes!',
                                'payload':'yes!'
                            },
                            {
                                'type':'postback',
                                'title':'Know more',
                                'payload':'no'
                            }
                        ]
                    }
                }
            });
        });
        //bot.reply(message,typing_off);
        conversations[message.channel] = {
            status: CONVERSATION_STATUS_HELLO,
            coordinates: undefined,
            items: []
        };
    }
}); 






controller.hears(['yes!', 'si', 'yes'], 'message_received', (bot, message) => {
    if(conversations[message.channel] && conversations[message.channel].status === CONVERSATION_STATUS_HELLO){
        bot.startConversation(message, (err, convo) => {
            

            convo.say('Cool! Say me what do you need');
            conversations[message.channel].status = CONVERSATION_STATUS_USUAL_USER;
            
        });
    }
});






controller.hears(['n', 'no'], 'message_received', (bot, message) => {
    if(conversations[message.channel] && conversations[message.channel].status === CONVERSATION_STATUS_HELLO){
        bot.startConversation(message, (err, convo) => {
            convo.say({
                attachment: {
                    'type':'template',
                    'payload':{
                        'template_type':'button',
                        'text':'I can help you with any of this topics:',
                        'buttons':[
                            {
                                'type':'postback',
                                'title':'Summary',
                                'payload':'summary'
                            },
                            {
                                'type':'postback',
                                'title':'I want to buy/sell',
                                'payload':'trade'
                            },
                            {
                                'type':'postback',
                                'title':'See a crypto',
                                'payload':'crypto'
                            }/*,
                            {
                                'type':'postback',
                                'title':'Exit',
                                'payload':'bye'
                            } */
                        ]
                    }
                }
            });
            conversations[message.channel] = {
                status: CONVERSATION_STATUS_USUAL_USER,
                coordinates: undefined,
                items: []
            };
            
        });
    }
});






controller.hears(['crypto'], 'message_received', (bot, message) => {
    if(conversations[message.channel] && conversations[message.channel].status === CONVERSATION_STATUS_USUAL_USER){
        bot.startConversation(message, (err, convo) => {

            convo.say('What crypto do you want to see ?');
            
        });
        conversations[message.channel] = {
            status: CONVERSATION_STATUS_CRYPTO,
            coordinates: undefined,
            items: []
        };
        flag= true;
    }
});

/*


controller.hears(['trade','buy','sell'], 'message_received', (bot, message) => {
    if(conversations[message.channel] && conversations[message.channel].status === CONVERSATION_STATUS_USUAL_USER){
        bot.startConversation(message, (err, convo) => {
            convo.ask({
                  "message":{
                    "text":"Do you want to buy or sell?",
                    "quick_replies":[
                      {
                        "content_type":"text",
                        "title":"Buy",
                        "payload":"BUY",
                        "image_url":"http://bobmccarthy.com/wp-content/uploads/2013/03/buy-md.png"
                      },
                      {
                        "content_type":"text",
                        "title":"Sell",
                        "payload":"SELL",
                        "image_url":"http://www.grangerford.com/assets/misc/5897/155941.jpg"
                      }
                    ]
                  }
            }, (response, convo2) => {
                conversations[message.channel].items.push(response.text);
                conversations[message.channel].status = CONVERSATION_STATUS_OFERTAS;
                convo.next();
            });
        flag= true;
    }
});


*/






/*
controller.hears(['bye','exit','return','goodbye'], 'message_received', (bot, message) => {
    if(conversations[message.channel] && conversations[message.channel].status === CONVERSATION_STATUS_USUAL_USER){
        bot.startConversation(message, (err, convo) => {

            convo.say('Goodbye! For more help remember than I am here!');
            
        });
        conversations[message.channel] = {
            status: CONVERSATION_STATUS_INIT,
            coordinates: undefined,
            items: []
        };
        flag= true;
    }
});
*/




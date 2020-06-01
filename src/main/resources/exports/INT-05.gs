function runScript() {
  var sheet = SpreadsheetApp.getActiveSheet();

  console.log("started script " +new Date());
  var temp = getGmailData();
  temp.forEach(item => {
    var result = detectMessageIntent(item);
    sheet.appendRow([result.sessionid, result.intent, new Date()]);
    triggerProcess(item[0], item[1], result.intent);
   });
}

function getGmailData() {
  var regex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i;
  var sheet = SpreadsheetApp.getActiveSheet();
  var unreadThreads = GmailApp.search("in:inbox is:unread subject:(*Report Job Position*)");
 
  var resultSet = []
  
  if(unreadThreads.length > 0) {
    unreadThreads.forEach(threadItem => {
      threadItem.getMessages().forEach(msgItem => {
        var id = msgItem.getSubject().match(regex);
        resultSet.push([id.toString(), msgItem.getPlainBody()]);
        msgItem.markRead();
       });
    });
  }
  
  return resultSet;
}


function triggerProcess(businesskey, message, intend) {
  var data = {
    'messageName': 'Inbound_Message_RAV_Answer',
    'businessKey': businesskey,
    'processVariables': {
      'RAVAnswer': {'value': intend, 'type': 'String'},
      'RAVEmailAnswer': {'value': message, 'type': 'String'},
    }
  };
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  var url = 'https://teamgorgonzola.herokuapp.com/rest/message';
  console.log('url ', url);
  console.log('data ',data);
  console.log('options ',options);
  console.log(JSON.stringify(options));
  UrlFetchApp.fetch(url, options);
}

//https://mashe.hawksey.info/2018/10/introduction-to-building-conversational-interfaces-with-dialogflow-in-google-apps-script-powered-google-hangouts-chat-bots/
function detectMessageIntent(intentObject){
  //console.log("intentObject " +JSON.stringify(intentObject))
  // setting up calls to Dialogflow with Goa
  var goa = cGoa.GoaApp.createGoa ('dialogflow_serviceaccount',
                                   PropertiesService.getScriptProperties()).execute ();
  if (!goa.hasToken()) {
    throw 'something went wrong with goa - no token for calls';
  }
  // set our token 
  Dialogflow.setTokenService(function(){ return goa.getToken(); } );
   
  var requestResource = {
    "queryInput": {
      "text": {
        "text": intentObject[1].slice(0, 256),
        "languageCode": "en"
      }
    },
    "queryParams": {
      "timeZone": Session.getScriptTimeZone() // using script timezone but you may want to handle as a user setting
    }
  };
 
  var PROJECT_ID = 'ravbot2-rqaqgb'; // <- your Dialogflow proejct ID   
  var SESSION_ID = intentObject[0];
  var session = 'projects/'+PROJECT_ID+'/agent/sessions/'+SESSION_ID; // 
  var options = {};
  var intent = Dialogflow.projectsAgentSessionsDetectIntent(session, requestResource, options);
  
  var intentResult;
  if(intent.queryResult.parameters.suggestion === undefined){
    intentResult = "undefined";
  } else {
    intentResult = intent.queryResult.parameters.suggestion;
  }
      
  return {
    intent: intentResult,
    sessionid: SESSION_ID
  };
}

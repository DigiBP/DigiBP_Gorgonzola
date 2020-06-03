function onFormSubmit(event) { 
  var uuid = Utilities.getUuid();
  
  let row =  event.range.getRow();
  SpreadsheetApp.getActiveSheet().getRange(row, 8).setValue(uuid);
  
  console.log('onFormSubmit fired: uuid ' +uuid);

  var url = 'https://teamgorgonzola.herokuapp.com/rest/process-definition/key/JobTitleNotificationProcess/start';
  
  var data = {
    "variables":{
       "jobTitle" : {
        "value" : event.namedValues['Job Position Name'][0],
        "type": "String"},
      "jobLocation" : {
        "value" : event.namedValues['Location'][0],
        "type": "String"},
      "jobRequirements" : {
        "value" : event.namedValues['Requirements'].toString().replace('\n', ''),
        "type": "String"},
      "jobContractType" : {
        "value" : event.namedValues['Contract Conditions'][0].toString(),
        "type": "String"},
      "jobExperienceLevel" : {
        "value" : event.namedValues['Experience Level'][0].toString(),
        "type": "String"},
      "jobEmploymentType" : {
        "value" : event.namedValues['Employment Type'][0].toString(),
        "type": "String"}
    },
    "businessKey" : uuid,
    'tenantId': null,
    "withVariablesInReturn": true
  }
  
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data)
  };
  console.log('send ', url ,'\n----\n', JSON.stringify(data),'\n----\n', JSON.stringify(options));
  UrlFetchApp.fetch(url, options);
}

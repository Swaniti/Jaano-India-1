// Example 1: sets up service wrapper, sends initial message, and 
// receives response.

var prompt = require('prompt-sync')();
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var papa = require('PapaParse/papaparse.js');
var fs = require('fs');
// Set up Assistant service wrapper.
var service = new AssistantV1({
  username: 'd3a44bff-a1ed-43e2-82fd-b1cb49840b20', // replace with service username
  password: '2C5IrTSeTxlI', // replace with service password
  version: '2018-02-16'
});

var workspace_id = '5c7a0384-503c-4fe9-8707-0e60b3f98478'; // replace with workspace ID

var file = fs.readFileSync(__dirname+'/hackathon+data+set.csv','utf8');
var csv = papa.parse(file, {header:true,delimiter:",",});
//console.log(csv);
// Start conversation with empty message.
service.message({
  workspace_id: workspace_id
  }, processResponse);
// Process the service response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  		//csv = papa.parse(file,{header:true});
  
  		var intent='irrelevant',state=[],district=[],field=[],area='state',type='Total';

  		//printing the json response
  		console.log('JSON response : ');
  		//populating the above variables
  		if(response.intents.length>0)
  		{
  			intent=response.intents[0].intent;
  			console.log("#" + response.intents[0].intent);
  		}
  		else
  			console.log("#" + intent);
  		if(response.entities.length>0)
  		{
  			for(var i=0;i<response.entities.length;i++)
  			{
  				//printing all the entities
  				console.log("@"+response.entities[i].entity+':'+response.entities[i].value);	  

  				if(response.entities[i].entity=='STATE')
  					state.push(response.entities[i].value);
  				else if(response.entities[i].entity=='DISTRICT')
  					district.push(response.entities[i].value);
  				else if(response.entities[i].entity=='FIELD')
  					field.push(response.entities[i].value);
  				else if(response.entities[i].entity=='area')
  					area = response.entities[i].value;
  				else
  					type = response.entities[i].value; 				
  			}  			
  		} 		

  		var output = '';
  		//constructing the dialogue
  		switch(intent)
  		{
  			case 'welcome':{
  				console.log('welcome to jaano india. Ask me anything about indian public data');
  				break;
  			};
  			case 'show':
  			case 'average':
  			case 'irrelevant':{  				 				
  				if(district.length>0)
  				{
  					//print field value in district.type 
  					
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
  							output = type + ' ' + field[0] + ' in ' + district[0] + ' : ' + csv.data[i][field[0]];
  				}
  				else if(state.length>0 && area == 'district')
  				{
  					//print individual fvalue of all district.type of state along with total sum
  					var sum=0.0;
  					output=type+' '+field[0] + ' in : \n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  						{
  							sum+=parseFloat(csv.data[i][field[0]]);
  							output+=csv.data[i]['District']+' : '+ csv.data[i][field[0]]+'\n';
  						}
  					output += type+' '+field[0]+' in '+state[0]+' : '+sum;
  				}  				
  				else if(state.length>0)
  				{
  					//print sum of all district.type fvalues of that state 
  					var sum=0.0;
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  							sum+=parseFloat(csv.data[i][field[0]]);
  						if(type != 'Total')  						
  						output=type+' ';
  					output += field[0]+' in '+state[0]+' : '+sum; 					
  				}
  				
  				else
  				{
  					//print fvalue of all state.districts.type in csv
  				}
  				break;
  			};
  			case 'total':{
  				if(district.length>0)
  				{
  					//print fvalue of district.type
  				}
  				else if(state.length>0)
  				{
  					//print sum of fvalues of all districts.type of that state
  				}
  				else 
  				{
  					//sum of fvalues of all available districts.type
  				}
  				break;
  			};
  			case 'maximum':{
  				if(area=='district'&&state.length>0)
  				{
  					//highest fvalue among all ditricts.type of that state
  				}
  				else if(area=='district')
  				{
  					//highest fvalue among all districts of india
  				}
  				else if(area=='state')
  				{
  					//highest fvalue among all state.type
  				}
  				break;
  			};
  			case 'minimum':{
  				if(area=='district'&&state.length>0)
  				{
  					//lowest fvalue among all ditricts.type of that state
  				}
  				else if(area=='district')
  				{
  					//lowest fvalue among all districts of india
  				}
  				else if(area=='state')
  				{
  					//lowest fvalue among all state.type
  				}
  				break;
  			};
  			case 'greaterthan':{
  				if(area =='district' && district.length!=0 && field.length == 1)
  				{
  					// print all ditricts names whose f.value > district.fvalue
  					// ex - districts where total poulation > that of jaipur
  				}
  				else if(area == 'district' && state.length>0)
  				{
  					// print all district names of that state where fvalue1 > fvalue2
  				}
  				else if(area =='district')
  				{
  					//print all district.type of India where fvalue1 > fvalue2
  				}
  				else if(area =='state')
  				{
  					// print all state names of India where total fvalue1 > fvalue2
  				}
  				else
  				break;
  			};
  			case 'lessthan':{
  				if(area =='district' && district.length!=0 && field.length == 1)
  				{
  					// print all ditricts names whose f.value < district.fvalue
  					// ex - districts where total poulation < that of jaipur
  				}
  				else if(area == 'district' && state.length>0)
  				{
  					// print all district names of that state where fvalue1 < fvalue2
  				}
  				else if(area =='district')
  				{
  					//print all district.type of India where fvalue1 < fvalue2
  				}
  				else if(area =='state')
  				{
  					// print all state names of India where total fvalue1 < fvalue2
  				}
  				else
  				break;
  			};
  			case 'capability':{
  				console.log(response.output.text[0]); 
  				break;
  			};
  			case 'bye':break; 
	  
	  }
	 console.log('\noutput message : ');
	 console.log(output);
	  
  if(response.intents.length>0&&response.intents[0].intent=="bye")
  {
	  
  }
  else
  {	  
	  //prompt user for new message
	  var newMessageFromUser = prompt('>> ');
	  service.message({ workspace_id: workspace_id, input: { text: newMessageFromUser },context:response.context,}, processResponse)
  }
}
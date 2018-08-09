// Example 1: sets up service wrapper, sends initial message, and 
// receives response.

var prompt = require('prompt-sync')();
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var papa = require('PapaParse/papaparse.js');
var fs = require('fs');
var express = require('express');

// Set up Assistant service wrapper.
var service = new AssistantV1({
  username: 'd3a44bff-a1ed-43e2-82fd-b1cb49840b20', // replace with service username
  password: '2C5IrTSeTxlI', // replace with service password
  version: '2018-02-16'
});

var workspace_id = '5c7a0384-503c-4fe9-8707-0e60b3f98478'; // replace with workspace ID

var file = fs.readFileSync(__dirname+'/hackathon+data+set.csv','utf8');
var csv = papa.parse(file, {header:true,delimiter:",",});
var output = '';

function extractNumber(str){
	var num = str.match(/\d/g);
	num=num.join("");
	var n=0.0;
	if(!num=="")
		n=parseInt(num);
	return n;
}

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

  		output = '';
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
  				
  				else if(field.length>0)
  				{
  					//print fvalue of all state.districts.type in csv
  					var sum=0.0,subsum =0.0;
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '\n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
  							subsum+=parseFloat(csv.data[i][field[0]]);
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{  
  							output+=st+' : '+ subsum+'\n';
  							st = csv.data[i]['State'];
  							sum+=subsum;
  							subsum=0.0;
  						}
  						
  					output += '\n' + type+' '+field[0]+' in india : '+sum;
  				}
  				else
  				{
  					output = 'Sorry, I did not get it! :(\nCheck for spelling and gramatic errors\nIf the problem still persists please contact us.';
  				}
  				break;
  			};
  			case 'total':{
  				if(district.length>0)
  				{
  					//print fvalue of district.type  					
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
  							output = type + ' ' + field[0] + ' in ' + district[0] + ' : ' + csv.data[i][field[0]];
  				}
  				else if(state.length>0)
  				{
  					//print sum of fvalues of all districts.type of that state
  					var sum=0.0;
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  							sum+=parseFloat(csv.data[i][field[0]]);
  						if(type != 'Total')  						
  						output=type+' ';
  					output += field[0]+' in '+state[0]+' : '+sum; 	
  				}
  				else  if(field.length>0)
  				{
  					//sum of fvalues of all available districts.type
  					//print fvalue of all state.districts.type in csv
  					var sum=0.0,subsum =0.0;
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '\n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
  							subsum+=parseFloat(csv.data[i][field[0]]);
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{  
  							output+=st+' : '+ subsum+'\n';
  							st = csv.data[i]['State'];
  							sum+=subsum;
  							subsum=0.0;
  						}
  						
  					output += '\n' + type+' '+field[0]+' in india : '+sum;

  				}
  				break; 
  			};
  			case 'maximum':{
  				if(area=='district'&&state.length>0)
  				{
  					//highest fvalue among all ditricts.type of that state
  					var max=0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  						{
  							max=Math.max(max,parseFloat(csv.data[i][field[0]]));
  							dist=csv.data[i]['District'];
  						}
  					//ouptut=;
  					//if(type != 'Total')  						
  					//	output=output+type+' ';
  					output ='District with highest ' + field[0]+' in '+state[0]+' : '+dist + ' ('+max+')'; 
  				}
  				else if(area=='district')
  				{
  					//highest fvalue among all districts of india
  					var max=0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && csv.data[i][field[0]]>max)
  						{
  							max=parseFloat(csv.data[i][field[0]]);
  							dist=csv.data[i]['District'];
  						}
  					output='District with highest'+field[0]+ ' : '+dist + ' ('+max+')';
  				}
  				else if(area=='state')
  				{
  					//highest fvalue among all state.type
  					var max=0.0,subsum =0.0,maxst='';
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '\n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
  							subsum+=parseFloat(csv.data[i][field[0]]);
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    						
  							if(subsum>max)
  							{
  								max=subsum;
  								maxst=st;
  							}	
  							st = csv.data[i]['State'];							 							
  							subsum=0.0;
  						}
  						
  					output = 'State with highest '+field[0]+' : '+maxst+' ('+max+')';
  				}
  				break;
  			};
  			case 'minimum':{
  				if(area=='district'&&state.length>0)
  				{
  					//lowest fvalue among all ditricts.type of that state
  					var min=9999999999.0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  						{
  							min=Math.min(min,parseFloat(csv.data[i][field[0]]));
  							dist=csv.data[i]['District'];
  						}
  					//ouptut=;
  					//if(type != 'Total')  						
  					//	output=output+type+' ';
  					output ='District with lowest ' + field[0]+' in '+state[0]+' : '+dist + ' ('+min+')'; 
  				}
  				else if(area=='district')
  				{
  					//lowest fvalue among all districts of india
  					var min=9999999999.0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && csv.data[i][field[0]]<min)
  						{
  							min=parseFloat(csv.data[i][field[0]]);
  							dist=csv.data[i]['District'];
  						}
  					output='District with lowest'+field[0]+ ' : '+dist + ' ('+min+')';
  				}
  				else if(area=='state')
  				{
  					//lowest fvalue among all state.type
  					var max=9999999999.0,subsum =0.0,maxst='';
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '\n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
  							subsum+=parseFloat(csv.data[i][field[0]]);
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    						
  							if(subsum<max)
  							{
  								max=subsum;
  								maxst=st;
  							}	
  							st = csv.data[i]['State'];							 							
  							subsum=0.0;
  						}
  						
  					output = 'State with lowest '+field[0]+' : '+maxst+' ('+max+')';
  				}
  				break;
  			};
  			case 'greaterthan':{
  				if(area =='district' && district.length!=0 && field.length == 1)
  				{
  					// print all ditricts names whose f.value > district.fvalue
  					// ex - districts where total poulation > that of jaipur

  					//first extracting district.fvalue
  					var dfval = 0.0;
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
  							dfval = parseFloat(csv.data[i][field[0]]);

  					//comparing each district.type fvalue with dfvalue
  					output='Districts with '+field[0]+' greater than that of '+district[0]+' : \n';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{
  							var fval = parseFloat(csv.data[i][field[0]]);
  							if(fval>dfval)
  								output+=csv.data[i]['District']+'\n';
  						} 
  				}
  				else if(area == 'district' && state.length>0)
  				{
  					// print all district names of that state where fvalue1 > fvalue2
  					console.log('reached');
  					output = 'Districts in '+ state[0] +' where '+field[0]+' is greater than '+field[1]+' : \n';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])>parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'\n'; 
  				}
  				else if(area =='district')
  				{
  					//print all district.type of India where fvalue1 > fvalue2  					
  					output = 'Districts where '+field[0]+' is greater than '+field[1]+' : \n';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])>parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'\n'; 
  				}
  				else if(area =='state')
  				{
  					// print all state names of India where total fvalue1 > fvalue2
  					var fv1 =0.0,fv2=0.0,maxst='';
  					var st = csv.data[0]['State'];
  					output = 'State with '+field[0]+' greater than '+field[1]+' : \n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{    																			
  							fv1+=parseFloat(csv.data[i][field[0]]);
  							fv2+=parseFloat(csv.data[i][field[1]]);
  						}
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    						
  							if(fv1>fv2)
  								output+=st+'\n';
  							st = csv.data[i]['State'];							 							
  							fv1=0.0;
  							fv2=0.0;
  						} 					
  				}
  				else
  				break;
  			};
  			case 'lessthan':{
  				if(area =='district' && district.length!=0 && field.length == 1)
  				{
  					// print all ditricts names whose f.value < district.fvalue
  					// ex - districts where total poulation < that of jaipur

  					//first extracting district.fvalue
  					var dfval = 0.0;
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
  							dfval = parseFloat(csv.data[i][field[0]]);

  					//comparing each district.type fvalue with dfvalue
  					output='Districts with '+field[0]+' less than that of '+district[0]+' : \n';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{
  							var fval = parseFloat(csv.data[i][field[0]]);
  							if(fval<dfval)
  								output+=csv.data[i]['District']+'\n';
  						} 
  				}
  				else if(area == 'district' && state.length>0)
  				{
  					// print all district names of that state where fvalue1 < fvalue2
  				}
  				else if(area =='district')
  				{
  					//print all district.type of India where fvalue1 < fvalue2
  					output = 'Districts where '+field[0]+' is greater than '+field[1]+' : \n';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])<parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'\n'; 
  				}
  				else if(area =='state')
  				{
  					// print all state names of India where total fvalue1 < fvalue2
  					var fv1 =0.0,fv2=0.0,maxst='';
  					var st = csv.data[0]['State'];
  					output = 'State with '+field[0]+' greater than '+field[1]+' : \n';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{    																			
  							fv1+=parseFloat(csv.data[i][field[0]]);
  							fv2+=parseFloat(csv.data[i][field[1]]);
  						}
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{
  							if(fv1<fv2)
  								output+=st+'\n';
  							st = csv.data[i]['State'];					 							
  							fv1=0.0;
  							fv2=0.0;
  						}
  				}
  				else
  				break;
  			};
  			case 'capability':{
  				console.log('you can ask me general public statistical data.\nsome examples could be : \n');
  				console.log('Total population of rajasthan\nstates where literates are more than illiterates'); 
  				break;
  			};
  			case 'bye':{
  				console.log('Goodbye, have a nice day :)');
  				break; 
	  		};
	  }
	 console.log('\noutput message : ');
	 console.log(output);
	 //exports.output = output;
	  
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
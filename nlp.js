// Example 1: sets up service wrapper, sends initial message, and 
// receives response.

var prompt = require('prompt-sync')();
var AssistantV1 = require('watson-developer-cloud/assistant/v1');
var papa = require('papaparse');
var fs = require('fs');
var sleep = require('system-sleep');

var output='';
var newMessageFromUser = '';
// Set up Assistant service wrapper.
var service = new AssistantV1({
  username: 'd3a44bff-a1ed-43e2-82fd-b1cb49840b20', // replace with service username
  password: '2C5IrTSeTxlI', // replace with service password
  version: '2018-02-16'
});
var workspace_id = '5c7a0384-503c-4fe9-8707-0e60b3f98478'; // replace with workspace ID

function extractNumber(str){
  var num = str.match(/\d/g);
  var n=0.0;
  if(num)
  {
    num=num.join("");
    n=parseInt(num);
  } 
  return n;
}

function isPercent(str){
  if(str.match('%') || str.match('1000'))
    return true;
  else 
    return false;
}

// Process the service response.
function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }           
      output='';
      var file = fs.readFileSync(__dirname+'/hackathon+data+set.csv','utf8');
      var csv = papa.parse(file, {header:true,delimiter:",",});

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
  							output = type + ' ' + field[0] + ' in ' + district[0] + ' : <b>' + csv.data[i][field[0]]+'</b>';
  				}
  				else if(state.length>0 && area == 'district')
  				{
  					//print individual fvalue of all district.type of state along with total sum
  					var sum=0.0;
  					output=type+' '+field[0] + ' in : <br>';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type)
  						{
  							sum+=parseFloat(csv.data[i][field[0]]);
  							output+=csv.data[i]['District']+' : <b>'+ csv.data[i][field[0]]+'</b><br>';
  						}
  					output += type+' '+field[0]+' in '+state[0]+' : <b>'+sum+'</b>';
  				}  				
  				else if(state.length>0)
  				{
  					//print sum of all district.type fvalues of that state 
  					var sum=0.0;
            var count=0;
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type && parseInt(csv.data[i][field[0]])>0)
  							{
                  sum+=parseFloat(csv.data[i][field[0]]);
                  ++count;
                }
  						if(type != 'Total')  						
  						output=type+' ';
            if(isPercent(field[0]))
              sum/=count;
  					output += field[0]+' in '+state[0]+' : <b>'+sum+'</b>'; 					
  				}
  				
  				else if(field.length>0)
  				{
  					//print fvalue of all state.districts.type in csv
  					var sum=0.0,subsum =0.0;
  					var st = csv.data[0]['State'];
            var dcount=0,scount=0;
  					output=type+' '+field[0] + '<br>';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && parseFloat(csv.data[i][field[0]])>0)    																			
  							{
                  subsum+=parseFloat(csv.data[i][field[0]]);
                  ++dcount;
                }
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{  
                if(isPercent(field[0]))
                  subsum/=dcount;
  							output+=st+' : <b>'+ subsum.toFixed(2)+'</b><br>';
  							st = csv.data[i]['State'];
                if(subsum>0)
  							sum+=subsum;
                ++scount;
  							subsum=0.0;
                dcount=0;
  						}
  					 
              if(isPercent(field[0]))
                sum/=scount;
  					output += '<br>' + type+' '+field[0]+' in india : <b>'+sum.toFixed(2)+'</b>';
  				}
  				else
  				{
  					output = 'Sorry, I did not get it! :(<br>Check for spelling and gramatic errors<br>If the problem still persists please contact us.';
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
  					//print sum of all district.type fvalues of that state 
            var sum=0.0;
            var count=0;
            for(var i=0;i<csv.data.length;++i)            
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type && parseInt(csv.data[i][field[0]])>0)
                {
                  sum+=parseFloat(csv.data[i][field[0]]);
                  ++count;
                }
              if(type != 'Total')             
              output=type+' ';
            if(isPercent(field[0]))
              sum/=count;
            output += field[0]+' in '+state[0]+' : '+sum; 
  				}
  				else  if(field.length>0)
  				{
  					//sum of fvalues of all available districts.type
  					//print fvalue of all state.districts.type in csv
  					var sum=0.0,subsum =0.0;
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '<br>';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
  							subsum+=parseFloat(csv.data[i][field[0]]);
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{  
  							output+=st+' : '+ subsum+'<br>';
  							st = csv.data[i]['State'];
  							sum+=subsum;
  							subsum=0.0;
  						}
  						
  					output += '<br>' + type+' '+field[0]+' in india : '+sum;
  				}
  				break; 
  			};
  			case 'maximum':{
			  var c = parseFloat(extractNumber(newMessageFromUser));
			  if(c>0 && area=='district'  && state.length>0)
			  {
				var dist = [];
				for(var i=0; i<csv.data.length; i++){
				  if(csv.data[i]['State']==state[0] && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
					dist[csv.data[i]['District']] = parseFloat(csv.data[i][field[0]]);
				}
				var items = Object.keys(dist).map(function(key){
				  return [key, dist[key]];
				});
				items.sort(function(first, second){
				  return second[1] - first[1];
				});
				output = 'top '+ c+ ' districts with '+ field[0]+' in '+state[0] + '<br>';
				for(var i=0; i<c; i++){
				  output += items[i][0] + ' (' + items[i][1] + ' ) <br>';
				}
			  }
			  else if(c>0 && area=='district')
			  {
				var dist = [];
				for(var i=0; i<csv.data.length; i++){
				  if(csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
					dist[csv.data[i]['District']] = parseFloat(csv.data[i][field[0]]);
				}
				var items = Object.keys(dist).map(function(key){
				  return [key, dist[key]];
				});
				items.sort(function(first, second){
				  return second[1] - first[1];
				});
				output = 'top '+ c+ ' districts with '+ field[0]+'<br>';
				for(var i=0; i<c; i++){
				  output += items[i][0] + ' (' + items[i][1] + ' ) <br>';
				}
			  }
			  else if(c>0 && area=='state')
			  {            
				var dist = [];
				var sum=0.0,count=0;
				var st=csv.data[0]['State'];
				for(var i=0; i<csv.data.length; i++){
				  if(csv.data[i]['State']==st && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
				  {
					  sum+=parseFloat(csv.data[i][field[0]]);
					  count++;
				  }
				  else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
				  {
					if(isPercent(field[0]))
						sum/=count;
					dist[st] = sum;
					sum=0;
					count=0;
					st = csv.data[i]['State'];
				  }
				}
				var items = Object.keys(dist).map(function(key){
				  return [key, dist[key]];
				});
				items.sort(function(first, second){
				  return second[1] - first[1];
				});
				output = 'top '+ c+ ' states with highest '+ field[0]+'<br>';
				for(var i=0; i<c; i++){
				  output += items[i][0] + ' (' + items[i][1].toFixed(2) + ' ) <br>';
				}
			  }
  				else if(area=='district'&&state.length>0)
  				{					
  					//highest fvalue among all ditricts.type of that state
  					var max=0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type && parseInt(csv.data[i][field[0]])>0)
  						{
  							max=Math.max(max,parseFloat(csv.data[i][field[0]]));
  							dist=csv.data[i]['District'];
  						}
  					//ouptut=;
  					//if(type != 'Total')  						
  					//	output=output+type+' ';
  					output ='District with highest ' + field[0]+' in '+state[0]+' : <b>'+dist + ' ('+max+')</b>'; 
  				}
  				else if(area=='district')
  				{					
  					//highest fvalue among all districts of india
  					var max=0;var dist='';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && parseInt(csv.data[i][field[0]])>0 && csv.data[i][field[0]]>max)
  						{
  							max=parseFloat(csv.data[i][field[0]]);
  							dist=csv.data[i]['District'];
  						}
  					output='District with highest '+field[0]+ ' : <b>'+dist + ' ('+max+')</b>';
  				}
  				else if(area=='state')
  				{					
  					//highest fvalue among all state.type
  					var max=0.0,subsum =0.0,count=0,maxst='';
  					var st = csv.data[0]['State'];
  					//output=type+' '+field[0] + '<br>';
				
  					for(var i=0;i<csv.data.length;++i)  	
					{
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
						{
							subsum += parseFloat(csv.data[i][field[0]]);
							++count;
						}
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    	
							console.log(subsum + ' ' + count);	
							if(isPercent(field[0]) && count>0)
								subsum/=count;
  							if(subsum>max)
  							{								
  								max=subsum;
  								maxst=st;
  							}	
  							st = csv.data[i]['State'];							 							
  							subsum=0.0;
							count=0;
  						}
					}
  					console.log('entered');
  					output = 'State with highest '+field[0]+' : <b>'+maxst+' ('+max.toFixed(2)+')</b>';
  				}
  				break;
  			};
  			case 'minimum':{
          var c = parseFloat(extractNumber(newMessageFromUser));
          if(c>0 && area=='district' && state.length>0)
          {            
            var dist = [];
            for(var i=0; i<csv.data.length; i++){
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                dist[csv.data[i]['District']] = parseFloat(csv.data[i][field[0]]);
            }
            var items = Object.keys(dist).map(function(key){
              return [key, dist[key]];
            });
            items.sort(function(first, second){
              return first[1] - second[1];
            });
            output = c+ ' districts with lowest '+ field[0]+' in '+state[0] + '<br>';
            for(var i=0; i<c; i++){
              output += items[i][0] + ' (' + items[i][1] + ' ) <br>';
            }
          } 
          else if(c>0 && area=='district')
          {            
            var dist = [];
            for(var i=0; i<csv.data.length; i++){
              if(csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                dist[csv.data[i]['District']] = parseFloat(csv.data[i][field[0]]);
            }
            var items = Object.keys(dist).map(function(key){
              return [key, dist[key]];
            });
            items.sort(function(first, second){
              return first[1] - second[1];
            });
            output = c+ ' districts with least '+ field[0]+'<br>';
            for(var i=0; i<c; i++){
              output += items[i][0] + ' (' + items[i][1] + ' ) <br>';
            }
          } 
          else if(c>0 && area == 'state')
          {            
            var dist = [];
            var sum=0.0,count=0;
            var st=csv.data[0]['State'];
            for(var i=0; i<csv.data.length; i++){
              if(csv.data[i]['State']==st && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
			  {
				  count++;
				  sum+=parseFloat(csv.data[i][field[0]]);
			  }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {
				  if(isPercent(field[0]) && count>0)
                dist[st] = sum;
                sum=0;
				count=0;
                st = csv.data[i]['State'];
              }
            }
            var items = Object.keys(dist).map(function(key){
              return [key, dist[key]];
            });
            items.sort(function(first, second){
              return first[1] - second[1];
            });
            output = c+ ' states with lowest '+ field[0]+'<br>';
            for(var i=0; i<c; i++){
              output += items[i][0] + ' (' + items[i][1] + ' ) <br>';
            }
          }        
  				else if(area=='district'&&state.length>0)
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
  					var max=9999999999.0,subsum =0.0,count=0,maxst='';
  					var st = csv.data[0]['State'];
  					output=type+' '+field[0] + '<br>';
  					for(var i=0;i<csv.data.length;++i)  					
  						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')    																			
						{
							++count;
							subsum+=parseFloat(csv.data[i][field[0]]);
						}
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    		
							if(isPercent(field[0]) && count>0)
								subsum/=count;
  							if(subsum<max)
  							{
  								max=subsum;
  								maxst=st;
  							}	
  							st = csv.data[i]['State'];							 							
  							subsum=0.0;
							count=0;
  						}
  						
  					output = 'State with lowest '+field[0]+' : <b>'+maxst+' ('+max+')</b>';
  				}
  				break;
  			};
			case 'greaterthan':{
				var c = parseFloat(extractNumber(newMessageFromUser));
				console.log(5);
          if(c>0 && area=='district' && state.length>0)
          {
            console.log('const : '+c);
            // print all district names of that state where fvalue1 > c        
            output = 'Districts in '+ state[0] +' where '+field[0]+' is greater than '+c+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                if(parseFloat(csv.data[i][field[0]])>c)
                  output+=csv.data[i]['District']+'<br>'; 
          }
          else if(c>0 && area=='district')
          {
            // print all district names where fvalue1 > c        
            output = 'Districts in '+ state[0] +' where '+field[0]+' is greater than '+c+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                if(parseFloat(csv.data[i][field[0]])>c)
                  output+=csv.data[i]['District']+'<br>'; 
          }
          else if(c>0 && area=='state')
          {           
			//print all states where fvalue > c
            var sum=0.0,count=0;
            var st=csv.data[0]['State'];
            output = 'States with ' + field[0] + ' greater than ' + c + ' : <br>';
            for(var i=0; i<csv.data.length; i++){
              if(csv.data[i]['State']==st && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
			  {
				  count++;
				  sum+=parseFloat(csv.data[i][field[0]]);
			  }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {
				  if(isPercent(field[0]) && count>0)
								sum/=count;
                if(sum>c)
                  output += st+' ('+sum.toFixed(2)+') <br>';
                sum=0;
				count=0;
                st = csv.data[i]['State'];
              }
            }            
          }
  				else if(area =='district' && district.length!=0 && field.length == 1)
  				{
  					// print all ditricts names whose f.value > district.fvalue
  					// ex - districts where total poulation > that of jaipur

  					//first extracting district.fvalue
  					var dfval = 0.0;
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
  							dfval = parseFloat(csv.data[i][field[0]]);

  					//comparing each district.type fvalue with dfvalue
  					output='Districts with '+field[0]+' greater than that of '+district[0]+' : <br>';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{
  							var fval = parseFloat(csv.data[i][field[0]]);
  							if(fval>dfval)
  								output+=csv.data[i]['District']+'<br>';
  						} 
  				}
          else if(area=='state' && state.length!=0 && field.length == 1)
          {
            //print all state names whose f.value > state.fvalue

            //first extracting  state.fvalue
            var sfval = 0.0,dcount=0;
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
			  {
				  sfval += parseFloat(csv.data[i][field[0]]);
				  dcount++;
			  }
			  if(isPercent(field[0]) && dcount>0)
				  sfval/=dcount;
        
            //comparing each state.type fvalue with sfvalue
            output='States with '+field[0]+' greater than that of '+state[0]+' : <br>';
            var st='',fval=0.0;
			dcount=0;
            for(var i=0;i<csv.data.length;++i)          
            {  
              if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')                                          
			  {
				  fval+=parseFloat(csv.data[i][field[0]]);
				  ++dcount;
			  }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {               
				if(isPercent(field[0]) && dcount>0)
					fval/=dcount;
                if(fval>sfval)
                  output += st + '<br>';
                st = csv.data[i]['State'];                            
                fval=0.0;
				dcount=0;
              }
            }
          }
  				else if(area == 'district' && state.length>0)
  				{
  					// print all district names of that state where fvalue1 > fvalue2  				
  					output = 'Districts in '+ state[0] +' where '+field[0]+' is greater than '+field[1]+' : <br>';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])>parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'<br>'; 
  				}
  				else if(area =='district')
  				{
  					//print all district.type of India where fvalue1 > fvalue2  					
  					output = 'Districts where '+field[0]+' is greater than '+field[1]+' : <br>';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])>parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'<br>'; 
  				}
  				else if(area =='state')
  				{
  					// print all state names of India where total fvalue1 > fvalue2
					console.log(state.length);
  					var fv1 =0.0,fv2=0.0,maxst='',count=0;
  					var st = csv.data[0]['State'];
  					output = 'State with '+field[0]+' greater than '+field[1]+' : <br>';
  					for(var i=0;i<csv.data.length;++i)  					
  					{	
						if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  						{    																			
  							fv1+=parseFloat(csv.data[i][field[0]]);
  							fv2+=parseFloat(csv.data[i][field[1]]);
							count++;
							
  						}
  						else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
  						{    	
							if(isPercent(field[0]) && count>0)
							{
								fv1/=count;
								fv2/=count;
							}
  							if(fv1>fv2)
  								output += st+'<br>';
  							st = csv.data[i]['State'];							 							
  							fv1=0.0;
  							fv2=0.0;
							count=0;
  						} 					
            }
  				}
				break;
			};
			case 'lessthan':{
				console.log('entered less than');
        var c = parseFloat(extractNumber(newMessageFromUser));
          if(c>0 && area=='district' && state.length>0)
          {            
            // print all district names of that state where fvalue1 > c        
            output = 'Districts in '+ state[0] +' where '+field[0]+' is less than '+c+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                if(parseFloat(csv.data[i][field[0]])<c)
                  output+=csv.data[i]['District']+'<br>'; 
          }
          else if(c>0 && area=='district')
          {            
            // print all district names where fvalue1 > c        
            output = 'Districts in '+ state[0] +' where '+field[0]+' is less than '+c+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                if(parseFloat(csv.data[i][field[0]])<c)
                  output+=csv.data[i]['District']+'<br>'; 
          }
          else if(c>0 && area=='state')
          {            
            var sum=0.0,count=0;
            var st=csv.data[0]['State'];
            output = 'States with ' + field[0] + ' less than ' + c + ' : <br>';
            for(var i=0; i<csv.data.length; i++){
              if(csv.data[i]['State']==st && csv.data[i]['Tier'] == type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
			  {
				  sum+=parseFloat(csv.data[i][field[0]]);
				  ++count;
			  }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {
				  if(isPercent(field[0]) && count>0)
					  sum/=count;
                if(sum<c)
                  output += st+' ('+sum.toFixed(2)+') <br>';
                sum=0;
				count=0;
                st = csv.data[i]['State'];
              }
            }
          }
          else if(area =='district' && district.length!=0 && field.length == 1)
          {
            // print all ditricts names whose f.value < district.fvalue
            // ex - districts where total poulation < that of jaipur

            //first extracting district.fvalue
            var dfval = 0.0;
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['District']==district[0] && csv.data[i]['Tier']==type)
                dfval = parseFloat(csv.data[i][field[0]]);

            //comparing each district.type fvalue with dfvalue
            output='Districts with '+field[0]+' less than that of '+district[0]+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
              {
                var fval = parseFloat(csv.data[i][field[0]]);
                if(fval<dfval)
                  output+=csv.data[i]['District']+'<br>';
              } 
          }
           else if(area=='state' && state.length!=0 && field.length == 1)
          {
            //print all state names whose f.value > state.fvalue

            //first extracting  state.fvalue
            var sfval = 0.0,count=0;
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
			  {
				  sfval += parseFloat(csv.data[i][field[0]]);
				  count++;
			  }
			if(isPercent(field[0]) && count>0)
				sfval/=count;
			count=0;
            //comparing each state.type fvalue with sfvalue
            output='States with '+field[0]+' less than that of '+state[0]+' : <br>';
            var st='',fval=0.0,count=0;
            for(var i=0;i<csv.data.length;++i)          
            {  
              if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')                                          
			  {
				  fval+=parseFloat(csv.data[i][field[0]]);
				  count++;
			  }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {               
				if(isPercent(field[0]) && count>0)
					fval/=count;
                if(fval<sfval)
                  output += st + '<br>';
                st = csv.data[i]['State'];                            
                fval=0.0;
				count=0;
              }
            }
          }
          else if(area == 'district' && state.length>0)
          {
            // print all district names of that state where fvalue1 < fvalue2  				
  					output = 'Districts in '+ state[0] +' where '+field[0]+' is less than '+field[1]+' : <br>';
  					for(var i=0;i<csv.data.length;++i)
  						if(csv.data[i]['State']==state[0] && csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
  							if(parseFloat(csv.data[i][field[0]])<parseFloat(csv.data[i][field[1]]))
  								output+=csv.data[i]['District']+'<br>'; 
          }
          else if(area =='district')
          {
            //print all district.type of India where fvalue1 < fvalue2
            output = 'Districts where '+field[0]+' is greater than '+field[1]+' : <br>';
            for(var i=0;i<csv.data.length;++i)
              if(csv.data[i]['Tier']==type  && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
                if(parseFloat(csv.data[i][field[0]])<parseFloat(csv.data[i][field[1]]))
                  output+=csv.data[i]['District']+'<br>'; 
          }
          else if(area =='state')
          {
            // print all state names of India where total fvalue1 < fvalue2
            var fv1 =0.0,fv2=0.0,maxst='',count=0;
            var st = csv.data[0]['State'];
            output = 'State with '+field[0]+' greater than '+field[1]+' : <br>';
            for(var i=0;i<csv.data.length;++i)            
              if(csv.data[i]['State']==st && csv.data[i]['Tier']==type && csv.data[i][field[0]]!='Not available' && csv.data[i][field[0]]!='NA')
              {                                         
                fv1+=parseFloat(csv.data[i][field[0]]);
                fv2+=parseFloat(csv.data[i][field[1]]);
				count++;
              }
              else if(csv.data[i]['State']!=st && csv.data[i]['Tier']==type)
              {
				  if(isPercent(field[0]) && count>0)
				  {
					fvl/=count;
					fv2/=count;
				  }
                if(fv1<fv2)
                  output+=st+'<br>';
                st = csv.data[i]['State'];                        
                fv1=0.0;
                fv2=0.0;
				count=0;
              }
          }
				break;
			};			
  			case 'capability':{
  				output = 'you can ask me general public statistical data.<br>some examples could be : <br>';
          output+='<br>Total population of rajasthan<br>states where literates are more than illiterates';  				
  				break;
  			};
  			case 'bye':{
  				output = 'Goodbye, have a nice day :)';
  				break; 
	  		};
	    }
	  
   console.log('<br>output message : ');
   console.log(output);
}

module.exports = {

    start: function(query){
      // Start conversation with input message.
      newMessageFromUser = query;
      service.message({ workspace_id: workspace_id, input: { text: query },}, processResponse);
      sleep(2500);
      return output;
    }

};

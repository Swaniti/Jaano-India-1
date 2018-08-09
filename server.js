var http = require('http');
var url = require('url');
var nlp = require('./nlp.js');
//var fs = require('fs');

console.log('server registered');
http.createServer(function (req, res) {
    res.writeHead(200, {
    	'Content-Type': 'text/html',
    	'Access-Control-Allow-Origin':'*',
    });
    console.log(req.url);
    var query =req.url.slice(7,req.url.length).replace(/%20/g,' ');

    var output = nlp.start(query);
    console.log('read by server : ' + query);
	res.write(output);
	res.end();	
}).listen(3000); 

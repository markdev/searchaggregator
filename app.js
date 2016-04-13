var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();

app.get('/', function (req, res) {

	var retObj = {results: []};
	var query = req.url.slice(3);
	console.log(query);

	request('https://www.google.com/search?q=' + query + '&rct=j', function (error, response, html) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				$('h3.r').each(function(i, element){
					var item = {}
					var a = $(this);
					item.title = a.text();
					item.engine = "Google";
					item.href = $(this).find('a').attr('href');
		      		retObj.results.push(item);
				});
			}

		  	request('https://www.bing.com/search?q=' + query, function (error, response, html) {
				if (!error && response.statusCode == 200) {
					var $ = cheerio.load(html);
					$('li.b_algo').each(function(i, element){
						var item = {}
						var a = $(this).find('a').text();
						item.title = a;
						item.engine = "Bing";
						item.href = $(this).find('a').attr('href');
			      		retObj.results.push(item);
					});
				  	request('https://search.yahoo.com/search;_ylc=X3oDMTFiN25laTRvBF9TAzIwMjM1MzgwNzUEaXRjAzEEc2VjA3NyY2hfcWEEc2xrA3NyY2h3ZWI-?p=' + query + '&fr=yfp-t-201&fp=1&toggle=1&cop=mss&ei=UTF-8', function (error, response, html) {
						if (!error && response.statusCode == 200) {
							var $ = cheerio.load(html);
							$('div.algo').each(function(i, element){
								var item = {}
								var a = $(this).find('h3 a');
								item.title = a.text();
								item.engine = "Yahoo";
								item.href = a.attr('href');
					      		retObj.results.push(item);
							});
							res.send(retObj);
						}
					});
				}
			});

		});
	
});

app.listen(1234, function () {
	console.log('Example app listening on port 1234');
});
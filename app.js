var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var engines = [
	{
		engine: "Google",
		queryString: "https://www.google.com/search?q=QUERYHERE&rct=j",
		searchElement: 'h3.r',
		title : function (obj) {
			return obj.text();
		},
		href: function (obj) {
			return obj.find('a').attr('href');
		}
	},
	{
		engine: "Bing",
		queryString:  "https://www.bing.com/search?q=QUERYHERE",
		searchElement: 'li.b_algo',
		title : function (obj) {
			return obj.find('a').text();
		},
		href: function (obj) {
			return obj.find('a').attr('href');
		}
	},
	{
		engine: "Yahoo",
		queryString: "https://search.yahoo.com/search;_ylc=X3oDMTFiN25laTRvBF9TAzIwMjM1MzgwNzUEaXRjAzEEc2VjA3NyY2hfcWEEc2xrA3NyY2h3ZWI-?p=QUERYHERE&fr=yfp-t-201&fp=1&toggle=1&cop=mss&ei=UTF-8",
		searchElement: 'div.algo',
		title : function (obj) {
			return obj.find('h3 a').text();
		},
		href: function (obj) {
			return obj.find('h3 a').attr('href');
		}			
	}
];

app.get('/', function (req, res) {

	var retJson = {results: []};
	var query = req.url.slice(3);

	console.log(query);

	var pullFromEngine = function (engData, i, json, q) {
		var e = engData[i];
		var queryString = e.queryString.replace("QUERYHERE", q);
		request(queryString, function (error, response, html) {
			if (!error && response.statusCode == 200) {
				var $ = cheerio.load(html);
				$(e.searchElement).each(function(i, element) {
					var item = {};
					item.engine = e.engine;
					item.title = e.title($(this));
					item.href = e.href($(this));
					json.results.push(item);
				});
				if (i >= (engData.length - 1)) {
					res.send(json);
				} else {
					pullFromEngine(engData, i + 1, json, q);
				}
			}
		});
	};

	pullFromEngine(engines, 0, retJson, query);
});

app.listen(1234, function () {
	console.log('Example app listening on port 1234');
});
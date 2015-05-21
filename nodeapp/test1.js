var express = require('express'),
    app     = express(),
    fs      = require('fs'),
    visits;

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.listen(8080);

app.get('/download', function(req,res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   var phantom = require('phantom');
	phantom.create(function (ph) {
		ph.createPage(function (page) {		
			page.open('http://superbrain.io/drawchart.php#/dashboardExport', function(status) {				
				setTimeout(function(){
					page.set('paperSize', {format : 'A4', orientation : 'portrait', margin : '1cm'});
					page.render('out.pdf');		
					fs.unlink("out.pdf", function(err){
									if(err == null)
										console.log("PDF Unlinked successfully");
									else
										console.log(err);
								}); 
				}, 5000); 

			});
			console.log("Requesting to the dashboard generation site");
		});
	});
});	

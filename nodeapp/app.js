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

app.post('/download', function(req,res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
   var phantom = require('phantom');
	phantom.create(function (ph) {
		ph.createPage(function (page) {
			if(req.body.userid == undefined){
				console.log("Insufficient permission");
				res.end();
				return;
			}
				
			var userid = req.body.userid;
			var dashboardData = req.body.dashboardData;			
			var dashboardTitle = req.body.dashboardTitle;
			var postBody = "dashboardData=" + dashboardData + "&dashboardTitle=" + dashboardTitle;		
			page.open('http://superbrain.io/drawchart.php#/dashboardExport', 'POST', postBody, function(status) {				
				setTimeout(function(){
					page.set('paperSize', {format : 'A4', orientation : 'portrait', margin : '1cm'});
					page.render(userid + '.pdf');					
					var interval = setInterval(function(){
						if(fs.existsSync(__dirname  + "/" + userid + ".pdf")==1){
							console.log("PDF file writing done");
							clearInterval(interval);
							res.download(userid + ".pdf", "report.pdf", function(){
								fs.unlink(userid + ".pdf", function(err){
									if(err == null)
										console.log("PDF Unlinked successfully");
									else
										console.log(err);
								}); 
							});
						}
					}, 300);				
				}, 2000); 

			});
			console.log("Requesting to the dashboard generation site");
		});
	});
});	

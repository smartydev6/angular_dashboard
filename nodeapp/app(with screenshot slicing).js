var http = require('http');
var fs = require('fs');
var Canvas = require('canvas');
http.createServer(function (req, res) {
	var phantom = require('phantom');
	phantom.create(function (ph) {
		ph.createPage(function (page) {
			var system = require('system');

			var pageHeight = 1000;	
			page.set('viewportSize', {width:595, height:1200});	
			//var dashboardData = req.body.dashboardData;
			/*var dashboardData = '[{"name":"Table","dashboardid":"1","title":"Widget 1","style":{"width":"100%"},"data":{"datas":{"columns":["ga:userType","ga:users"],"rows":[["New Visitor","735"],["Returning Visitor","1072"]],"origin_rows":[["New Visitor","735"],["Returning Visitor","1072"]],"labels":["User Type","Users"],"dimArray":["ga:userType"],"metArray":["ga:users"],"profile":"All Mobile App Data","segment":"All Sessions"}}},{"name":"AreaChart","dashboardid":"38","title":"Widget 3","style":{"width":"100%"},"data":{"datas":{"columns":["ga:date","ga:users"],"rows":[["20150101","111"],["20150102","95"],["20150103","110"],["20150104","120"],["20150105","108"],["20150106","99"],["20150107","86"],["20150108","96"],["20150109","105"],["20150110","107"],["20150111","100"],["20150112","95"],["20150113","94"],["20150114","88"],["20150115","102"],["20150116","100"],["20150117","90"],["20150118","104"],["20150119","103"],["20150120","94"],["20150121","106"],["20150122","106"],["20150123","123"],["20150124","94"],["20150125","107"],["20150126","95"],["20150127","87"],["20150128","101"],["20150129","91"],["20150130","109"],["20150131","108"],["20150201","97"],["20150202","95"],["20150203","86"],["20150204","25"],["20150205","0"],["20150206","0"],["20150207","0"],["20150208","0"],["20150209","0"],["20150210","0"],["20150211","0"],["20150212","0"],["20150213","0"],["20150214","0"],["20150215","0"],["20150216","0"],["20150217","0"],["20150218","0"],["20150219","0"],["20150220","0"]],"origin_rows":[["20150101","111"],["20150102","95"],["20150103","110"],["20150104","120"],["20150105","108"],["20150106","99"],["20150107","86"],["20150108","96"],["20150109","105"],["20150110","107"],["20150111","100"],["20150112","95"],["20150113","94"],["20150114","88"],["20150115","102"],["20150116","100"],["20150117","90"],["20150118","104"],["20150119","103"],["20150120","94"],["20150121","106"],["20150122","106"],["20150123","123"],["20150124","94"],["20150125","107"],["20150126","95"],["20150127","87"],["20150128","101"],["20150129","91"],["20150130","109"],["20150131","108"],["20150201","97"],["20150202","95"],["20150203","86"],["20150204","25"],["20150205","0"],["20150206","0"],["20150207","0"],["20150208","0"],["20150209","0"],["20150210","0"],["20150211","0"],["20150212","0"],["20150213","0"],["20150214","0"],["20150215","0"],["20150216","0"],["20150217","0"],["20150218","0"],["20150219","0"],["20150220","0"]],"labels":["Date","Users"],"dimArray":["ga:date"],"metArray":["ga:users"],"profile":"All Mobile App Data","segment":"All Sessions"}}}]';*/
			var postBody = "dashboardData=" + dashboardData;
			page.open('http://superbrain.io/drawchart.php#/dashboardExport', 'POST', postBody, function(status) {
				console.log("page read");
				setTimeout(function(){
					page.evaluate(function(){		
							var rect = document.querySelector("section").getBoundingClientRect();
							return {
								top: rect.top,
								left: rect.left,
								width: rect.width,
								height: rect.height
							};
						}, 
						function(clipRect){
							console.log(clipRect);
							page.set('clipRect', clipRect);
							//for(var i=0; i<Math.floor(clipRect.height/pageHeight) + 1; i++){
								var base64 = page.renderBase64('PNG', function(data){
									var img = new Canvas.Image; // Create a new Image
									img.src = 'data:image/png;base64,' + data;
									console.log(img.width + " : " + img.height);
									var canvas = new Canvas(img.width, img.height,'pdf');
									var ctx = canvas.getContext('2d');
									ctx.drawImage(img, 0, 0, img.width, img.height);
									//ctx.addPage();
									//ctx.drawImage(img, 0, 0, 1920, 1080);
									res.writeHead(200, {'content-type' : 'application/pdf', 'content-disposition' : 'attachment; filename=dashboard.pdf'});
									res.write( canvas.toBuffer() );							
									res.end(); 	
									ph.exit();
								});				
							//}
					}); 
					//page.render('screenshot.jpg');
				}, 5000); 

			}); 
		});
	});
}).listen(1337, '0.0.0.0');
console.log('Server running at http://superbrain.io:1337/');
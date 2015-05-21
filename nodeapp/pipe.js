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

app.get('/pipe', function(req,res) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Cache-Control");
    var phantom = require('phantom-render-stream');
    var render = phantom({
	  pool        : 5,           // Change the pool size. Defaults to 1 
	  timeout     : 1000,        // Set a render timeout in milliseconds. Defaults to 30 seconds. 
	  tmp         : '/tmp',      // Set the tmp where tmp data is stored when communicating with the phantom process. 
								 //   Defaults to /tmp if it exists, or os.tmpDir() 
	  format      : 'pdf',      // The default output format. Defaults to png 
	  quality     : 100,         // The default image quality. Defaults to 100. Only relevant for jpeg format. 
	  width       : 1280,        // Changes the width size. Defaults to 1280 
	  height      : 800,         // Changes the height size. Defaults to 960 
	  paperFormat : 'A4',        // Defaults to A4. Also supported: 'A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'. 
	  orientation : 'portrait',  // Defaults to portrait. 'landscape' is also valid 
	  margin      : '0cm',       // Defaults to 0cm. Supported dimension units are: 'mm', 'cm', 'in', 'px'. No unit means 'px'. 
	  userAgent   : '',          // No default. 
	  headers     : {"Content-Type" :"application/json"}, // Additional headers to send with each upstream HTTP request 
	  operation : 'POST',
	  data : "a=b",
	  postData : "a=b",
	  body : "a=b",
	  postBody : "a=b",
	  crop        : false,       // Defaults to false. Set to true or {top:5, left:5} to add margin 
	  printMedia  : false,       // Defaults to false. Force the use of a print stylesheet. 
	  maxErrors   : 3,           // Number errors phantom process is allowed to throw before killing it. Defaults to 3. 
	  retries     : 1,           // How many times to try a render before giving up. Defaults to 1. 
	  phantomFlags: ['--ignore-ssl-errors=true'], // Defaults to []. Command line flags passed to phantomjs 
	  maxRenders  : 20,          // How many renders can a phantom process make before being restarted. Defaults to 20 
	 
	  injectJs    : ['./includes/my-polyfill.js'] // Array of paths to polyfill components or external scripts that will be injected when the page is initialized 
	});
	render('http://superbrain.io/drawchart.php#/dashboardExport')
		.pipe(fs.createWriteStream('out.pdf')); 
	/*fs.unlink("out.pdf", function(err){
		if(err == null)
			console.log("PDF Unlinked successfully");
		else
			console.log(err);
	}); */
});	

var images  	 	= require("images"),
		im 		  	= require('imagemagick')
		bodyParser  = require('body-parser'),
		cors 		= require('cors'),
		express 	= require('express'),
		fs	        = require('fs');


var app = express();
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended : true, limit: '50mb' }));

var path = "images/";
var destPath = "croppeds/"

app.post('/image', function(req, res){
	var body = req.body;

	var base64Data  =   body.type === '.png' ? body.base.replace(/^data:image\/png;base64,/, "") : body.base.replace(/^data:image\/jpeg;base64,/, "");
		base64Data  +=  base64Data.replace('+', ' ');
		binaryData  =   new Buffer(base64Data, 'base64').toString('binary');
	
	var name = Date.now() + body.type;

	fs.writeFile(path + name, binaryData, "binary", function (err) {
    im.crop({
		  srcPath: path + name,
		  dstPath: destPath + name,
		  width: 700,
		  height: 700,
		  quality: 1,
		  gravity: "Center"
		}, function(err, stdout, stderr){
			combine(name, res);
		});
	});

});

// error handling
app.use(function(request, response, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use(function(err, request, response, next) {
	response.status(err.status || 500).json({ error: err.errors || err.message });
});

function combine (name, res) {
	images(destPath + name)                                                                
		.draw(images(destPath + "transparent.png"), 0, 0)   
		.save("avatars/"+name, {      
		    quality : 100                
		});
	
	var file = __dirname + '/avatars/'+name;

	var bitmap = fs.readFileSync(file);

    var base64 = Buffer(bitmap).toString('base64');
    var imageSrc = 'data:image/png;base64,' + base64;
    
    // Remove avatart
    fs.unlink(__dirname + '/avatars/'+name);
    fs.unlink(__dirname + '/images/'+name);
    fs.unlink(__dirname + '/croppeds/'+name);

  	res.json(imageSrc);
}
var PORT = process.env.PORT || 3000;
// LISTEN SERVER PORT
app.listen(PORT);





var multer  =   require('multer');
var uuid = require('node-uuid');

var staticdir = process.env.NODE_ENV === 'develop' ? 'dist.dev' : 'dist.prod';


exports.create = function (req, res, next) {
	var file_name = null;
	var storage =   multer.diskStorage({
	  destination: function (req, file, callback) {
	    callback(null, './'+staticdir+'/assets/images/upload');
	  },
	  filename: function (req, file, callback) {
	  	var tmpPath = file.originalname; 
	  	var extIndex =  tmpPath.lastIndexOf('.');
	    var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
	    file_name = uuid.v4()+extension;
	    callback(null, file_name);
	  }
	});
	var upload = multer({ storage : storage}).single('file');
    upload(req,res,function(err) {
        if(err) {
        	console.log("uplading error", err);
            return res.end(file_name);
        }
        res.end(file_name);
    });
};



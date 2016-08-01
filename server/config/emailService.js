var nodemailer = require('nodemailer');
var config = require('./config');
var cryptoMethod = require('./cryptoMethod');
var smtpTransport = nodemailer.createTransport({
/*  service: 'smtp.lolipop.jp',
  auth: {
    user: config.configMailer.senderUser,
    pass: config.configMailer.senderPass
  }*/
  	host: 'smtp.lolipop.jp',
    port:  465,
    secure: true, // use SSL 
    auth: {
        user: config.configMailer.senderUser,
    	pass: config.configMailer.senderPass
  	}
});


/*var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL 
    auth: {
        user: 'user@gmail.com',
        pass: 'pass'
    }
};*/

/** getAll function to get all advertisers. */
exports.invite = function (result, callback) {
   	encryptEmail = cryptoMethod.encrypt(result.email);
	link=config.url.basePath+"/verify/"+encryptEmail;
	mailOptions={
		to : result.email,
		from:  config.configMailer.senderUser,
		subject : "Please confirm your Email account",
		html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
	};
	smtpTransport.sendMail(mailOptions, function(error, result){
		if(error){
			callback(error, result);
		}
		else{
			callback(null, result);
		}
	});	
};

//function to send the sign-up email
exports.signUpEmailToAdmin = function (result, adminEmail, callback) {
   	encryptEmail = cryptoMethod.encrypt(result.email);
	link=config.url.basePath+"/verify/"+encryptEmail;
	mailOptions={
		to : adminEmail,
		from:  config.configMailer.senderUser,
		subject : "New advertiser",
		html : "Hello admin,<br> New advertiser has registered on the service, Following is the detail of an advertiser.<br>Company - "+result.company+"<br>Name - "+result.name+"<br>Email - "+result.email+"<br>Department - "+result.department+"<br>Phone number - "+result.phonenumber
	};
	smtpTransport.sendMail(mailOptions, function(error, result){
		if(error){
			callback(error, result);
		}
		else{
			callback(null, result);
		}
	});	
};

exports.decline = function (email, callback) {
	mailOptions={
		to : email,
		from:  config.configMailer.senderUser,
		subject : "Declined your account by expaus team",
		html : "Hello,<br> Your account has been declined by team.<br>"	
	};
	smtpTransport.sendMail(mailOptions, function(error, result){
		if(error){
			callback(error, result);
		}
		else{
			callback(null, result);
		}
	});	
};

exports.messageToInfluencer = function(emailId, data, callback){
	mailOptions={
		to : emailId,
		from:  config.configMailer.senderUser,
		subject : "Received Message from advertiser",
		html : 'Hello,<br>You received message from advertise<br>'+
				''+data.message+''
	};
	smtpTransport.sendMail(mailOptions, function(error, result){
		if(error){
			callback(error, result);
		}
		else{
			callback(null, result);
		}
	});	
};

exports.messageToAdvertiser = function(emailId, data, callback){
	mailOptions={
		to : emailId,
		from:  config.configMailer.senderUser,
		subject : "Received Message from advertiser",
		html : data
	};
	smtpTransport.sendMail(mailOptions, function(error, result){
		if(error){
			callback(error, result);
		}
		else{
			callback(null, result);
		}
	});	
};


const pool = require('./dbconnection');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jsonQuery = require('json-query');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const generator = require('generate-password');
var mailparams={"email":"","tempass":""};
var resultsNotFound = {
  "errorCode": "0",
  "errorMessage": "Operation not successful.",
  "rowCount": "0",
  "data": ""
};
var resultsFound = {
  "errorCode": "1",
  "errorMessage": "Operation successful.",
  "rowCount": "1",
  "data": ""
};

var resultsFoundPolicy = {
  "errorCode": "1",
  "errorMessage": "Operation successful.",
  "rowCount": "1",
  "data": {"policy":"","coverage":"","beneficiary":"","type":""}
};

var tokenUpdated = {
  "message" : "Token Updated"
};

var AWS = require('aws-sdk');
		// Initialize the Amazon Cognito credentials provider
		AWS.config.region = process.env.region; // Region
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		IdentityPoolId: process.env.IdentityPoolId,});
		// Initialize the Amazon Cognito credentials provider
		//AWS.config.region = 'us-east-1'; // Region
		//AWS.config.credentials = new AWS.CognitoIdentityCredentials({
		// Provide your Pool Id here
		//	IdentityPoolId: 'us-east-1:XXXXX',
		//});

		var lexruntime = new AWS.LexRuntime();
		var lexUserId = 'chatbot-demo' + Date.now();
		var sessionAttributes = {};

module.exports = {
//CREATE USER DRAFT
//   createUser: function (req, res) {
//     pool.getConnection(function (err, connection) {
//       if (err) throw err; // not connected!

//       bcrypt.hash(req.body.inputPassword, saltRounds, function (err, hash) {
//         //var sql = 'INSERT INTO user SET ?';
//         //var values = { 'name': req.body.inputEmail, 'email': req.body.inputEmail, 'password': hash, 'createdAt': new Date(), 'updatedAt': new Date() }
//         // Use the connection
//         //TESTInsertdata//
//         var sql = 'INSERT INTO login SET ?';
//         var values = { 'userid': '11111', 'username': req.body.inputEmail, 'password': hash, 'role': 'Admin', 'accountno': '12341234' }
//         //TESTInsertdata//
//         connection.query(sql, values, function (error, results, fields) {
//           if (error) {
//             resultsNotFound["errorMessage"] = "emailID already exists.";
//             return res.send(resultsNotFound);
//           } else return res.send(resultsFound);

//           // When done with the connection, release it.
//           connection.release(); // Handle error after the release.
//           if (error) throw error; // Don't use the connection here, it has been returned to the pool.
//         });
//       });
//     });
// },
  loginUser: function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT * FROM `login` WHERE `username` = ?';
        var values = [req.body.inputEmail]
        // Use the connection
        connection.query(sql, values, function (error, results, fields) {
          if (error) {
            resultsNotFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsNotFound["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          bcrypt.compare(req.body.inputPassword, results[0].password, function (err, result) {
      if (result == true) {
        //console.log(results[0].userid);
        var token = {
          "token": jwt.sign(
            { userid: results[0].userid },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
          )
        }
        resultsFound["userid"] = results[0].userid;
        resultsFound["data"] = token;
        //START*** to Insert token to Database Table login
        var sqltoken = 'UPDATE login SET ? WHERE `username` = ?';
        var userEmail = req.body.inputEmail;
        Date.prototype.addHours = function(h){
          this.setHours(this.getHours()+h);
          return this;
        }
        var valuestoken = { 'session': token["token"],'session_timeout': new Date().addHours(1)};
        connection.query(sqltoken, [valuestoken,userEmail], function (error, resultstoken, fields){
            res.send(resultsFound);
        });
        //END*** to Insert token to Database Table login
      } else {
        resultsNotFound["errorMessage"] = "Incorrect Password.";
        return res.send(resultsNotFound);
      }
    });

          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getUser: function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT * FROM user_profile JOIN tblpolicy ON user_profile.userid = tblpolicy.userid WHERE user_profile.userid = ?';
        //var values = [req.body.userid];
        //get userid using token
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        //console.log(uid.userid);
        // Use the connection
        connection.query(sql, uid.userid, function (error, results, fields) {
          console.log(results);
          if (error) {
            resultsNotFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsNotFound["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
           if(results !=="") {
            resultsFound["data"] = results;
          
          res.send(resultsFound);
    
          console.log(results);
          }
          
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  updateUser: function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'UPDATE user_profile SET ? WHERE userid = ?';
        var userid = [req.body.userid];
        console.log(req.body.userid);
        //ADD ALL FIELDS ON var userdetails
        var userdetails = {'fname': req.body.fname, 'lname': req.body.lname, 'mname': req.body.mname};
        // Use the connection
        connection.query(sql, [userdetails,userid], function (error, results, fields) {
          if (error) {
            resultsNotFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsNotFound["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          resultsFound["errorMessage"] = "User Details Updated";
          res.send(resultsFound);
          console.log(results);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getPolicy: function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT userid, policynumber, insuredname, status, faceamount, paymentmode, premiumamount, reg_billed_prem, premiumdt, totalamtdue, type, "coverage" FROM `tblpolicy` WHERE `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        //var values = [req.body.userid]
        //console.log(req.body.userid);
        // Use the connection
        connection.query(sql, uid.userid, function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsFoundPolicy);
          }
          if (results =="") {
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
            return res.send(resultsFoundPolicy);
          }
          resultsFoundPolicy["data"]["policy"] = results;
        
          res.send(resultsFoundPolicy);
          console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getCoverage: function(req,res){
    //console.log(req);
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      const policynum = req.query.policynumber;
      console.log(policynum);

        var sqlcoverage = 'SELECT * FROM `tblcoverage` WHERE `policynumber` = ? and `userid`=?';
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
          const policynumber = req.query.policynumber;
        connection.query(sqlcoverage, [policynumber,uid.userid], function (error, results, fields) {
          if (error) {
            resultsFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFound["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["coverage"] = results;
            res.send(resultsFoundPolicy);
            console.log("this is the result"+resultsFoundPolicy);
            // When done with the connection, release it.
          }
        
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getBeneficiary: function(req,res){ //Get the beneficiaries 
    //console.log(req);
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      const policynum = req.query.policynumber;
      console.log(policynum);

        var sqlcoverage = 'SELECT * FROM `tblbeneficiary` WHERE `policynumber` = ? and exists (select userid from `tblpolicy` where `userid` =? and `policynumber` = ?)';
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
          const policynumber = req.query.policynumber;
        connection.query(sqlcoverage, [policynumber,uid.userid,policynumber], function (error, results, fields) {
          if (error) {
            resultsFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFound["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["beneficiary"] = results;
            res.send(resultsFoundPolicy);
            console.log("this is the result"+resultsFoundPolicy);
            // When done with the connection, release it.
          }
        
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getPolicyLife: function (req, res) { //Get policy where type is Life
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT * FROM `tblpolicy` WHERE `type`=? and `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        //userid = '33333';
        //var values = [req.body.userid]
        //console.log(req.body.userid);
        // Use the connection
        connection.query(sql, ["life",uid.userid], function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["policy"] = results;

            //var policynum = resultsFoundPolicy["data"]["policy"][0]["policynumber"];
  
           //console.log("policynumber " + policynum);
           
            res.send(resultsFoundPolicy);
            //module.exports.getCoverage(request.body.policynum=policynum,response);

          }
         
          console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getPolicyHealth: function (req, res) { //Get policies where type is Health
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT * FROM `tblpolicy` WHERE `type`=? and `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        //userid = '33333';
        //var values = [req.body.userid]
        //console.log(req.body.userid);
        // Use the connection
        connection.query(sql, ["health",uid.userid], function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["policy"] = results;

            //var policynum = resultsFoundPolicy["data"]["policy"][0]["policynumber"];
  
           //console.log("policynumber " + policynum);
           
            res.send(resultsFoundPolicy);
            //module.exports.getCoverage(request.body.policynum=policynum,response);

          }
         
          console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getPolicyType: function (req, res) { //Get policy types using userid
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT policynumber,type FROM `tblpolicy` WHERE `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        //userid = '33333';
        //var values = [req.body.userid]
        //console.log(req.body.userid);
        // Use the connection
        connection.query(sql, [uid.userid], function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["type"] = results;

            //var policynum = resultsFoundPolicy["data"]["policy"][0]["policynumber"];
  
           //console.log("policynumber " + policynum);
           
            res.send(resultsFoundPolicy);
            //module.exports.getCoverage(request.body.policynum=policynum,response);

          }
         
          console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getReferral: function (req, res) { //Get policy where type is Life
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT agentid, (select concat(fname," ",lname) from user_profile where userid=tblreferral.referrerid)as referrer, referral_name, referral_contact, date_referred, life_score, health_score, education_score, status FROM tblreferral WHERE tblreferral.agentid=?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        const agent = req.query.agentid;
        console.log('agent id is: '+agent);
        // var uid = jwt.verify(
        //   token.replace('Bearer ', ''),
        //   process.env.JWT_SECRET
        //   );
        //userid = '33333';
        //var values = [req.body.userid]
        //console.log(req.body.userid);
        // Use the connection
        connection.query(sql, [agent], function (error, results, fields) {
          if (error) {
            resultsNotFound["errorMessage"] = "Something went wrong with Server." + error;
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsNotFound["errorMessage"] = "Agent records does not exist.";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFound["data"] = results;

            //var policynum = resultsFoundPolicy["data"]["policy"][0]["policynumber"];
  
           //console.log("policynumber " + policynum);
           
            res.send(resultsFound);
            //module.exports.getCoverage(request.body.policynum=policynum,response);

          }
         
          console.log(resultsFound);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  //CHATBOT-ver1
  pushChat: function pushChat(req, res) {
		console.log("PUSHCHAT",req.query.request);
		var params = {
			botAlias: process.env.botAlias,
			botName: process.env.botName,
			inputText: req.query.request,
			userId: lexUserId,
			sessionAttributes: sessionAttributes
		};
		lexruntime.postText(params, function(err, data) {
			if (err) {
				console.log(err, err.stack);
				showError('Error:  ' + err.message + ' (see console for details)')
			}
			if (data) {
			sessionAttributes = data.sessionAttributes;
				console.log("AMAZONLEX",data);
				return res.send(data);
			}
		});
		return false;
  },
  
  encrypt: function(req,res){
    bcrypt.hash(req.body.inputPassword, saltRounds, function (err, hash) {
      console.log(hash);
  res.send(hash)
    });

  },
  //SharePolicy and send email
  updateShared: function(req, res) {
    var func = this;
    pool.getConnection(function (err, connection) {
	  if (err) throw err; // not connected!
		var sql = 'SELECT * FROM tblbeneficiary WHERE emailadd = ? and policynumber = ?';
		var sqlupd = 'UPDATE tblbeneficiary SET ? WHERE emailadd = ? and policynumber = ?';
    var slqinsert = 'INSERT INTO login SET ?';
  
    var token = req.headers.token;
  
    var uid = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
      );
    var userid = 'BEN';
		var emailadd = req.query.email;
    var policynumber = req.query.policynumber;
    var shared = {'shared': 'Y'};
    var password = generator.generate({
      length: 10,
      numbers: true
      });
    bcrypt.hash(password, saltRounds, function (err, hash) {
      console.log("THIS is the TEMPORARY PASSWORD", password)
		  var beninsert = { 'userid': userid+=uid.userid,'username':emailadd, 'password': hash, 'role': 'BEN'}
      connection.query(sql, [emailadd, policynumber], function (error, results, fields) {
        if (error) {
          resultsNotFound["errorMessage"] = "Something went wrong with Server.";
          return res.send(resultsNotFound);
        }
        if (results =="") {
          resultsNotFound["errorMessage"] = "No records found";
          return res.send(resultsNotFound);
        }
		    connection.query(sqlupd, [shared,emailadd, policynumber], function (error, results, fields) {
			    if (error) {
				    resultsNotFound["errorMessage"] = "Something went wrong with Server.";
				    return res.send(resultsNotFound);
			    }
			    resultsFound["errorMessage"] = "Shared set to Y."
          connection.query(slqinsert, beninsert, function (error, results, fields) {
            if (error) {
              resultsNotFound["errorMessage"] = "Something went wrong with Server.";
              return res.send(resultsNotFound);
            }
            resultsFound["errorMessage"] = "Temporary username and password created."
            
            mailparams["email"] = emailadd;
            mailparams["tempass"]= password;
            func.sendEmail(mailparams, res);
            //res.send(resultsFound);
          });
        
		  });
      // When done with the connection, release it.
      connection.release(); // Handle error after the release.
      if (error) throw error; // Don't use the connection here, it has been returned to the pool.
    });
  });
});
  },
  sendEmail: function sendEmail(mailparams, res){
    console.log(mailparams);
    var transporter = nodemailer.createTransport(smtpTransport({
      //service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: process.env.emailadd,
        pass: process.env.emailpass,
      }
    }));

    var mailOptions = {
      from: 'InsuranceSharePolicy <insurancepolicysharing@gmail.com>',
      //to: 'batbatchoychoy@gmail.com',//mailparams.email,
      to: mailparams.email,
      cc: 'betbetrizal@gmail.com',
      subject: 'Insurance Policy Sharing',
      //text: `Hi , This is your temporary password ` + mailparams.tempass
      html: '<img src="cid:welcome"/><br><h3>Hi '+mailparams.email+'</h3><br><p>"Someone" shared his/her policy to you. Kindly download the app and login to view the policy details.</p><br><p>Below is your temporary login account.</p><p>Username: '+mailparams.email+'</p><p>Password: '+mailparams.tempass+'</p>',
      attachments: [{filename: 'welcome.png',path: 'file_uploads/welcome.png',cid: 'welcome' //same cid value as in the html img src
    }]
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        resultsNotFound["errorMessage"] = "Email Not Sent. Policy not shared.";
        //func.updateShared(req, res);
        return res.send(resultsNotFound);
      } else {
        console.log('Email sent: ' + info.response);
        resultsFound["errorMessage"] = "Email Sent.";
        res.send(resultsFound);
      }
    });
  }
};


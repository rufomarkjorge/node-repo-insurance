const pool = require('./dbconnection');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const jsonQuery = require('json-query');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const generator = require('generate-password');
var mailparams={"email":"","tempass":"","policyholderemail":""};
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
    
        //  console.log(results);
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
         // console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getCoverage: function(req,res){
    resultsFoundPolicy["data"]["coverage"] = "";
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      const policynum = req.query.policynumber;
      console.log(policynum);

        //var sqlcoverage = 'SELECT * FROM `tblcoverage` WHERE `policynumber` = ? and `userid`=?';
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var checkben = uid.userid.substring(0,3);
        if (checkben == "BEN"){
          console.log("nasa ben")
          var sqlcoverage = 'SELECT * FROM `tblcoverage` where `policynumber` = (select policynumber from tblbeneficiary where dependentuserid = ? and shared = "Y")';
          var params = [uid.userid]
        }else {
          console.log("nasa holder")
          var sqlcoverage = 'SELECT * FROM `tblcoverage` WHERE `policynumber` = ? and `userid`=?';
          var params = [policynum,uid.userid]
        }
        connection.query(sqlcoverage, params, function (error, results, fields) {
          if (error) {
            console.log("nasa error"+ error)
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server.";
            resultsFoundPolicy["errorCode"]="0";
            
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
   
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["errorCode"]="1";
            resultsFoundPolicy["data"]["coverage"] = results;
            res.send(resultsFoundPolicy);
            //console.log("this is the result"+resultsFoundPolicy);
            // When done with the connection, release it.
          }
        
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getBeneficiary: function(req,res){ //Get the beneficiaries 
    resultsFoundPolicy["data"]["beneficiary"] = "";
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
      const policynum = req.query.policynumber;
      console.log(policynum);

        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var checkben = uid.userid.substring(0,3);
        if (checkben == "BEN"){
          console.log("nasa ben")
          var sqlben = 'SELECT * FROM `tblbeneficiary` where `policynumber` = ? and `dependentuserid` = ?';
          var params = [policynum, uid.userid];
        }else{
          var sqlben = 'SELECT * FROM `tblbeneficiary` WHERE `policynumber` = ? and exists (select userid from `tblpolicy` where `userid` =? and `policynumber` = ?)';
          var params = [policynum,uid.userid,policynum];
        }
        const policynumber = req.query.policynumber;
        connection.query(sqlben, params, function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          if (results =="") {
            console.log("wala");
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
        
            return res.send(resultsNotFound);
          }
          if (results!==""){
            console.log("meron");
            resultsFoundPolicy["errorCode"]="1";
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
    resultsFoundPolicy["data"]["policy"] = "";
    resultsFoundPolicy["data"]["coverage"] = "";
    resultsFoundPolicy["data"]["beneficiary"] = "";
    resultsFoundPolicy["data"]["type"] = "";
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
        //console.log(req.headers.token);
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var userid = uid.userid;
        var checkben = userid.substring(0,3);
        if (checkben == "BEN"){
          var policysql = 'SELECT * FROM `tblpolicy` where `policynumber` = (select policynumber from tblbeneficiary where dependentuserid = ? and shared = "Y")';
          var params = [userid]
        }else{
          var policysql = 'SELECT * FROM `tblpolicy` WHERE `type` = ? and `userid` = ?';
          var params = ["life",userid]
        }
        connection.query(policysql, params, function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "Policy not found.";
  
            return res.send(resultsNotFound);
          }
          if (results!==""){
           // console.log(results);
            resultsFoundPolicy["errorCode"]="1";
            resultsFoundPolicy["data"]["policy"] = results;
            res.send(resultsFoundPolicy);
          }
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
    });
  },
  getPolicyHealth: function (req, res) { //Get policies where type is Health
    resultsFoundPolicy["data"]["policy"] = "";
    resultsFoundPolicy["data"]["coverage"] = "";
    resultsFoundPolicy["data"]["beneficiary"] = "";
    resultsFoundPolicy["data"]["type"] = "";
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT * FROM `tblpolicy` WHERE `type`=? and `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var checkben = uid.userid.substring(0,3);
        if (checkben == "BEN"){
          var policysql = 'SELECT * FROM `tblpolicy` where `policynumber` = (select policynumber from tblbeneficiary where dependentuserid = ? and shared = "Y")';
          var params = [uid.userid]
        }else{
          var policysql = 'SELECT * FROM `tblpolicy` WHERE `type` = ? and `userid` = ?';
          var params = ["health",uid.userid]
        }
        connection.query(policysql, params, function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
      
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["errorCode"]="1";
            resultsFoundPolicy["data"]["policy"] = results;
            res.send(resultsFoundPolicy);
          }
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getPolicyType: function (req, res) { //Get policy types using userid
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        //var sql = 'SELECT policynumber,type FROM `tblpolicy` WHERE `userid` = ?';
        //console.log(req.headers.token);
        const token = req.headers.token;
        
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var checkben = uid.userid.substring(0,3);
        if (checkben == "BEN"){
          var policysql = 'SELECT policynumber,type FROM `tblpolicy` where `policynumber` = (select policynumber from tblbeneficiary where dependentuserid = ? and shared = "Y")';
        }else{
          var policysql = 'SELECT policynumber,type FROM `tblpolicy` WHERE `userid` = ?';
        }
        connection.query(policysql, [uid.userid], function (error, results, fields) {
          if (error) {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "Something went wrong with Server." + error;
            return res.send(resultsNotFound);
          }
          if (results =="") {
            resultsFoundPolicy["errorCode"]="0";
            resultsFoundPolicy["errorMessage"] = "User Id not found.";
            resultsFoundPolicy["data"]["type"]="";
            return res.send(resultsNotFound);
          }
          if (results!==""){
            resultsFoundPolicy["data"]["type"] = results;

            //var policynum = resultsFoundPolicy["data"]["policy"][0]["policynumber"];
  
           //console.log("policynumber " + policynum);
           
            res.send(resultsFoundPolicy);
            //module.exports.getCoverage(request.body.policynum=policynum,response);

          }
         
          //console.log(resultsFoundPolicy);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getReferral: function (req, res) { //Get policy where type is Life
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!

        var sql = 'SELECT agentid, (select concat(fname," ",lname) from user_profile where userid=tblreferral.referrerid)as referrer, referralid, referral_name, referral_birthday, referral_email, referral_contact, date_referred, life_score, health_score, education_score, status FROM tblreferral WHERE tblreferral.agentid=?';
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
    var sqlholderemail = 'SELECT * FROM `user_profile` where `userid`=?';

    var token = req.headers.token;
  
    var uid = jwt.verify(
      token.replace('Bearer ', ''),
      process.env.JWT_SECRET
      );
    var ben = 'BEN';
		var emailadd = req.query.email;
    var policynumber = req.query.policynumber;
    var shared = {'dependentuserid': "BEN"+uid.userid,'shared': 'Y'};
    var password = generator.generate({
      length: 10,
      numbers: true
      });
    bcrypt.hash(password, saltRounds, function (err, hash) {
      console.log("THIS is the TEMPORARY PASSWORD", password)
		  var beninsert = { 'userid': ben+uid.userid,'username':emailadd, 'password': hash, 'role': 'BEN'}
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
            connection.query(sqlholderemail, uid.userid, function (error, results, fields) {
              if (error) {
                resultsNotFound["errorMessage"] = "Something went wrong with Server.";
                return res.send(resultsNotFound);
              }
              resultsFound["errorMessage"] = "Temporary username and password created."
              mailparams["email"] = emailadd;
              mailparams["tempass"]= password;
              mailparams["policyholderemail"]=results[0].emailadd;
              func.sendEmail(mailparams, res);
              //console.log(mailparams);
              //res.send(resultsFound);
            })
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

    var mailOptions_ben = {
      from: 'InsuranceSharePolicy <insurancepolicysharing@gmail.com>',
      //to: 'batbatchoychoy@gmail.com',//mailparams.email,
      to: mailparams.email,
      //cc: 'betbetrizal@gmail.com',
      subject: 'Insurance Policy Sharing',
      //text: `Hi , This is your temporary password ` + mailparams.tempass
      html: '<img src="cid:welcome"/><br><h3>Hi '+mailparams.email+'</h3><br><p>"Someone" shared his/her policy to you. Kindly download the app and login to view the policy details.</p><br><p>Below is your temporary login account.</p><p>Username: '+mailparams.email+'</p><p>Password: '+mailparams.tempass+'</p>',
      attachments: [{filename: 'welcome.png',path: 'file_uploads/welcome.png',cid: 'welcome' //same cid value as in the html img src
    }]
    };
    var mailOptions_holder = {
      from: 'InsuranceSharePolicy <insurancepolicysharing@gmail.com>',
      //to: 'rupaxniupadi12@gmail.com',//mailparams.email,
      to: mailparams.policyholderemail,
      //cc: 'betbetrizal@gmail.com',
      subject: 'Insurance Policy Sharing',
      text: `Hi , This is email receipt for Policy Holder`
      //html: '<img src="cid:welcome"/><br><h3>Hi '+mailparams.email+'</h3><br><p>"Someone" shared his/her policy to you. Kindly download the app and login to view the policy details.</p><br><p>Below is your temporary login account.</p><p>Username: '+mailparams.email+'</p><p>Password: '+mailparams.tempass+'</p>',
      //attachments: [{filename: 'welcome.png',path: 'file_uploads/welcome.png',cid: 'welcome' //same cid value as in the html img src
    };
    transporter.sendMail(mailOptions_ben, function(error, info){
      if (error) {
        console.log(error);
        resultsNotFound["errorMessage"] = "Email Not Sent. Policy not shared.";
        //func.updateShared(req, res);
        return res.send(resultsNotFound);
      } else {
        console.log(mailparams.policyholderemail);
        transporter.sendMail(mailOptions_holder, function(error, info){
          console.log('Email sent: ' + info.response);
          resultsFound["errorMessage"] = "Email Sent.";
          res.send(resultsFound);
          });
      }
    });
  },
  insfbScore: function (req, res) {
    pool.getConnection(function (err, cinsonnection) {
      if (err) throw err; // not connected!
        //console.log(req);
        console.log(err);
        var sql = 'INSERT INTO score_tbl SET ?';
        //ADD ALL FIELDS ON var userdetails
        var scoretbl = {'batch_timestamp': req.body.batch_timestamp,
                        'referrer_fb_name': req.body.referrer_fb_name, 
                        'referrer_fb_id': req.body.referrer_fb_id,
                        'referrer_app_name': req.body.referrer_app_name, 
                        'referrer_ap_id': req.body.referrer_ap_id,
                        'referral_name': req.body.referral_name,
                        'referral_id': req.body.referral_id,
                        'product': req.body.product,
                        'friendship_mutual_score': req.body.friendship_mutual_score,
                        'friendship_score': req.body.friendship_score,
                        'profile_work_score': req.body.profile_work_score,
                        'profile_age_score': req.body.profile_age_score,
                        'profile_rel_score': req.body.profile_rel_score,
                        'profile_score': req.body.profile_score,
                        'feed_positive_score': req.body.feed_positive_score,
                        'feed_events_score': req.body.feed_events_score,
                        'feed_negative_score': req.body.feed_negative_score,
                        'feed_score': req.body.feed_score,
                        'total_score': req.body.total_score,
                        'agent_id': req.body.agent_id,
                        'status': req.body.status,
                        'timestamp': Date.now()
                      };
        // Use the connection
        connection.query(sql, scoretbl, function (error, results, fields) {
          if (error) {
            console.log("HERE");
            console.log(error);
            resultsNotFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          resultsFound["errorMessage"] = "Score table Updated";
          res.send(resultsFound);
          console.log(resultsFound);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  },
  getfbScore: function (req, res) {
    pool.getConnection(function (err, connection) {
      if (err) throw err; // not connected!
        //console.log(req);
        console.log(err);
        var fb_id = req.body.referrer_id;
        var sql = 'SELECT batch_timestamp,referrer_fb_name,referrer_fb_id,referrer_app_name,referrer_app_id,referral_name,referral_id,product,total_score,agent_id,status,timestamp FROM `score_tbl` WHERE `referrer_id`=?';
        // Use the connection
        connection.query(sql,fb_id, function (error, results, fields) {
          if (error) {
            console.log("HERE");
            console.log(error);
            resultsNotFound["errorMessage"] = "Something went wrong with Server.";
            return res.send(resultsNotFound);
          }
          resultsFound["errorMessage"] = "Selected all";
          res.send(results);
          console.log(resultsFound);
          // When done with the connection, release it.
          connection.release(); // Handle error after the release.
          if (error) throw error; // Don't use the connection here, it has been returned to the pool.
        });
      });
  }
};
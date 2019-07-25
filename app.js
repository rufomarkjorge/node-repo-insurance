const express = require('express');
const bodyParser = require('body-parser');
const app = express();
// store config variables in dotenv
require('dotenv').config();
const cors = require('cors');

//**for upload files */
const  multipart  =  require('connect-multiparty');
const  multipartMiddleware  =  multipart({uploadDir: './models/tmp_files'});
//**for upload files */

// ****** allow cross-origin requests code START ****** //
app.use(cors()); // uncomment this to enable all CORS and delete cors(corsOptions) in below code
const allowedOrigins = process.env.allowedOrigins.split(',');
app.use(express.static('img/profile'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
/**
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin 
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not ' + 'allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));
 */
// ****** allow cross-origin requests code END ****** //

// ****** validation rules START ****** //
const valFunctions = require('./validators/validate');
// ****** validation rules END ****** //


// app Routes
// create application/json parser
const jsonParser = bodyParser.json()
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

// POST /login gets urlencoded bodies
app.post('/login', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;

    var dbFunctions = require('./models/connector');
    //dbFunctions.loginUser(req,res);
    dbFunctions.loginUser(req,res);
});
app.get('/profile', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getUser(req,res);
});
app.post('/profile', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.updateUser(req,res);
});
app.post('/getpolicy', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getPolicy(req,res);
});
app.get('/policies/life', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getPolicyLife(req,res);
});
app.get('/policies/coverage', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getCoverage(req,res);
});
app.get('/policies/health', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getPolicyHealth(req,res);
});
app.get('/policies/type', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getPolicyType(req,res);
});
app.get('/policies/beneficiary', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getBeneficiary(req,res);
});
app.post('/agent-list', jsonParser, function (req, res) {
   // if(valFunctions.checkInputDataNULL(req,res)) return false;
    //if(valFunctions.checkInputDataQuality(req,res)) return false;
    //if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getReferral(req,res);
});
app.post('/bot', jsonParser, function (req, res) {
    console.log(req.query.request);
    var dbFunctions = require('./models/connector');
    dbFunctions.pushChat(req,res);
});
//**file upload */
app.post('/file_upload', multipartMiddleware, function (req, res) {
    console.log(req);
    for (var i = 0; i < req.files.uploads.length; i++) {
     console.log(req.files.uploads[i]);
    }
    if(valFunctions.checkJWTToken(req,res)) return false;
    console.log('File uploaded successfully')
    var dbFunctions = require('./models/ocr');
    dbFunctions.verifyOCR(req,res);
});

app.post('/encrypt', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    //if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    //console.log(res);
    var dbFunctions = require('./models/connector');
    dbFunctions.encrypt(req,res);
});

//**Share policy and send email */
app.post('/share_policy', jsonParser, function (req, res) {
    console.log(req.params.email);
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.updateShared(req,res);
});

//**Facebook data insight send and get data endpoints */
app.post('/fb_ref_scoring', jsonParser, function (req, res) {
    var dbFunctions = require('./models/connector');
    dbFunctions.insfbScore(req,res);
});
app.get('/fb_ref_scoring', jsonParser, function (req, res) {
    var dbFunctions = require('./models/connector');
    dbFunctions.getfbScore(req,res);
});
//**Refer Insert and Update score_tbl with fb details endpoints */
app.post('/insert_referral', jsonParser, function (req, res) {
    if(valFunctions.checkJWTToken(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.insertReferral(req,res);
});
app.post('/update_status', jsonParser, function (req, res) {
    var dbFunctions = require('./models/connector');
    dbFunctions.updateStatus(req,res);
});
app.post('/update_referral', jsonParser, function (req, res) {
    var dbFunctions = require('./models/connector');
    dbFunctions.updateReferral(req,res);
});
//CLAIMS
app.get('/getclaims', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.getClaims(req,res);
});
app.post('/submitclaims', jsonParser, function (req, res) {
    if(valFunctions.checkInputDataNULL(req,res)) return false;
    if(valFunctions.checkInputDataQuality(req,res)) return false;
    if(valFunctions.checkJWTToken(req,res)) return false;
    //if(valFunctions.checkUserAuthRole(req,res)) return false;
    var dbFunctions = require('./models/connector');
    dbFunctions.insClaims(req,res);
});
app.use('/', (req, res) => res.send("Welcome!"));
app.listen(process.env.PORT || 3000, () => console.log('Server is ready on localhost:' + process.env.PORT));

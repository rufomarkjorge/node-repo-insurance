var tesseract = require('node-tesseract');
const pool = require('./dbconnection');
const jwt = require('jsonwebtoken');
const fs = require('fs');

var options = {
    psm : 6,
    load_system_dawg: false,
    load_freq_dawg: false
};

var message = {
    "message": ""
};

module.exports = {
    verifyOCR: function (req, res) {
        const token = req.headers.token;
        var uid = jwt.verify(
          token.replace('Bearer ', ''),
          process.env.JWT_SECRET
          );
        var userid = uid.userid;
        var id = userid.replace("BEN","");
        var uploadir = __dirname+"/file_uploads" + "/"+id;
        var tmpath = req.files.file.path;
        var tmpname = tmpath.replace("models\\tmp_files\\","");
        var ogname = req.files.file.name;
        var newdir = uploadir+"/"+ogname;
        if (!fs.existsSync(uploadir)){
            fs.mkdirSync(uploadir);
        }
        var temp_dir = __dirname+"/tmp_files/"+tmpname;
        console.log(temp_dir);
        tesseract.process(temp_dir, options, function(err, text) {
            if(err) {
                console.error(err);
            } else {
                //check if birth certificate
                if (text.includes("BIRTH") == true){
                    message["message"] = "Birth Certificate Uploaded";
                    console.log(text);
                }
                //check if death certificate
                if (text.includes("DEATH") == true){
                    message["message"] = "Death Certificate Uploaded";
                    console.log(text);
                }
                fs.rename(temp_dir, newdir, function (err) {
                         if (err) throw err
                         console.log('Successfully moved!')
                       });
                return res.send(message);
            }
        });
        
    }

}



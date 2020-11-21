let express = require("express");
let app = express();
let bodyParser = require("body-parser");
var multer = require('multer');
var path = require("path");
var fs = require('fs');
var unzip = require('unzip');
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.get("/", function (req, res) {
    res.render("landing");
})
var storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, callback) {
        console.log(file);

        callback(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
        var walkPath = "/home/tapas/Desktop/kle test/uploads";
        var walk = function (dir, done) {
            fs.readdir(dir, function (error, list) {
                if (error) {
                    return done(error);
                }
                var i = 0;
                (function next() {
                    var file = list[i++];

                    if (!file) {
                        return done(null);
                    }

                    file = dir + '/' + file;

                    fs.stat(file, function (error, stat) {

                        if (stat && stat.isDirectory()) {
                            walk(file, function (error) {
                                next();
                            });
                        } else {

                            if (file.slice(-3) == "zip") {
                                var inputFileName = file;
                                console.log(inputFileName);
                                var extractToDirectory = '/home/tapas/Desktop/kle test/uploads';

                                fs.createReadStream(inputFileName)
                                    .pipe(unzip.Extract({
                                        path: extractToDirectory
                                    }))

                                fs.unlink(file, (err) => {
                                    if (err) {
                                        console.error(err)
                                        return
                                    }
                                });
                            }
                            next();
                        }
                    });
                })();
            });
        };
        process.argv.forEach(function (val, index, array) {
            if (val.indexOf('source') !== -1) {
                walkPath = val.split('=')[1];
            }
        });
        walk(walkPath, function (error) {
            if (error) {
                throw error;
            } else {
                console.log("finished");
            }
        });
    }
});

var upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        var target = "/home/tapas/Desktop/kle test/uploads"
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.zip') {
            return callback('error', 'Only images are allowed');
        }
        callback(null, true)
    }
}).array('files', 200);

app.get("/upload", function (req, res) {
    res.render("upload");
});
app.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            return res.send("Something went wrong:(");
        }
        res.send("Upload completed.");
    });
})


app.get("/contact",function(req,res){
   res.render("contact");
})
app.listen(2000, function () {
    console.log("server has started");
})
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
var axios = require("axios");
const e = require("cors");

module.exports.UPLOAD_FILE = async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      try {
        if (!files.file && !fields.text) {
          return res.json({
            msg: "Missing Required Field",
            status: 0,
          });
        }
        if (files.file) {
          var oldPath = files.file.path;
          var image_no = parseInt(fields.image_no);
          if (files.file.name) {
            var ext = path.extname(files.file.name || "").split(".");
            var ext = ext[ext.length - 1];
            var new_file_name = uuidv4() + "." + ext;
            var newPath =
              path.join(__dirname, "./uploads") + "/" + new_file_name;
            var rawData = fs.readFileSync(oldPath);
            fs.writeFileSync(newPath, rawData);
            var data = JSON.stringify({ image: newPath, image_no: image_no });
          }
        } else {
          var text = fields.text;
          image_no = parseInt(fields.image_no);
          var data = JSON.stringify({ text: text, image_no: image_no });
        }
        var config = {
          method: "post",
          url: "http://localhost:8081/ml",
          headers: {
            "Content-Type": "application/json",
          },
          data: data,
        };
        axios(config)
          .then(function (response) {
            console.log("response data:", response.data);
            if (response.data.images) {
              var dists = response.data.dists;
              var processed_file_data = [];
              response.data.images.map((oldPath) => {
                var ext = path.extname(oldPath || "").split(".");
                var ext = ext[ext.length - 1];
                var processed_file = uuidv4() + "." + ext;
                var processedPath =
                  path.join(__dirname, "./processed") + "/" + processed_file;
                // console.log("old path:", oldPath);
                // console.log("dir: ", __dirname);
                fs.copyFile(
                  oldPath,           // change it according to image relative path
                  processedPath,
                  function (err) {
                    if (err) {
                      return res.status(400).json({
                        msg: "Something Went Wrong From Our End",
                        status: 0,
                        err,
                      });
                    } else {
                      processed_file_data.push("processed/" + processed_file);
                      setTimeout(() => {
                        fs.unlinkSync(processedPath); // removing processed image after 15 minutes
                      }, 9000 * 1000);
                      if (
                        processed_file_data.length ==
                        response.data.images.length
                      ) {
                        if (files.file) fs.unlinkSync(newPath); // removing uploaded file
                        return res.status(200).json({
                          msg: "Successful",
                          processed_file_data,
                          status: 1,
                          dists,
                        });
                      }
                    }
                  }
                );
              });
            } else {
              return res.status(400).json({
                msg: "Something Went Wrong From Our End",
                status: 0,
              });
            }
          })
          .catch(function (error) {
            return res.status(400).json({
              msg: "Server Error",
              status: 0,
              error: error.message,
            });
          });
      } catch (err) {
        return res.status(500).json({
          msg: "Server Error",
          status: 0,
          error: error.message,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      msg: "Server Error",
      status: 0,
      error: error.message,
    });
  }
};

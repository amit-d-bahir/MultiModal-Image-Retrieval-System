var express = require("express");
var cors = require("cors");
var app = express();
var { UPLOAD_FILE } = require("./function");
app.use(cors());
app.use("/processed", express.static(__dirname + "/processed"));

app.get("/", (req, res) => {
  res.json({ msg: "Backend is running" });
});

app.post("/", UPLOAD_FILE);
app.listen(8080, () => {
  console.log("CORS-enabled web server listening on port 8080");
});

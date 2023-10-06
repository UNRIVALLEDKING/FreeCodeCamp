const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use("/public", express.static(__dirname + "/public"));

function middleware(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
}
app.use(middleware);
console.log("Hello World");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/json", (req, res) => {
  const message = "Hello json";
  const style = process.env.MESSAGE_STYLE;
  res.json({
    message: style === "uppercase" ? message.toUpperCase() : message,
  });
});

app.get(
  "/now",
  (req, res, next) => {
    req.time = new Date().toString();
    next();
  },
  (req, res) => {
    res.json({
      time: req.time,
    });
  },
);

app.get("/:word/echo", (req, res) => {
  const { word } = req.params;
  res.json({ echo: word });
});

app
  .route("/name")
  .get((req, res) => {
    const { first, last } = req.query;
    console.log("get req", first, last);
    res.json({ name: `${first} ${last}` });
  })
  .post((req, res) => {
    const { first, last } = req.body;
    console.log("post req", first, last);
    res.json({ name: `${first} ${last}` });
  });

module.exports = app;

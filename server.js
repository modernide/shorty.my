const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql')
//---------CONFIG-------//

var port = 8080

var con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.NAME,
  port: process.env.DBPORT
});
//----- END CONFIG -----//



http.createServer(function (req, res) {
  if (req.url == '/' || req.url == '/index.html') {
    fs.readFile('./views/index.html', function (error, content) {
      res.writeHead(200);
      res.end(content, 'utf-8');
    });
  } else if (req.url.startsWith("/create/")) {
    function checkDb() {
      var temp = Math.random().toString(36).substring(2, 7);
      con.query(`SELECT * FROM urls WHERE tagID = '${temp}'`, (err, results) => {
        if (err) throw err;
  
        if (results.length > 0) {
          checkDb()
        } else {
          con.query(`INSERT INTO urls (tagID, target) VALUES ('${temp}', '${decodeURIComponent(req.url.split('/create/?url=')[1])}')`, (err) => {
            if (err) throw err;
            res.write(`URL Shortened at localhost:8080/${temp}`)
            res.end();
          })
        }
      });
    }

    checkDb()

  } else if (req.url == '/tos') {
    fs.readFile('./views/tos.html', function (error, content) {
      res.writeHead(200);
      res.end(content, 'utf-8');
    });
  } else if (req.url == '/404') {
    fs.readFile('./views/404.html', function (error, content) {
      res.writeHead(200);
      res.end(content, 'utf-8');
    });
  } else if (req.url != '/favicon.ico') {
    con.query(`SELECT * FROM urls WHERE tagID = '${req.url.split('/')[1]}'`, (err, results) => {
      if (err) throw err;

      if (results.length > 0) {
        res.writeHead(302, { 'Location': results[0].target });
        res.end();
      } else {
        res.writeHead(302, { 'Location': '/404' });
        res.end();
      }
    });
  }
}).listen(port);

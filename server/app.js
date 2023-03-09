const express = require("express");
const axios = require("axios");
const mysql = require("mysql");
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const port = 3000;

const jsonParser = bodyParser.json();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});


const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});


app.get("/api/products", (req, res) => {
  const ean = req.query.code ?? '';
  const nazwa = req.query.name == 'undefined' ? false : req.query.name;
  const dateFrom = req.query.dateFrom == 'undefined' ? false : req.query.dateFrom;
  const dateTo = req.query.dateTo == 'undefined' ? false : req.query.dateTo;

  // `BETWEEN "${dateFrom}" AND "${dateTo}"`

  const sql = nazwa ? `SELECT * FROM test_kody WHERE ean = "${ean}" OR nazwa LIKE "%${nazwa}%"` : `SELECT * FROM test_kody WHERE ean = "${ean}" OR ean2 LIKE "%${ean}%"`;
  
  console.log(ean, nazwa, dateFrom, dateTo);
  db.query(sql, [ean, nazwa], (error, result) => {
    res.status(200).send(result);
    // console.log(result);
  })
});


app.post("/api/products", jsonParser, (req, res) => {
  const { ean } = req.body;
  

  const sql = `UPDATE test_kody SET ? WHERE ean = ?`;
  db.query(sql, [req.body, ean], (error, result) => {
    if (error) {
      throw error
    }
    console.log(req.body);
    res.status(201).send({ message: "Created" });
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const mysql = require("mysql2");

const connectDB = mysql.createConnection({
   host: process.env.HOST,
   user: process.env.USER,
   password: process.env.PASSWORD,
   database: process.env.DATABASE
});

connectDB.connect((err) => {
   if (err) throw err;
   console.log("Connect DB Success");
});

module.exports = connectDB;

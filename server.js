require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const DB = require("./db");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const queryDB = (sql, param) => {
   return new Promise((resolve, reject) => {
      DB.query(sql, param, (err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve(result);
         }
      });
   });
};

app.post("/todo", async (req, res) => {
   try {
      const { task } = req.body;
      const sql = "INSERT INTO todos (task) VALUE (?)";

      const result = await queryDB(sql, task);
      res.status(200).json({ message: result });
   } catch (err) {
      console.error(err);
      res.status(400).json({ message: err });
   }
});

app.get("/todo", async (req, res) => {
   try {
      const sql = "SELECT * FROM todos";

      const result = await queryDB(sql);
      res.status(200).json(result);
   } catch (err) {
      console.error(err);
      res.status(400).json({ message: err });
   }
});

app.delete("/todo/:id", async (req, res) => {
   try {
      const { id } = req.params;
      const sql = "DELETE FROM todos WHERE id = ?";
      
      const result = await queryDB(sql, id);

      if (result.affectedRows > 0) {
         res.status(200).json("REMOVE SCUUESS");
      } else {
         res.status(404).json("ID NOT FOUND");
      }
   } catch (err) {
      console.error(err);
   }
});

app.listen(3000, () => {
   console.log("http://localhost:3000/");
});

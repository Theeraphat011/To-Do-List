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

const migrateDatabase = async () => {
   try {
      console.log("Checking database schema...");
      const checkColumnSql = `
         SELECT COUNT(*) AS columnExists
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_NAME = 'todos'
         AND COLUMN_NAME = 'completed'
         AND TABLE_SCHEMA = DATABASE()`;
      
      const columnCheck = await queryDB(checkColumnSql);
      
      if (columnCheck[0].columnExists === 0) {
         console.log("Adding 'completed' column to todos table...");
         await queryDB("ALTER TABLE todos ADD COLUMN completed BOOLEAN DEFAULT false");
         console.log("Column 'completed' added successfully!");
      } else {
         console.log("Column 'completed' already exists");
      }
   } catch (err) {
      console.error("Database migration error:", err);
   }
};

migrateDatabase();

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

app.put("/todo/:id", async (req, res) => {
   try {
      const { task } = req.body;
      const { id } = req.params;
      const sql = "UPDATE todos SET task = ? WHERE id = ?";

      const result = await queryDB(sql, [task, id]);

      if (result.affectedRows > 0) {
         res.status(200).json("REMOVE SCUUESS");
      } else {
         res.status(404).json("ID NOT FOUND");
      }
   } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
   }
});

app.patch("/todo/:id/toggle", async (req, res) => {
   try {
      const { id } = req.params;
      const { completed } = req.body;
      
      const completedValue = completed === 'true' || completed === true ? 1 : 0;
      
      const sql = "UPDATE todos SET completed = ? WHERE id = ?";
      const result = await queryDB(sql, [completedValue, id]);

      if (result.affectedRows > 0) {
         res.status(200).json({ success: true, completed: !!completedValue });
      } else {
         res.status(404).json({ success: false, message: "Task not found" });
      }
   } catch (err) {
      console.error("Toggle task error:", err);
      res.status(500).json({ 
         success: false, 
         message: "Internal Server Error", 
         error: err.message 
      });
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

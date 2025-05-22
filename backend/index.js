const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",           // tu contraseña real de MySQL
  database: "WebMinijuegos"   // nombre de tu base de datos
});

db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    process.exit(1);
  }
  console.log("Conectado a MySQL");
});

// Ruta de registro
app.post("/registro", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );
    // Devolvemos el usuario creado (sin password)
    res.json({ success: true, user: { username, email } });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Usuario o email ya existen." });
  }
});

// Ruta de login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.error(err);
        return res.json({ success: false, message: "Error en la base de datos." });
      }
      if (results.length === 0) {
        return res.json({ success: false, message: "Usuario no encontrado." });
      }
      const user = results[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.json({ success: false, message: "Contraseña incorrecta." });
      }
      // Login exitoso
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }
  );
});

// Arrancar servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});

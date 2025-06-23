// Importa el framework Express
const express = require("express");

// Importa el middleware CORS para permitir solicitudes de diferentes orígenes
const cors = require("cors");

// Importa el cliente MySQL para conectarse a la base de datos
const mysql = require("mysql2");

// Importa bcrypt para hashear contraseñas de forma segura
const bcrypt = require("bcrypt");

// Importa body-parser para interpretar el cuerpo de las solicitudes en formato JSON
const bodyParser = require("body-parser");

// Crea una instancia de la aplicación Express
const app = express();

// Usa CORS como middleware
app.use(cors());

// Usa bodyParser para interpretar JSON en las solicitudes
app.use(bodyParser.json());

// Configura la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: "localhost",         // Dirección del servidor de base de datos
  user: "root",              // Usuario de MySQL
  password: "root",          // Contraseña de MySQL
  database: "WebMinijuegos"  // Nombre de la base de datos
});

// Intenta conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err);
    process.exit(1); // Finaliza la aplicación si no se puede conectar
  }
  console.log("Conectado a MySQL");
});

// Ruta para registrar un nuevo usuario
app.post("/registro", async (req, res) => {
  const { username, email, password } = req.body; // Extrae los datos del cuerpo de la solicitud
  try {
    // Hashea la contraseña con un "salt" de 10 rondas
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el nuevo usuario en la base de datos
    const [result] = await db
      .promise()
      .execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [username, email, hashedPassword]
      );

    // Devuelve los datos del usuario sin incluir la contraseña
    res.json({ success: true, user: { username, email } });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Usuario o email ya existen." });
  }
});

// Ruta para login de usuario
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Busca el usuario por email en la base de datos
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

      // Compara la contraseña ingresada con el hash almacenado
      const match = await bcrypt.compare(password, user.password_hash);

      if (!match) {
        return res.json({ success: false, message: "Contraseña incorrecta." });
      }

      // Si la contraseña es correcta, devuelve los datos del usuario
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }
  );
});

// Ruta para obtener estadísticas de un usuario en un juego específico
app.get("/estadisticas/:userId/:gameId", async (req, res) => {
  const { userId, gameId } = req.params; // Obtiene los parámetros de la URL

  try {
    // Consulta las puntuaciones del usuario para ese juego, ordenadas por fecha
    const [rows] = await db.promise().execute(
      `SELECT score, achieved_at FROM scores WHERE user_id = ? AND game_id = ? ORDER BY achieved_at DESC`,
      [userId, gameId]
    );

    res.json({
      success: true,
      puntuaciones: rows
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error al consultar estadísticas." });
  }
});

// Ruta para guardar una nueva puntuación
app.post("/guardar-puntuacion", async (req, res) => {
  const { user_id, game_id, score } = req.body;

  // Verifica que todos los datos estén presentes
  if (!user_id || !game_id || score === undefined) {
    return res.json({ success: false, message: "Datos incompletos" });
  }

  try {
    // Inserta la nueva puntuación en la base de datos
    await db
      .promise()
      .execute(
        "INSERT INTO scores (user_id, game_id, score) VALUES (?, ?, ?)",
        [user_id, game_id, score]
      );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error al guardar puntuación" });
  }
});

// Inicia el servidor en el puerto 3001
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});

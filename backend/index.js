// index.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // Cambia si tienes otro usuario
    password: 'root',       // Pon tu contraseña real o '' si no tienes
    database: 'WebMinijuegos'
  });
  
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor backend funcionando!');
});

app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});

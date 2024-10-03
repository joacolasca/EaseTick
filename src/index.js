const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');
const TicketRouter = require('./controllers/ticketController')
const dotenv = require('dotenv').config();

const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware'); // Para proteger rutas en el futuro

const app = express();
const port = process.env.PORT || 5000;

console.log(process.env.PORT)

app.use(cors());
app.use(express.json());
app.use("/front", express.static("public"));

// Ruta de login
app.post('/api/login', authController.login);

// Ejemplo de ruta protegida
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username}` });
});

app.use('/tickets', TicketRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
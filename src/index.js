const express = require('express');
const cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const bodyParser = require('body-parser'); 
const { createServer } = require('http');
const { Server } = require('socket.io');
const TicketRouter = require('./controllers/ticketController')
const TicketService = require('./services/ticketService');
const dotenv = require('dotenv').config();


const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware'); // Para proteger rutas en el futuro

const userController = require('./controllers/userController');
const usuarioController = require('./controllers/usuarioController');
const httpServer = createServer(app);

const port = process.env.PORT || 5000;

console.log(process.env.PORT)

app.use(cors({
    origin: 'http://localhost:3000', // o tu origen del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use("/front", express.static("public"));
app.use('/tickets', TicketRouter);
app.use('/users', userController);
app.use('/usuarios', usuarioController);
app.use('/users', userController);
app.use('/usuarios', usuarioController);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-chat', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`Usuario ${socket.id} se unió al chat del ticket ${ticketId}`);
  });

  socket.on('leave-chat', (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
    console.log(`Usuario ${socket.id} dejó el chat del ticket ${ticketId}`);
  });

  socket.on('new-message', async (data) => {
    try {
      const ticketService = new TicketService();
      const mensaje = await ticketService.enviarMensaje(
        data.ticketId,
        data.userId,
        data.message,
        data.isEmployee
      );

      io.to(`ticket-${data.ticketId}`).emit('message-received', mensaje);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  socket.on('close-ticket', async (data) => {
    console.log('Cerrando ticket:', data.ticketId);
    try {
      const ticketRepo = new TicketRepository();
      const ticket = await ticketRepo.cerrarTicket(data.ticketId);
      io.to(`ticket-${data.ticketId}`).emit('ticket-closed', ticket);
    } catch (error) {
      console.error('Error al cerrar ticket:', error);
      socket.emit('ticket-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Ruta de login
app.post('/api/login', authController.login);

// Ejemplo de ruta protegida
app.get('/api/dashboard', authMiddleware, (req, res) => {
  res.json({ message: `Bienvenido ${req.user.username}` });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

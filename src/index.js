const express = require('express');
const bodyParser = require('body-parser'); 
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const TicketRouter = require('./controllers/ticketController')
const TicketService = require('./services/ticketService');
const dotenv = require('dotenv').config();


const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware'); // Para proteger rutas en el futuro

const userController = require('./controllers/userController');
const usuarioController = require('./controllers/usuarioController');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware para logging de conexiones
io.use((socket, next) => {
  console.log('Cliente intentando conectar:', socket.id);
  next();
});

// Hacer io disponible para los controladores
app.set('io', io);

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

  socket.on('send-message', async (data) => {
    try {
      const ticketService = new TicketService();
      
      let archivo = null;
      if (data.archivo && data.archivo.data) {
        const buffer = Buffer.from(data.archivo.data, 'base64');
        archivo = {
          buffer: buffer,
          mimetype: data.archivo.type,
          originalname: data.archivo.name,
          size: data.archivo.size
        };
      }

      const mensaje = await ticketService.enviarMensaje(
        data.ticketId,
        data.userId,
        data.contenido,
        data.isEmployee,
        archivo
      );

      // Emitir el mensaje a todos los clientes en la sala
      io.to(`ticket-${data.ticketId}`).emit('message-received', mensaje);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      socket.emit('message-error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });

  socket.on('error', (error) => {
    console.error('Error de socket:', error);
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

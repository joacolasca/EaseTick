const express = require('express');
const cors = require('cors');
const TicketRouter = require('./controllers/ticketController')
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

console.log(process.env.PORT)

app.use(cors());
app.use(express.json());
app.use("/front", express.static("public"));

app.use('/tickets', TicketRouter);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
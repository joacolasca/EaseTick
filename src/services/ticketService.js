const TicketRepository = require('../repositories/ticketRepositories.js');

class TicketService {
    async obtenerTicketsDeEmpleado() {
        const result = await TicketRepository.obtenerTicketsDeEmpleado();
        return result
    }
}

module.exports = TicketService;
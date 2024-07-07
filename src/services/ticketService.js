const TicketRepository = require('../repositories/ticketRepositories');

class TicketService {
    obtenerTicketsDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsSinResolverDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsSinResolverDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsResueltosDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsResueltosDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsVencenHoyDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsVencenHoyDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
}

module.exports = TicketService;
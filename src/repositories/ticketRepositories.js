const supabase = require('../configs/supabase');

class TicketRepository {
    async obtenerTicketsDeEmpleado(id) {
        const {data, error} = await supabase
        .from('ticket')
        .select()
        .eq('fkusuario', id)
        if(error) console.error(error)
        else return data
    }
    async obtenerTicketsSinResolverDeEmpleado(id) {
        const {data, error} = await supabase
        .from('ticket')
        .select(`
            *,
            estado:estado (nombre)
        `)
        .eq('fkusuario', id)
        .eq('estado.nombre', 'abierto')
        if(error) console.error(error)
        else return data
    }
    async obtenerTicketsResueltosDeEmpleado(id) {
        const {data, error} = await supabase
        .from('ticket')
        .select(`
            *,
            estado:estado (nombre)
        `)
        .eq('fkusuario', id)
        .eq('estado.nombre', 'cerrado')
        if(error) console.error(error)
        else return data
    }
    async obtenerTicketsVencenHoyDeEmpleado(id) {
        const {data, error} = await supabase
        .from('ticket')
        .select(`
            *,
            prioridad:prioridad (caducidad)
        `)
        .eq('fkusuario', id)
        if(error) console.error(error)
        else {
            const ticketsVencenHoy = data.filter(ticket => {
                const fechaCreacion = new Date(ticket.fechacreacion);
                const fechaVencimiento = new Date(fechaCreacion);
                fechaVencimiento.setDate(fechaVencimiento.getDate() + ticket.prioridad.caducidad);
                return fechaVencimiento.getTime() === hoy.getTime();
            });
            return ticketsVencenHoy;
        }
    }
}
export default TicketRepository;
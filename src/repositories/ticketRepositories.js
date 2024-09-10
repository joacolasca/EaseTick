const supabase = require('../configs/supabase');
class TicketRepository {
    obtenerTicketsDeEmpleado = async (id) => {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id);

            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error(`Error en obtenerTicketsDeEmpleado: ${error.message}`);
            throw error;
        }
    }

    async obtenerTicketsSinResolverDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*, prioridad:prioridad(nombre)')
                .eq('fkusuario', id)
                .eq('fkestado', 1);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error en obtenerTicketsSinResolverDeEmpleado: ${error.message}`);
            throw error;
        }
    }

    async obtenerTicketsResueltosDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id)
                .eq('fkestado', 2);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error en obtener Tickets Resueltos De Empleado: ${error.message}`);
            throw error;
        }
    }

     
    async obtenerTicketsVencenHoyDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id)
                .in('fkprioridad', (await supabase.from('prioridad').select('id').eq('caducidad', new Date().toISOString().split('T')[0])).data.map(row => row.id))
            
            if (error) {
                throw new Error(error.message);
            }
    
            return data;
        } catch (error) {
            console.error(`Hubo un error al obtener los tickets que vencen hoy: ${error.message}`);
            throw error;
        }
    }
    async obtenerFeedbackDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('calificacion')
                .select('puntaje')
                .eq('fkusuario', id);
    
            if (error) {
                throw new Error(error.message);
            }
    
            const totalResenas = data.length;
            let positivo = 0;
            let neutral = 0;
            let negativo = 0;
    
            data.forEach(item => {
                if (item.puntaje == 1 || item.puntaje == 2) {
                    negativo++;
                } else if (item.puntaje == 3) {
                    neutral++;
                } else if (item.puntaje == 4 || item.puntaje == 5) {
                    positivo++;
                }
            });
    
            const porcentajePositivo = Math.round((positivo / totalResenas) * 100);
            const porcentajeNeutral = Math.round((neutral / totalResenas) * 100);
            const porcentajeNegativo = Math.round((negativo / totalResenas) * 100);
    
            return {
                total: totalResenas,
                positivo: porcentajePositivo,
                neutral: porcentajeNeutral,
                negativo: porcentajeNegativo
            };
        } catch (error) {
            console.error(`Hubo un error al obtener el feedback del empleado: ${error.message}`);
            throw error;
        }
    }
    async obtenerPorcentajeTicketsResueltos(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('fechafinalizado')
                .eq('fkusuario', id)
             if (error) {
                throw new Error(error.message);
            }
            const TotalTickets = data.length
            let ticketsResueltos = 0;
            let ticketsNoResueltos = 0;
            data.forEach(item => {
                if (item.fechafinalizado != null) ticketsResueltos++;
                else ticketsNoResueltos++;
            });
            const NoResueltos = Math.round((ticketsNoResueltos / TotalTickets) * 100);
            const Resueltos = Math.round((ticketsResueltos / TotalTickets) * 100);
            return{
                Tickets: TotalTickets,
                NoRealizados: NoResueltos,
                Realizados: Resueltos
            }
        } catch (error) {
            console.error(`Hubo un error al obtener los tickets que vencen hoy: ${error.message}`);
            throw error;
        }
    }
    async obtenerDetalleDeTicketDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select(`
                    asunto,
                    fechacreacion,
                    empresa:fkempresa(nombre),
                    estado:fkestado(nombre),
                    prioridad:fkprioridad(nombre, caducidad),
                    usuario:fkusuario(nombre)
                `)
                .eq('fkusuario', id);
                
            if (error) {
                throw new Error(error.message);
            }
    
            return data;
        } catch (error) {
            console.error(`Error en obtenerDetalleDeTicketDeEmpleado: ${error.message}`);
            throw error;
        }
    }
    

    async obtenerTicketsPorDiaDeLaSemana(id) {
        try {
            // Obtener la fecha actual
            const hoy = new Date();
            // Obtener el día de la semana (0 = Domingo, 6 = Sábado)
            const diaSemana = hoy.getDay();
            // Calcular la fecha del último domingo
            const ultimoDomingo = new Date(hoy);
            ultimoDomingo.setDate(hoy.getDate() - diaSemana);
            // Calcular la fecha del lunes anterior al último domingo
            const ultimoLunes = new Date(ultimoDomingo);
            ultimoLunes.setDate(ultimoDomingo.getDate() - 6);
    
            // Ajustar la fecha de inicio a la medianoche del último lunes
            ultimoLunes.setHours(0, 0, 0, 0);
            // Ajustar la fecha de fin a las 23:59:59 del último domingo
            ultimoDomingo.setHours(23, 59, 59, 999);
    
            console.log('Último Lunes:', ultimoLunes);
            console.log('Último Domingo:', ultimoDomingo);
    
            const { data, error } = await supabase
                .from('ticket')
                .select('id, fechacreacion')
                .eq('fkusuario', id)
                .gte('fechacreacion', ultimoLunes.toISOString())
                .lte('fechacreacion', ultimoDomingo.toISOString());
    
            if (error) {
                throw new Error(error.message);
            }
    
            // Mapeo de los días de la semana a las letras correspondientes
            const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    
            // Inicializar el objeto para contar los tickets por día de la semana
            const ticketsPorDia = {
                'D': 0, // Domingo
                'L': 0, // Lunes
                'M': 0, // Martes
                'X': 0, // Miércoles
                'J': 0, // Jueves
                'V': 0, // Viernes
                'S': 0  // Sábado
            };
    
            data.forEach(ticket => {
                const diaSemanaNumerico = new Date(ticket.fechacreacion).getDay();
                const diaSemanaLetra = diasSemana[diaSemanaNumerico];
                ticketsPorDia[diaSemanaLetra]++;
            });
    
            console.log('Tickets por día:', ticketsPorDia);
    
            return ticketsPorDia;
        } catch (error) {
            console.error(`Error en obtenerTicketsPorDiaDeLaSemana: ${error.message}`);
            throw error;
        }
    }

    async obtenerTicketsResueltosPorDiaDeLaSemana(id) {
        try {
            // Obtener la fecha actual
            const hoy = new Date();
            // Obtener el día de la semana (0 = Domingo, 6 = Sábado)
            const diaSemana = hoy.getDay();
            // Calcular la fecha del último domingo
            const ultimoDomingo = new Date(hoy);
            ultimoDomingo.setDate(hoy.getDate() - diaSemana);
            // Calcular la fecha del lunes anterior al último domingo
            const ultimoLunes = new Date(ultimoDomingo);
            ultimoLunes.setDate(ultimoDomingo.getDate() - 6);
    
            // Ajustar la fecha de inicio a la medianoche del último lunes
            ultimoLunes.setHours(0, 0, 0, 0);
            // Ajustar la fecha de fin a las 23:59:59 del último domingo
            ultimoDomingo.setHours(23, 59, 59, 999);
    
            console.log('Último Lunes:', ultimoLunes);
            console.log('Último Domingo:', ultimoDomingo);
    
            // Consulta para obtener los tickets resueltos (fechafinalizado) durante la última semana
            const { data, error } = await supabase
                .from('ticket')
                .select('id, fechafinalizado')
                .eq('fkusuario', id)
                .not('fechafinalizado', 'is', null) // Aseguramos que tengan fecha de finalización
                .gte('fechafinalizado', ultimoLunes.toISOString())
                .lte('fechafinalizado', ultimoDomingo.toISOString());
    
            if (error) {
                throw new Error(error.message);
            }
    
            // Mapeo de los días de la semana a las letras correspondientes
            const diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    
            // Inicializamos el contador de tickets por día con letras
            const ticketsResueltosPorDia = {
                'D': 0, // Domingo
                'L': 0, // Lunes
                'M': 0, // Martes
                'X': 0, // Miércoles
                'J': 0, // Jueves
                'V': 0, // Viernes
                'S': 0  // Sábado
            };
    
            // Recorremos los tickets y los contamos por día de la semana usando las letras
            data.forEach(ticket => {
                const diaSemanaResuelto = new Date(ticket.fechafinalizado).getDay();
                const diaSemanaLetra = diasSemana[diaSemanaResuelto];
                ticketsResueltosPorDia[diaSemanaLetra]++;
            });
    
            console.log('Tickets resueltos por día:', ticketsResueltosPorDia);
    
            return ticketsResueltosPorDia;
        } catch (error) {
            console.error(`Error en obtenerTicketsResueltosPorDiaDeLaSemana: ${error.message}`);
            throw error;
        }
    }
    
    
    async obtenerCantidadTicketsPorPrioridad(id) {
        try {
            // Consultar cantidad de tickets de prioridad Baja
            const { data: bajaData, error: bajaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 1); // Asumiendo que la prioridad Baja tiene el ID 1
    
            if (bajaError) {
                throw new Error(bajaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Media
            const { data: mediaData, error: mediaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 2); // Asumiendo que la prioridad Media tiene el ID 2
    
            if (mediaError) {
                throw new Error(mediaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Alta
            const { data: altaData, error: altaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 3); // Asumiendo que la prioridad Alta tiene el ID 3
    
            if (altaError) {
                throw new Error(altaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Urgente
            const { data: urgenteData, error: urgenteError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 4); // Asumiendo que la prioridad Urgente tiene el ID 4
    
            if (urgenteError) {
                throw new Error(urgenteError.message);
            }
    
            // Devolver el conteo de cada prioridad
            return {
                Baja: bajaData.length,
                Media: mediaData.length,
                Alta: altaData.length,
                Urgente: urgenteData.length
            };
        } catch (error) {
            console.error(`Error en obtenerCantidadTicketsPorPrioridad: ${error.message}`);
            throw error;
        }
    }
    
    
    async obtenerPorcentajeTicketsPorEstado(id) {
        try {
            // Obtener el total de tickets del empleado
            const { data: totalData, error: totalError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id);
    
            if (totalError) {
                throw new Error(totalError.message);
            }
    
            const totalTickets = totalData.length;
    
            // Verificar si el empleado tiene tickets
            if (totalTickets === 0) {
                return {
                    abiertos: 0,
                    cerrados: 0,
                    esperandoRespuesta: 0
                };
            }
    
            // Obtener cantidad de tickets en estado Abierto (ej. fkestado 1)
            const { data: abiertosData, error: abiertosError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 1); // Suponiendo que '1' es el estado Abierto
    
            if (abiertosError) {
                throw new Error(abiertosError.message);
            }
    
            // Obtener cantidad de tickets en estado Cerrado (ej. fkestado 2)
            const { data: cerradosData, error: cerradosError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 2); // Suponiendo que '2' es el estado Cerrado
    
            if (cerradosError) {
                throw new Error(cerradosError.message);
            }
    
            // Obtener cantidad de tickets en estado Esperando respuesta del cliente (ej. fkestado 3)
            const { data: esperandoData, error: esperandoError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 3); // Suponiendo que '3' es el estado Esperando respuesta del cliente
    
            if (esperandoError) {
                throw new Error(esperandoError.message);
            }
    
            // Calcular porcentajes
            const porcentajeAbiertos = Math.round((abiertosData.length / totalTickets) * 100);
            const porcentajeCerrados = Math.round((cerradosData.length / totalTickets) * 100);
            const porcentajeEsperando = Math.round((esperandoData.length / totalTickets) * 100);
    
            return {
                abiertos: porcentajeAbiertos,
                cerrados: porcentajeCerrados,
                esperandoRespuesta: porcentajeEsperando
            };
        } catch (error) {
            console.error(`Error en obtenerPorcentajeTicketsPorEstado: ${error.message}`);
            throw error;
        }
    }
    
    
}

module.exports = TicketRepository;

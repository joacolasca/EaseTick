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
            const hoy = new Date();
            const diaSemana = hoy.getDay();
    
            // Calcular la fecha del último domingo
            const ultimoDomingo = new Date(hoy);
            ultimoDomingo.setDate(hoy.getDate() - diaSemana);
    
            // Calcular la fecha del lunes anterior al último domingo
            const ultimoLunes = new Date(ultimoDomingo);
            ultimoLunes.setDate(ultimoDomingo.getDate() - 6);
    
            // Ajustar las horas para representar correctamente el rango de fechas
            ultimoLunes.setHours(0, 0, 0, 0);
            ultimoDomingo.setHours(23, 59, 59, 999);
    
            // Convertir las fechas al formato 'YYYY-MM-DD' que acepta PostgreSQL
            const fechaInicio = ultimoLunes.toISOString().slice(0, 10);
            const fechaFin = ultimoDomingo.toISOString().slice(0, 10);
    
            console.log('Último Lunes (inicio):', fechaInicio);
            console.log('Último Domingo (fin):', fechaFin);
    
            // Ejecutar la consulta con las fechas en formato correcto
            const { data, error } = await supabase
                .from('ticket')
                .select('id, fechacreacion')
                .eq('fkusuario', id)
                .gte('fechacreacion', fechaInicio)
                .lte('fechacreacion', fechaFin);
    
            if (error) {
                throw new Error(error.message);
            }
    
            const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    
            const ticketsPorDia = {
                'D': 0, 'L': 0, 'M': 0, 'X': 0, 'J': 0, 'V': 0, 'S': 0
            };
    
            data.forEach(ticket => {
                const fechaTicket = new Date(ticket.fechacreacion);
                // Mover la fecha del ticket un día adelante
                fechaTicket.setDate(fechaTicket.getDate() + 1);
                const diaSemanaNumerico = fechaTicket.getDay();
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
            const hoy = new Date();
            const diaSemana = hoy.getDay();
    
            // Calcular la fecha del último domingo
            const ultimoDomingo = new Date(hoy);
            ultimoDomingo.setDate(hoy.getDate() - diaSemana);
    
            // Calcular la fecha del lunes anterior al último domingo
            const ultimoLunes = new Date(ultimoDomingo);
            ultimoLunes.setDate(ultimoDomingo.getDate() - 6);
    
            // Ajustar las horas para representar correctamente el rango de fechas
            ultimoLunes.setHours(0, 0, 0, 0);
            ultimoDomingo.setHours(23, 59, 59, 999);
    
            // Convertir las fechas al formato 'YYYY-MM-DD' que acepta PostgreSQL
            const fechaInicio = ultimoLunes.toISOString().slice(0, 10);
            const fechaFin = ultimoDomingo.toISOString().slice(0, 10);
    
            console.log('Último Lunes (inicio):', fechaInicio);
            console.log('Último Domingo (fin):', fechaFin);
    
            // Ejecutar la consulta con las fechas en formato correcto
            const { data, error } = await supabase
                .from('ticket')
                .select('id, fechafinalizado')
                .eq('fkusuario', id)
                .not('fechafinalizado', 'is', null)
                .gte('fechafinalizado', fechaInicio)
                .lte('fechafinalizado', fechaFin);
    
            if (error) {
                throw new Error(error.message);
            }
    
            const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    
            const ticketsResueltosPorDia = {
                'D': 0, 'L': 0, 'M': 0, 'X': 0, 'J': 0, 'V': 0, 'S': 0
            };
    
            data.forEach(ticket => {
                const fechaTicket = new Date(ticket.fechafinalizado);
                // Mover la fecha del ticket un día adelante
                fechaTicket.setDate(fechaTicket.getDate() + 1);
                const diaSemanaResuelto = fechaTicket.getDay();
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
    async obtenerCantidadTicketsPorTipo(id) {
        
            // Consultar cantidad de tickets de prioridad Baja
            const { data: preguntaData, error: preguntaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 1); // Asumiendo que la prioridad Baja tiene el ID 1
    
            if (preguntaError) {
                throw new Error(preguntaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Media
            const { data: incidenteData, error: incidenteError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 2); // Asumiendo que la prioridad Media tiene el ID 2
    
            if (incidenteError) {
                throw new Error(incidenteError.message);
            }
            const { data: sugerenciaData, error: sugerenciaError } = await supabase
            .from('ticket')
            .select('id')
            .eq('fkusuario', id)
            .eq('fktipo', 3); // Asumiendo que la prioridad Urgente tiene el ID 4

        if (sugerenciaError) {
            throw new Error(sugerenciaError.message);
        }
            // Consultar cantidad de tickets de prioridad Alta
            const { data: mantenimientoData, error: mantenimientoError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 4); // Asumiendo que la prioridad Alta tiene el ID 3
    
            if (mantenimientoError) {
                throw new Error(mantenimientoError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Urgente
            
            try {
                const { data: reclamoData, error: reclamoError } = await supabase
                    .from('ticket')
                    .select('id')
                    .eq('fkusuario', id)
                    .eq('fktipo', 5); // Asumiendo que la prioridad Baja tiene el ID 1
        
                if (reclamoError) {
                    throw new Error(reclamoError.message);
                }
            // Devolver el conteo de cada prioridad
            return {
                Pregunta: preguntaData.length,
                Incidente: incidenteData.length,
                Sugerencia: sugerenciaData.length,
                Mantenimiento: mantenimientoData.length,
                Reclamo: reclamoData.length
            };
        } catch (error) {
            console.error(`Error en obtenerCantidadTicketsPorPrioridad: ${error.message}`);
            throw error;
        }
    }
async obtenerCalificacionesPorUsuario(id) {
    try {
        const { data, error } = await supabase
            .from('calificacion')
            .select('puntaje')
            .eq('fkusuario', id);

        if (error) {
            throw new Error(error.message);
        }

        let puntajeUno = 0;
        let puntajeDos = 0;
        let puntajeTres = 0;
        let puntajeCuatro = 0;
        let puntajeCinco = 0;

        data.forEach(item => {
            if (item.puntaje == 1) {
                puntajeUno++;
            } else if (item.puntaje == 2) {
                puntajeDos++;
            } else if (item.puntaje == 3) {
                puntajeTres++;
            } else if (item.puntaje == 4) {
                puntajeCuatro++;
            } else if (item.puntaje == 5) {
                puntajeCinco++;
            }
        });

        return {
            1: puntajeUno,
            2: puntajeDos,
            3: puntajeTres,
            4: puntajeCuatro,
            5: puntajeCinco,

        };
    } catch (error) {
        console.error(`Hubo un error al obtener la cantidad de calificaciones por usuario: ${error.message}`);
        throw error;
    }
}
async agregarRecordatorio(texto, fkusuario) {
    try {
        console.log("Datos para insertar:", texto, fkusuario); // Verifica qué datos estás enviando a la BD
        
        const { data, error } = await supabase
            .from('recordatorio')
            .insert([{ texto, fkusuario }]);

        if (error) {
            console.error(`Error al agregar recordatorio: ${error.message}`);
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al agregar recordatorio: ${error.message}`);
        throw error;
    }
}

// Obtener todos los recordatorios de un usuario
async obtenerRecordatorios(fkusuario) {
    try {
        const { data, error } = await supabase
            .from('recordatorio')
            .select('*')
            .eq('fkusuario', fkusuario);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al obtener recordatorios: ${error.message}`);
        throw error;
    }
}

// Eliminar un recordatorio
async eliminarRecordatorio(id) {
    try {
        const { data, error } = await supabase
            .from('recordatorio')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al eliminar recordatorio: ${error.message}`);
        throw error;
    }
}

    
async obtenerEmpresaAsignadaAlUsuario(idUsuario) {
    try {
        const { data, error } = await supabase
            .from('usuario')
            .select(`
                fkempresa,
                empresa(
                    nombre,
                    tipo,
                    correoelectronico
                )
            `)
            .eq('id', idUsuario); // Buscamos el usuario con su ID

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error en obtenerEmpresaAsignadaAlUsuario: ${error.message}`);
        throw error;
    }
}
}
module.exports = TicketRepository;

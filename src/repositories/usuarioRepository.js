const supabase = require('../configs/supabase');

const findUsuarioByCorreoElectronico = async (correoelectronico) => {
    const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('correoelectronico', correoelectronico) 
        .single(); 
    if (error) {
        console.error('Error obteniendo usuario:', error);
        throw error;
    }

    return data;
};

module.exports = {
    findUsuarioByCorreoElectronico
};




export const sortObjectsList =(lista,propiedad) =>{
    const compareProperty = setCompareProPerty(propiedad)
    lista.sort(compareProperty)
    return lista
}

const setCompareProPerty = (propiedad) => {
    // Closure para almacenar la propiedad para ordenar
    return (item1, item2) =>{
        // Funcion de comparación entre dos elementos para ordenar una lista
            if (item1[propiedad] < item2[propiedad]) {
                return -1;
            }
            if (item1[propiedad] > item2[propiedad]) {
                return 1;
            }
            return 0;
        }
}

export const makeSublistByProperty = (lista,prop) => {
    /**
     * Funcion que construye un arreglo de arreglos agrupando por la propiedad que se recibe como argumento
     */
    // Objeto para almacenar los sub arreglos
    let grupos = {};
    // Itera sobre la arreglo de objetos y agrupa por la propiedad  recibida como argumento
    lista.forEach((objeto) => {
        let property = objeto[prop];
        if (!grupos[property]) {
        grupos[property] = []; // Crea un nuevo arreglo si no existe
        }
        grupos[property].push(objeto); // Agrega el objeto a la sub arreglo correspondiente
    });
    // Convierte el objeto de grupos en un arreglo de arreglos
    let sublistas = Object.values(grupos);
    // Resultado
   return sublistas
}


export const makeMasterDetailObject = (sublista, ...propertiesToMaster)=>{
    /** 
     *  Funcion para construir un objeto maestro-detalle a partir de una lista de objetos recibe rest params que determina las propiedades que se extreaeran y 
    *  se colocan como propiedades de master
    */
    const master = {}; // Objeto que se construira a partir de la lista de objetos
    const detalles = [] // Lista que contendra los detalles cons
    const propertiesToDetails = [] // Lista que se llenara con las propiedades que contendran los detalles

    sublista.forEach((objeto,index)=>{
        if (index == 0){
            for(let key in objeto ){
                /**
                 * Se llena la lista de las propiedades de los objetos detalle
                 */
                if( !propertiesToMaster.includes(key) ) {
                    propertiesToDetails.push(key)
                } 
            }
            propertiesToMaster.forEach((prop) =>{
                /**
                 * Se construyen las propiedades del master
                 */
                master[prop] = objeto[prop]
            })  
        }
        let detalle = {} // Objeto que contendra el detalle
        propertiesToDetails.forEach((prop)=>{
            /**
             * Se construye el objeto detale
             */
            detalle[prop] = objeto[prop]
        })
        detalles.push(detalle) //Se agrega el detalle a los detalles

    })
    master['detalles'] = detalles // Se agregan lod detalles al master
    return master
}


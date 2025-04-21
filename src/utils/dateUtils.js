


export const tiempoDesde = (fechaStr) =>{
    const fechaTime = Date.parse(fechaStr)
    const currentTime = Date.parse(new Date()) 
    const hours =  Math.floor((currentTime-fechaTime)/1000/60/60)
    const hoursMinutes = (currentTime-fechaTime)/1000/60/60
    const minutesEx =  Math.floor((hoursMinutes - hours)*60)
    return {
        horas: hours,
        minutos: minutesEx
    }
}

export const tiempoDesdeStr = (fechaStr)=>{
    const timeObj = tiempoDesde(fechaStr)
    let horas = ""
    let minutos = ""
    if(timeObj.horas){
        if(timeObj.horas === 1){
            horas = `${timeObj.horas} hora`
        }else{
            horas = `${timeObj.horas} horas`
        }
    }
    if(timeObj.minutos){
        if(timeObj.minutos === 1){
            minutos = `${timeObj.minutos} minuto`
        }else{
            minutos = `${timeObj.minutos} minutos`
        }
    }
    if(timeObj.horas || timeObj.minutos){
        return `Hace ${horas} ${minutos}`
    }else{
        return "Justo ahora"
    }
   
}

export const tiempoTranscurrido = (fechaStr)=>{
    const timeObj = tiempoDesde(fechaStr)
    let horas = ""
    let minutos = ""
    if(timeObj.horas){
        if(timeObj.horas === 1){
            horas = `${timeObj.horas} hora`
        }else{
            horas = `${timeObj.horas} horas`
        }
    }
    if(timeObj.minutos){
        if(timeObj.minutos === 1){
            minutos = `${timeObj.minutos} minuto`
        }else{
            minutos = `${timeObj.minutos} minutos`
        }
    }
    if(timeObj.horas || timeObj.minutos){
        return `${horas} ${minutos}`
    }else{
        return "Justo ahora"
    }
   
}

export const tiempoEntre = (fechaIni, fechaFin) =>{
    const fechaTime = Date.parse(fechaIni)
    const currentTime = Date.parse(fechaFin) 
    const hours =  Math.floor((currentTime-fechaTime)/1000/60/60)
    const hoursMinutes = (currentTime-fechaTime)/1000/60/60
    const minutesEx =  Math.floor((hoursMinutes - hours)*60)
    return {
        horas: hours,
        minutos: minutesEx
    }
}

export const tiempoEntreStr = (fechaIni, fechaFin)=>{
    const timeObj = tiempoEntre(fechaIni,fechaFin)
    let horas = ""
    let minutos = ""
    if(timeObj.horas){
        if(timeObj.horas === 1){
            horas = `${timeObj.horas} hora`
        }else{
            horas = `${timeObj.horas} horas`
        }
    }
    if(timeObj.minutos){
        if(timeObj.minutos === 1){
            minutos = `${timeObj.minutos} minuto`
        }else{
            minutos = `${timeObj.minutos} minutos`
        }
    }
    if(timeObj.horas || timeObj.minutos){
        return `${horas} ${minutos}`
    }else{
        return ""
    }
   
}

export const changeDate = (dateStr) =>{
   const newDate=  new Date(dateStr.substring(0, 10).replace(/-/g, '\/'))
   return newDate
}

export const changeDateFormat = (dateStr) =>{
    const partesFecha = dateStr.split("-")
    const fecha = `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}`
    return fecha 
}


export const changeDateStr = (dateStr) =>{
    /**
     * Cambia el formato de la fecha de yyyy-mm-dd a dd-mm-yyyy
     */
    if (dateStr){
        console.log("--",dateStr)
        const partesFecha = dateStr.split("-")
        console.log(partesFecha[2],
            partesFecha[1],
            partesFecha[0]
        );
        const newDate = new Date(`${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`)
        console.log("**",newDate)
        return newDate.toLocaleDateString()
    }else{
        return ""
    }
 }



export const formatDate = (inputDate) =>  {
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son indexados desde 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export const  formatDateTime = (input) => {

    if(!input){
        return ""
    }
    // Crear un objeto Date a partir de la cadena de entrada
    const date = new Date(input);
    

    // Obtener los componentes de la fecha
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Formatear y retornar la fecha
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
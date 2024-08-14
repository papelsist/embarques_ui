


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


export const changeDateStr = (dateStr) =>{
    /**
     * Cambia el formato de la fecha de yyyy-mm-dd a dd-mm-yyyy
     */
    if (dateStr){
        const partesFecha = dateStr.split("-")
        const newDate = new Date(`${partesFecha[2]}-${partesFecha[1]}-${partesFecha[0]}`)
        return newDate.toLocaleDateString()
    }else{
        return ""
    }
   

 }
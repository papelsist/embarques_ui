import React, {useState } from 'react';
import { ContextRuteo } from './ContextRuteo';



const RuteoProvider = ({children}) =>{
    const [ruteo, setRuteo] = useState(null);
    const [rutas, setRutas] = useState(null);
    const [outliers, setOutliers] = useState(null);
    const [noAsignados, setNoAsignados] = useState(null);

    const contextIni = {
        ruteo,
        setRuteo: (r)=> setRuteo(r),
        rutas,
        setRutas: (r)=> setRutas(r),
        outliers,
        setOutliers: (o)=>setOutliers(o),
        noAsignados,
        setNoAsignados: (n)=>setNoAsignados(n)
    }

    return (
        <ContextRuteo.Provider value={contextIni}>
            {children}
        </ContextRuteo.Provider>
    )
}


export default RuteoProvider;
import React, {useState } from 'react';
import  { ContextEmbarques } from './ContextEmbarques';


const EmbarquesProvider = ({children}) =>{
    const contextIni = {
        sucursal:"Tacuba"
    }
    return (
        <ContextEmbarques.Provider value={contextIni}>
            {children}
        </ContextEmbarques.Provider>
    )
}

export default EmbarquesProvider;

import React, {useState } from 'react';
import  { ContextChofer } from './ContextChofer';


const ChoferProvider = ({children}) =>{
    const contextIni = {}
    return (
        <ContextChofer.Provider value={contextIni}>
            {children}
        </ContextChofer.Provider>
    )
}

export default ChoferProvider;

import React, { useContext, useEffect, useState } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { objectIsEmpty } from '../../utils/embarqueUtils';
import { useNavigate } from 'react-router-dom';
import { ContextEmbarques } from '../../context/ContextEmbarques';

import "./Embarques.css"
import GraficaEmbarques from './components/GraficaEmbarques';
import PeriodoLabel from '../../components/periodo_date_picker/PeriodoLabel';
import PeriodoDatepicker from '../../components/periodo_date_picker/PeriodoDatePicker';
import Mapa from '../../components/map/Mapa';
import OperadoresEmbarques from './components/OperadoresEmbarques';
import IncidenciasEmbarque from './components/IncidenciasEmbarque';
import PromediosEmbarques from './components/PromediosEmbarques';

const Embarques = () => {
    const {auth} = useContext(ContextEmbarques);
    const navigate = useNavigate()
    const [center, setCenter] = useState({latitud: 19.410050,longitud: -99.099976 });

  
    useEffect(() => {
        if(!objectIsEmpty(auth)){
            navigate("../../login")
        }
    }, []);

    const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July','ago','rere','erte','htrytut'];
    const datos = [1000,300,1500,2800,345,807,546,980,654,924,123]
    
    const datos2 = [10,330,800,650,798,911,230,643,823,421,937]

    return (
        <div className='embarques_container'>
            <header className='header_container'>
                <h2>Tablero de Control Embarques</h2>
                <PeriodoLabel />
            </header>
            <section className='graph-main_container'>
                <GraficaEmbarques labels={labels} datos={datos}  label={'Dataset 1'} bc={'rgb(255, 99, 132)'} bck={'rgba(255, 99, 132, 0.5)'}/>
                <GraficaEmbarques labels={labels} datos={datos2}  label={'Dataset 2'} bc={'rgb(156, 39, 176)'} bck={'rgba(218, 126, 234, 0.5)'}/>
            </section>
            <main className="data_container">
                <section className='data-section_container'>
               <IncidenciasEmbarque />
                </section>
                <section className="data-section_container">
                    <PromediosEmbarques />
                    <PromediosEmbarques />
                </section>
                <section className="data-section_container">
                    <OperadoresEmbarques />
                </section>
            </main>
        </div>
     
   
        
    );
}

export default Embarques;

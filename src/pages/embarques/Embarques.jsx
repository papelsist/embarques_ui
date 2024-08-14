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
import GraficaKilosOperador from './components/GraficaKilosOperador';
import GraficaKilosOperador2 from './components/GraficaKilosOperador2';
import axios from 'axios';
import { apiUrl } from '../../conf/axios_instance';

const Embarques = () => {
    const {auth,sucursal} = useContext(ContextEmbarques);
    const navigate = useNavigate()
    const [center, setCenter] = useState({latitud: 19.410050,longitud: -99.099976 });
    const hoy = new Date().toISOString().slice(0, 10);
    const [periodo, setPeriodo] = useState({fecha_inicial: hoy, fecha_final: hoy})

    const validate_auth = async() =>{
        if (auth.rol != 'controlador'){
            navigate(`../../login`)
        }
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}get_user`
                const resp = await axios.get(url, {
                    params:{}, 
                    headers: { Authorization: `Bearer ${auth.access}` }
                })
            }catch(error){
                if (error.response.status == 401){
                    console.log('No esta autenticado')
                    localStorage.removeItem('auth')
                    setAuth({})
                    navigate("/login", {replace: true})

                }
            }
            
        }else{
            console.log('No esta autenticado')
            navigate(`../../login`)
        } 
    }
  
    useEffect(() => {
        console.log('Validando autenticacion')
        validate_auth()
    }, []);


    return (
        <div className='embarques_container'>
            <header className='header_container'>
                <h2>Tablero de Control Embarques</h2>
               {/*  <PeriodoLabel /> */}
                <PeriodoDatepicker setPeriodo={setPeriodo} periodo={periodo} />

            </header>
            <section className='graph-main_container'>  
            <GraficaKilosOperador periodo={periodo} />           
             
             <GraficaKilosOperador2  periodo={periodo}/>


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

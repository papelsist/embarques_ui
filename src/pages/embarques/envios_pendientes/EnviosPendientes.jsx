import React, {useState, useEffect,useContext} from 'react';
import EnviosPendientesTable from './components/EnviosPendientesTable';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { objectIsEmpty } from '../../../utils/embarqueUtils';
import { apiUrl } from '../../../conf/axios_instance';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';


const EnviosPendientes = () => {
  
    const [datos, setDatos] = useState([]);
    const {periodo, auth, sucursal, setLoading} = useContext(ContextEmbarques);
    const navigate = useNavigate()
   
    const getData = async ()=>{
       
        setLoading(true)
        if(objectIsEmpty(auth)){
           try{
                const url = `${apiUrl.url}embarques/envios_pendientes` 
                   
                const resp = await axios.get(url, 
                    {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final,sucursal: sucursal.nombre },
                     headers: { Authorization: `Bearer ${auth.access}` }
                    })
                setDatos(resp.data)
                console.log(resp.data)
                setLoading(false)
               
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                    setLoading(false)
            }}
            setLoading(false)
        }else{
            console.log('No esta autenticado')
            navigate(`../../login`)
            setLoading(false)
            
        } 
       

    }
   
   useEffect(() => {
        getData()
    }, [periodo]);

    
    return (
        <div>
          <EnviosPendientesTable datos={datos}  getData={getData} setDatos={setDatos} /> 
        </div>
    );
}

export default EnviosPendientes;

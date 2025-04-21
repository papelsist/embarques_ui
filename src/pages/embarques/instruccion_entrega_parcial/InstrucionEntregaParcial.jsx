import React, {useState, useEffect,useContext} from 'react';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { objectIsEmpty } from '../../../utils/embarqueUtils';
import { apiUrl } from '../../../conf/axios_instance';
import InstruccionEntregaTable from './components/InstruccionEntregaTable';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './InstruccionEntregaParcial.css';

const InstrucionEntregaParcial = () => {
    
    const navigate = useNavigate()
    const [datos, setDatos] = useState([]);
    const {periodo, auth, sucursal, setLoading} = useContext(ContextEmbarques);

   
    const getData = async ()=>{
      
        setLoading(true)
        if(objectIsEmpty(auth)){
            
           try{
                const url = `${apiUrl.url}embarques/instruccion_entrega/` 
                const params ={fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final,sucursal: sucursal.nombre }
                const resp = await axios.get(url, 
                    {params:params,
                     headers: { Authorization: `Bearer ${auth.access}` }
                    })

                
                setDatos(resp.data)
                setLoading(false)
             
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                    setLoading(false)
            }}
                    
            setLoading(false)
        }else{
           
            navigate(`../../login`)
            setLoading(false)
            
        } 
       

    }

    useEffect(() => {
       
          getData()
     }, [periodo]);

    return (
        <div>
            <InstruccionEntregaTable datos={datos}  getData={getData} setDatos={setDatos}  />
        </div>
    );
}

export default InstrucionEntregaParcial;

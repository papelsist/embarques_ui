import React, {useEffect, useState,useContext} from 'react';
import PasanTable from './components/PasanTable';
import axios from 'axios';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { apiUrl } from '../../../conf/axios_instance';
import { useNavigate } from 'react-router-dom';
const Pasan = () => {
    const navigate  = useNavigate()
    const [datos, setDatos] = useState([]);
    const {periodo, auth, sucursal} = useContext(ContextEmbarques)
    const getData = async() =>{
        try{
            const url = `${apiUrl.url}embarques/embarques_pasan`
            const resp = await axios.get(url, 
                {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final,sucursal: sucursal.id },
                 headers: { Authorization: `Bearer ${auth.access}` }
                })
            setDatos(resp.data)
        }catch(error){
            if(error.response?.status === 401){
                navigate(`../../login`)
            } 
        }
    }

    useEffect(() => {
       getData()
    }, [periodo]);

    return (
        <div>
            <PasanTable datos={datos}  getData={getData}/>
            
           
        </div>
    );
}

export default Pasan;

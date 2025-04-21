import React,{useContext, useEffect, useState} from 'react';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios'
import { ContextEmbarques } from '../../context/ContextEmbarques';
import IncidenciasTable from './components/IncidenciasTable';
import { useNavigate } from 'react-router-dom';
import { objectIsEmpty } from '../../utils/embarqueUtils';


const Incidencias = () => {

    const {auth,setAuth} = useContext(ContextEmbarques)
    const [datos, setDatos] = useState([])
    const hoy = new Date().toISOString().slice(0, 10);
    const [periodo, setPeriodo] = useState({fecha_inicial: hoy, fecha_final: hoy})
    const navigate = useNavigate()

    const getData =async()=>{
        
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}embarques/entregas_incidencias`
                const resp = await axios.get(url, 
                {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final},
                    headers: { Authorization: `Bearer ${auth.access}` }
                })
                setDatos(resp.data)
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
            navigate("/login", {replace: true})
        } 
    }


    useEffect(() => {
        getData()
    }, [periodo])


    return (
        <div>
            <IncidenciasTable datos={datos} getData={getData} periodo={periodo} setPeriodo={setPeriodo} />
        </div>
    );
}

export default Incidencias;


import React, {useState, useEffect,useContext} from 'react';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { objectIsEmpty } from '../../../utils/embarqueUtils';
import { apiUrl } from '../../../conf/axios_instance';
import EnviosParcialesTable from './components/EnviosParcialesTable';
import axios from 'axios';

const EnviosParciales = () => {

    const [datos, setDatos] = useState([]);
    const {periodo, auth, sucursal, setLoading} = useContext(ContextEmbarques);

   
    const getData = async ()=>{
      
        setLoading(true)
        if(objectIsEmpty(auth)){
            
           try{
                const url = `${apiUrl.url}embarques/envios_parciales` 
                const params ={fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final,sucursal: sucursal.nombre }
                console.log(params);
                const resp = await axios.get(url, 
                    {params:params,
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
             <EnviosParcialesTable datos={datos}  getData={getData} setDatos={setDatos}  />
        </div>
    );
}

export default EnviosParciales;

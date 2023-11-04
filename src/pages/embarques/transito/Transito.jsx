import React,{useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { apiUrl } from '../../../conf/axios_instance';
import TransitoTable from './components/TransitoTable';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { useNavigate } from 'react-router-dom';

const Transito = () => {

    const navigate = useNavigate()
    const {auth,sucursal} = useContext(ContextEmbarques);
    const [datos, setDatos] = useState([]);

    const getData = async() =>{
        try{
            const url = `${apiUrl.url}embarques/transito`
            const resp = await axios.get(
                url, 
                {
                    params:{sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                }
                )
            setDatos(resp.data)
        }catch(error){
            if(error.response?.status === 401){
                navigate(`../../login`)
            } 
        }
    }

    useEffect(() => {
       getData()
    }, []);

    return (
        <div>
            <TransitoTable getData={getData} datos={datos} />
        </div>
    );
}

export default Transito;
 
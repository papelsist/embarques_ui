import React,{useState, useEffect, useContext} from 'react';

import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import {Fab, Dialog, Box} from '@mui/material';
import CreateEmbarqueForm from './asignaciones_form/CreateEmbarqueForm';

import { apiUrl } from '../../../conf/axios_instance';
import AsignacionesTable from './components/AsignacionesTable';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { useNavigate } from 'react-router-dom';
import { objectIsEmpty } from '../../../utils/embarqueUtils';



const Asignaciones = () => {

    const {auth,sucursal} = useContext(ContextEmbarques);
    const [openDialog, setOpenDialog] = useState(false);
    const [datos, setDatos] = useState([]);
    const navigate = useNavigate()      

    const getData = async() =>{
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}embarques/pendientes_salida`
                const resp = await axios.get(url,{
                    params: {sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                } )
                setDatos(resp.data)
            }catch(error){
                if(error.response?.status === 401){
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
       getData()
    }, []);


    return (
        <div>
            <AsignacionesTable datos={datos} getData ={getData} />
            <Fab 
                color="primary" aria-label="add"  
                sx={{position: "fixed",bottom: (theme) => theme.spacing(10),right: (theme) => theme.spacing(10)}}
               onClick={()=>{setOpenDialog(true)}}
            >
                <AddIcon  sx={{fontSize:35}} />
            </Fab>
            <Dialog open={openDialog} onClose={()=>{setOpenDialog(false)}}  >
              <CreateEmbarqueForm setOpenDialog={setOpenDialog}  getData={getData} /> 
            </Dialog>
        </div>
    );
}

export default Asignaciones;

import React,{useState, useEffect} from 'react';

import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import {Fab, Dialog, Box} from '@mui/material';
import CreateEmbarqueForm from './asignaciones_form/CreateEmbarqueForm';

import { apiUrl } from '../../../conf/axios_instance';
import AsignacionesTable from './components/AsignacionesTable';



const Asignaciones = () => {

    const [openDialog, setOpenDialog] = useState(false);
    const [datos, setDatos] = useState([]);

    const getData = async() =>{
        const url = `${apiUrl.url}embarques/pendientes_salida`
        const resp = await axios.get(url)
        setDatos(resp.data)
    }

    useEffect(() => {
       getData()
    }, []);


    return (
        <div>
            <AsignacionesTable datos={datos} />
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

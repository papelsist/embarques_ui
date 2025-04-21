import React, {useState} from 'react';
import {Box, Divider, Typography, Grid, Button, TextField} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import Swal from 'sweetalert2';


const DireccionInstruccionClave = ({destinatario, setDireccion, instruccion,setOpenDialogClave, envio_id}) => {

    const [clave, setClave] = useState('');


    const handleClave = (e) => {
        setClave(e.target.value);
    
    }

    const handleAgregarDireccion = async() => {
        if(!clave){
            return;

        }
        const url = `${apiUrl.url}embarques/crear_direccion_envio/`;
        const data = {
            envio_id,
            clave: clave.toUpperCase()
        }
        //setOpenDialogClave(false);
        const response = await axios.post(url, data);

        if(response.data){
            setDireccion(response.data);
            setOpenDialogClave(false);
            
        }
    }



    return (
        <Box sx={{width:800, height:300, padding:1}}>
            <Box sx={{height:'14%'}}>
                <Box display="flex" width={'100%'}  height={'100%'}>
                    
                        <Typography   color='primary' align='center' width={'100%'}>
                           Agregar direccion para  {destinatario}
                        </Typography>
                   
                </Box>
                <Divider sx={{marginBottom:2}}/>
            </Box>
            <Box sx={{height:'65%'}}>
                {
                    instruccion && (
                    
                            <Grid container display="flex" width={'100%'}>
                                <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                    <Typography color='primary'>
                                        Calle: {instruccion.direccion_calle} Ext. {instruccion.direccion_numero_exterior} {instruccion.direccion_numero_interior ? `Int. ${instruccion.direccion_numero_interior}` :''} Col. {instruccion.direccion_colonia} Mun. {instruccion.direccion_municipio} Edo. {instruccion.direccion_estado} C.P.{instruccion.direccion_codigo_postal}
                                    </Typography>
                                </Grid>
                                <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                                    <Typography color='warning'>
                                        Asignar clave a la dirección
                                    </Typography>
                                </Grid>
                                <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                                    <TextField  variant="standard" name = "claveDireccion" label = "Clave" onChange={handleClave} fullWidth /> 
                                </Grid>
                                <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                                    <Button onClick={handleAgregarDireccion} startIcon={<AddCircleOutlineIcon />} disabled={!clave}> Agregar a Direcciones </Button>
                                 </Grid>
                            </Grid>
                    )
                }
            </Box>
            <Divider sx={{marginBottom:2}}/>
            <Box sx={{height:'14%', width:'100%', justifyContent:'center', alignItems:'center'}}>
                <Button onClick={()=>{setOpenDialogClave(false)}}> Salir</Button>
            </Box>
        </Box>
    );
}

export default DireccionInstruccionClave;

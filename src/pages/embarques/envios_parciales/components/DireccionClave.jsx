import React, {useState} from 'react';
import {Box, Divider, Typography, Grid, Button, TextField} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';

const DireccionClave = ({destinatario, setDireccion, direcc,setOpenDialog}) => {

    const [clave, setClave] = useState('');


    const handleClave = (e) => {
        setClave(e.target.value);
    
    }

    const handleAgregarDireccion = async() => {
        if(!clave){
            return;

        }
        const url = `${apiUrl.url}embarques/crear_direccion_entrega/`;
        const data = {
            clave: clave.toUpperCase(),
            destinatario: destinatario.toUpperCase(),
            calle: (direcc.calle).toUpperCase(),
            numero_exterior: direcc.numero_exterior,
            numero_interior: direcc.numero_interior,
            colonia: (direcc.colonia).toUpperCase(),
            codigo_postal: direcc.codigo_postal,
            municipio: (direcc.municipio).toUpperCase(),
            estado: (direcc.estado).toUpperCase(),
            pais: (direcc.pais).toUpperCase(),
            latitud: 0.0000000,
            longitud: 0.0000000,
            version: 0,
        }
     

        const response = await axios.post(url, data);

        if(response.data){
            setDireccion(response.data);
            setOpenDialog(false);
            
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
                    direcc && (
                    
                            <Grid container display="flex" width={'100%'}>
                                <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                    <Typography color='primary'>
                                        Calle: {direcc.calle} Ext. {direcc.numero_exterior} {direcc.numero_interior ? `Int. ${direcc.numero_interior}` :''} Col. {direcc.colonia} Mun. {direcc.municipio} Edo. {direcc.estado} C.P.{direcc.codigo_postal}
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
                <Button onClick={()=>{setOpenDialog(false)}}> Salir</Button>
            </Box>
        </Box>
    );
}

export default DireccionClave;

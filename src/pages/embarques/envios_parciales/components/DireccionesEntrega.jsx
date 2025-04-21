import React, {useEffect,useState} from 'react';
import {Typography, Dialog, Divider, Box, Grid, TextField, IconButton, Button, Tooltip,
    Accordion, AccordionSummary, AccordionDetails,FormControlLabel, Checkbox
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';


const DireccionesEntrega = ({destinatario, setOpenDialog, setDireccion, instruccion,setOpenDialogClave, setOpenDialogDir}) => {

    const [direcciones, setDirecciones] = useState([]);

    const getData = async () => {
        
        const url = `${apiUrl.url}embarques/get_direcciones_entrega`;
        const params = {
            destinatario
        }
        const response = await axios.get(url, {params});

        if(response.data){
            setDirecciones(response.data);
        }

    }

    const handleSeleccion = (direccion) => {
        setDireccion(direccion);
    }

    const AgregarDireccionInstruccion =  () => {
        setOpenDialog(false);
        setOpenDialogClave(true);

    }

    const AgregarDireccion = () => {
        setOpenDialog(false);
        setOpenDialogDir(true);
    }


    useEffect(() => {
        getData();
    }, []);




    return (
        <Box sx={{width:800, height:600, padding:1}}>
            <Box sx={{height:'14%'}}>
            <Grid container display="flex" width={'100%'}  height={'100%'}>
                <Grid  item xs={12} display="flex" justifyContent="start" alignItems="center"  >
                    <Typography   color='primary' align='center' width={'100%'}>
                        {destinatario}
                    </Typography>
                </Grid>
                <Grid  item xs={12} display="flex" justifyContent="start" alignItems="center"  >

                </Grid>
            </Grid>
            </Box>
            <Divider sx={{marginBottom:2}}/>
            <Box  sx={{height:'76%', overflow:'auto'}} >
                {
                    direcciones.length === 0 && (
                        <Grid container display="flex" width={'100%'}>
                            <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                <Typography color='warning'>
                                    No hay direcciones registradas para el destinatario
                                </Typography>
                            </Grid>
                        </Grid>
                        
                
                    )
                }
                {
                    direcciones.length === 0 && instruccion && (
                    
                            <Grid container display="flex" width={'100%'}>
                                <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                    <Typography color='primary'>
                                        Calle: {instruccion.direccion_calle} Ext. {instruccion.direccion_numero_exterior} {instruccion.direccion_numero_interior ? `Int. ${instruccion.direccion_numero_interior}` :''} Col. {instruccion.direccion_colonia} Mun. {instruccion.direccion_municipio} Edo. {instruccion.direccion_estado} C.P.{instruccion.direccion_codigo_postal}
                                    </Typography>
                                </Grid>
                                <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                    <Button onClick={AgregarDireccionInstruccion} startIcon={<AddCircleOutlineIcon />}> Agregar a Direcciones </Button>
                                </Grid>
                            </Grid>
                            
                            
                       
                    )
                }
                {
                    direcciones.length != 0  && (
                        <Grid container display="flex" width={'100%'}>
                            <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                <Button onClick={AgregarDireccion} startIcon={<AddCircleOutlineIcon />}> Agregar Direccion </Button>
                            </Grid>
                        </Grid>
                    )
                }
                {
                    direcciones && direcciones.map((direccion) => (
                        <Accordion key= {direccion.id}>
                            <AccordionSummary>
                            <Grid container display="flex" width={'100%'}  height={'100%'}>
                                <Grid  item xs={4} display="flex" justifyContent="start" alignItems="center"  >
                                    <Typography   color='primary'>
                                        {direccion.clave}
                                    </Typography>
                                </Grid>
                                <Grid  item xs={4} display="flex" justifyContent="start" alignItems="center"  >
                                    <Typography   color='primary'>
                                        {direccion.calle}
                                    </Typography>
                                </Grid>
                                <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                    <Typography   color='primary'>
                                        {direccion.principal ? 'PREFERIDA' : ''}    
                                    </Typography>
                                </Grid>
                            </Grid>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box>
                                    <FormControlLabel control={<Checkbox  name='seleccion' onChange={()=>{handleSeleccion(direccion)}}/>} label="Seleccionar"  />    
                                </Box>
                                <Grid container display="flex" width={'100%'}  height={'100%'}>
                                    <Grid  item xs={4} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Calle: {direccion.calle}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={2} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Ext: {direccion.numero_exterior}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={2} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Int: {direccion.numero_interior}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={4} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Col: {direccion.colonia}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           C.P.: {direccion.codigo_postal}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Mun.: {direccion.municipio}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Edo.: {direccion.estado}
                                        </Typography>
                                    </Grid>
                                    <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                        <Typography  >
                                           Pais: {direccion.Pais}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </AccordionDetails>
                        </Accordion>
                    ))
                }
                
            </Box>
            <Box>
            <Button onClick={()=>{setOpenDialog(false)}}> Salir</Button>
            </Box>
        </Box>
    );
}

export default DireccionesEntrega;

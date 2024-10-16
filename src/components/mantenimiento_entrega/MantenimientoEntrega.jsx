import React,{useState, useContext} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { Box, Button, FormControlLabel,Checkbox, Divider, Grid, IconButton, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { formatDate } from '../../utils/dateUtils';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios';
import Swal from 'sweetalert2';

import "./MantenimientoEntrega.css"

const MantenimientoEntrega = ({setOpenDialog}) => {

    const [entrega, setEntrega] = useState(null);
    const [message, setMessage] = useState(null);
    const [documento, setDocumento] = useState(null);
    const [embarque, setEmbarque] = useState(null);
    const [cancelarArribo, setCancelarArribo] = useState(false);
    const [cancelarRecepcion, setCancelarRecepcion] = useState(false);
    const {auth,sucursal} = useContext(ContextEmbarques);


    const handleChangeDocumento= (e) =>{
        setDocumento(e.target.value)
    }

    const handleChangeEmbarque= (e) =>{
        setEmbarque(e.target.value)

    }

    const handleCheckBox=(e)=>{
        if (e.target.name === 'checkRecepcion'){
            if(e.target.checked){
                setCancelarRecepcion(e.target.checked)
            }else{
                setCancelarRecepcion(e.target.checked)
                if(!cancelarArribo){
                    setCancelarArribo(e.target.checked)
                }
            }
        }

        if (e.target.name === 'checkArribo'){
            if(e.target.checked){
                setCancelarArribo(e.target.checked)
                if(entrega.recepcion){
                    setCancelarRecepcion(e.target.checked)
                }
            }else{
                setCancelarArribo(e.target.checked)
                
            }
               
        }
    }

    const handleSalir = ()=>{
        setOpenDialog(false)
        setEntrega(null)
        setMessage(null)
        setDocumento(null)
        setEmbarque(null)  
        setCancelarArribo(false)
        setCancelarRecepcion(false)
    }

    const handleSalvar = async()=>{
        const url = `${apiUrl.url}embarques/actualizar_bitacora_entrega/`
        const data = {
            entrega_id: entrega.id,
            cancelar_arribo: cancelarArribo,
            cancelar_recepcion: cancelarRecepcion
        }
        handleSalir()
        const resp = await axios.put(url,data,{headers: { Authorization: `Bearer ${auth.access}` }})
        console.log(resp.data);
        Swal.fire(`${resp.data.message}`)
    }

 

    const getData = async()=>{
        setEntrega(null)
        const url = `${apiUrl.url}embarques/search_entrega/`
        const params = {
            documento: documento,
            embarque: embarque,
            sucursal: sucursal.nombre
        }
        const resp = await axios.get(url,{params:params, headers: { Authorization: `Bearer ${auth.access}` }})

        setMessage(resp.data.message)
        console.log(resp.data);
        if (resp.data.message == 'Entrega encontrada'){
            setEntrega(resp.data.data)
        }
        
    }

    return (
        <div className='manttoentrega-form-container '>
             <Paper sx={{height: '100%',display:'flex',flexDirection:'column',justifyContent:'space-between'   }}  elevation={0}>
             <Box component={'div'} sx={{height:'25%'}}>
                    <Typography fontSize={20}>Mantenimiento Bitacora Entrega</Typography>
                    <Divider />
                    <Grid container columnSpacing={2}>
                        <Grid item xs={5}>
                            <TextField label="Documento" value={documento} name="documento" variant="standard"  fullWidth onChange={handleChangeDocumento} />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField  label="Embarque" value={embarque} name="embarque" variant="standard"  fullWidth  onChange={handleChangeEmbarque} />
                        </Grid>
                        <Grid item xs={2}>
                            <Tooltip title="Buscar Entrega">
                                <IconButton color="primary" aria-label="Buscar Embarque" component="span" onClick={getData}>
                                    <SearchIcon />
                                </IconButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Box>
                
                <Box component={'div'}sx={{height:'60%'}}>
                    <Divider />
                    {

                        message &&
                        <Grid container columnSpacing={2}   sx={{ marginBottom:1,
                            display: 'flex',
                                '& .MuiTextField-root': { mr: 1},
                            }}>
                            <Grid item xs={12}>
                                <Typography variant="h6" align='center' color={ message === 'Entrega no encontrada' ? "error" : "primary"} >{message}</Typography>
                            </Grid>
                            {
                                entrega &&
                                (
                                <>  
                                    <Grid item xs={12}>
                                        <Typography  align='center' fullWidth  >{entrega.destinatario}</Typography>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Typography  align='center' > Docto: {entrega.documento}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography  align='center' > Fecha: {formatDate(entrega.fecha_documento)}</Typography>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Typography  align='center' > Tipo: {entrega.origen}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography  align='center' fullWidth  >{entrega.operador}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sx={{height:'1rem'}}></Grid>
                                    <Grid item xs={12} sx={{display:'flex', alignItems:'center'}}>
                                        <Typography align='left'  sx={{width:'80%'}} > Arribo:  {entrega.arribo}</Typography>
                                        <FormControlLabel sx={{width:'20%'}} control={<Checkbox name = "checkArribo" checked={cancelarArribo} disabled ={!entrega.arribo} onChange={handleCheckBox}/>} labelPlacement="start" label="Cancelar" />
                                    </Grid>
                                    <Grid item xs={12} sx={{display:'flex', alignItems:'center'}}>
                                        <Typography  align='left' sx={{width:'80%'}}  > Recepcion:  {entrega.recepcion}</Typography>
                                        <FormControlLabel sx={{width:'20%'}} control={<Checkbox name = "checkRecepcion" checked={cancelarRecepcion} disabled ={!entrega.recepcion   } onChange={handleCheckBox}/>} labelPlacement="start" label="Cancelar" />
                                    </Grid>
                                </>
                                )
                                
                            }

                        </Grid>

                    }

                </Box>
                <Box component={'div'}sx={{height:'15%'}}>
                    <Divider />
                    <Box sx={{ display:'flex', justifyContent: 'space-around'}}>
                        <Button  sx={{mr:8, ml:5 }} onClick={handleSalvar} disabled = {!entrega} >Salvar</Button>
                        <Button onClick={handleSalir} >Salir</Button>
                    </Box>
                    
                </Box>
               
             </Paper>
            
        </div>
    );
}

export default MantenimientoEntrega;

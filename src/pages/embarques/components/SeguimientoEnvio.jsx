import React, {useState, useContext} from 'react';
import {Typography, CardActionArea, Dialog, Divider, Box, Grid, TextField, IconButton, Button, List,ListItem, ListSubheader} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';
import { formatDate, changeDateFormat } from '../../../utils/dateUtils';
import Swal from 'sweetalert2';
import { ContextEmbarques } from '../../../context/ContextEmbarques';

const SeguimientoEnvio = ({setOpenDialogSeguimiento}) => {
    
    const [openDialog, setOpenDialog] = useState(false);
    const [fechaDocumento, setFechaDocumento] = useState(dayjs());
    const [documento, setDocumento] = useState(null);
    const [message, setMessage] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const {sucursal} = useContext(ContextEmbarques);
    const [destinatario, setDestinatario] = useState(null); 

    const onCloseDialog = ()=>{
  
        setOpenDialogSeguimiento(false);
        setFechaDocumento(dayjs());
        setMessage(null);
        setDocumento(null);
        setDestinatario(null);
        setEntregas([]);
    }


    const handleDocumento = (e)=>{
        setDocumento(e.target.value);
    }


    const handleMessage = (mensaje) => {
        console.log("Handle Message");
        setMessage(mensaje);
        setTimeout(() => {
            setMessage(null);
        }, 3000);

    }


    const getEntregas = async ()=>{

        console.log(documento);
        console.log(sucursal);

        if(!documento  || !sucursal){
            console.log("Busqueda no realizada");
            handleMessage("Favor de llenar los campos");
            return;
        }
        setEntregas([]);
        const url = `${apiUrl.url}embarques/seguimiento_envio?`;
        const params = {
            documento: documento,
            fecha: fechaDocumento.format('YYYY-MM-DD'),
            sucursal: sucursal.nombre,
        }
        console.log(params);
            try{
                const response = await axios.get(url, {params: params});
            
                if(response.data){
                    console.log(response.data);
                    setEntregas(response.data);
                    setDestinatario(response.data[0].destinatario);
                }else{
                
                    handleMessage("No se encontro el envio");
                    setEntregas(null);
                }
            }catch(error){
                console.log(error);
                handleMessage("Error al buscar el envio");
            }
        
    }



    return (
        <>
            <Box sx={{width:'100%', height:600, padding:2}}>
                    <Box>
                    <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                        <Grid  item xs={4}   >
                            <Typography variant="h6" component="div"  sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                                Segumiento de Envíos
                            </Typography>    
                        </Grid>  
                        <Grid  item xs={3} >
                            <TextField  variant="standard" name = "Documento" label = "Documento" fullWidth onChange={handleDocumento}/> 
                               
                        </Grid> 
                        <Grid  item xs={4}  >
                            <DatePicker   
                                label="Fecha Documento"
                                value={fechaDocumento} 
                                onChange={(fechaDocumento)=>{setFechaDocumento(fechaDocumento)}} 
                                slotProps={{ textField: { variant: 'standard' } }}
                            />
                        </Grid> 
                        <Grid  item xs={1}  justifyContent="center" alignItems="center"   >
                                <IconButton color='primary' onClick={getEntregas}>
                                    <SearchIcon/>
                                </IconButton>
                        </Grid> 

                    </Grid>
                    <Divider sx={{marginTop:1, marginBottom:1}} />
                </Box>
                <Box>
                    <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                        {
                            message &&
                            (
                                <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center" height={'100%'} >
                                    <Typography variant="h6" component="div" color='error' sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                                        {message}
                                    </Typography>
                                </Grid>
                            )  
                        }
                    </Grid>
                </Box>
               
                <Box>
                    { entregas.length > 0 && 
                    (<Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                        <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center" height={'100%'} >
                            <Typography variant="h6" component="div" color='primary' sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                                {destinatario}
                            </Typography>
                        </Grid>

                    </Grid>)
                    }
                </Box>
                <Divider />
                <Box sx={{ height:480, width:900, overflow:'auto'}}>
                    {
                        entregas.map((entrega)=>(
                            <Accordion key={entrega.id}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
                                    id="panel1-header"
                                    >
                                    <Grid container display="flex" width={'100%'}  height={'100%'}>
                                        <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                            <Typography   color='primary'>
                                                Emb: {entrega.embarque}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={6} display="flex" justifyContent="start" alignItems="center"  >
                                            <Typography color='primary'>
                                                Op: {entrega.operador}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={3} display="flex" justifyContent="end" alignItems="center"  >
                                            <Typography  color='primary'>
                                                Fecha: {changeDateFormat(entrega.embarque_fecha)}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'} >
                                            <Typography sx={{fontSize:12}}>
                                                SALIDA
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                ARRIBO
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'} >
                                            <Typography sx={{fontSize:12}}>
                                                RECEPCION
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                REGRESO
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={4} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                RECIBIO
                                            </Typography>
                                        </Grid>

                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                {entrega.salida}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                {entrega.arribo}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                {entrega.recepcion}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={2} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                {entrega.regreso}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={4} display="flex" alignItems="center" justifyContent={'center'}  >
                                            <Typography sx={{fontSize:12}}>
                                                {entrega.recibio}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>
                                <AccordionDetails>
                                <Divider />
                                <List
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        bgcolor: 'background.paper',
                                        position: 'relative',
                                        overflow: 'auto',
                                        maxHeight:420,
                                        '& ul': { padding: 0 },
                                    }}
                                    subheader={<li />}
                                >
                                <ListSubheader > 
                                    <Grid container columnSpacing={2} width={'100%'}  >
                                        <Grid item xs={3}>
                                                <Typography sx={{fontSize:14}}>
                                                CLAVE
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography sx={{fontSize:14}}>
                                                DESCRIPCION
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography sx={{fontSize:14}}>
                                                CANTIDAD
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    
                                </ListSubheader>
                                <Divider />
                                {
                                    entrega.detalles.map((detalle)=>(
                                        <ListItem key={detalle.id}  sx={{padding:0}} fullWidth >
                                            <Grid container columnSpacing={2} width={'100%'}  >
                                                <Grid item xs={3}>
                                                <Typography sx={{fontSize:14}}>
                                                    {detalle.clave}
                                                </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography sx={{fontSize:14}}>
                                                        {detalle.descripcion}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={3}>
                                                    <Typography sx={{fontSize:14}}>
                                                        {detalle.cantidad}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </ListItem>
                                    ))
                                }
                                
                                </List>
                                    
                                </AccordionDetails>
                            </Accordion>
                        ))
                    }
                </Box>
                <Divider />
            </Box>
            <Box sx={{margin:2, display:'flex' ,alignItems:'center', justifyContent:'center'}}>
                <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                    <Grid  item xs={2} display="flex" justifyContent="center" alignItems="center"  >
                        <Button onClick={onCloseDialog}> Salir</Button>
                    </Grid>
                </Grid>
            </Box>
    </>
    );
}

export default SeguimientoEnvio;

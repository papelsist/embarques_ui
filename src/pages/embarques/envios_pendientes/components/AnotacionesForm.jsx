import React, {useState} from 'react';
import {Typography, Divider, Box, Grid, Button, Accordion, AccordionSummary, AccordionDetails,FormControlLabel, Checkbox
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import axios from 'axios';
import {apiUrl} from '../../../../conf/axios_instance'
import { formatDate } from '../../../../utils/dateUtils';
import { useEffect } from 'react';




const AnotacionesForm = ({row, setOpenDialog}) => {


    const [revisiones, setRevisiones] = useState([])
    const [envio, setEnvio] = useState(null)

    const getData = async () => {
      
        console.log("Obteniendo envio");

        const url = `${apiUrl.url}embarques/get_anotaciones/`;
        const params = {
            documento: row.documento,
            fecha_documento: row.fecha_documento,
            sucursal: row.sucursal,
            tipo: 'VENTA'
        }
        const response = await axios.get(url, {params: params});
        
        if(response.data){
            console.log(response.data);
            setEnvio(response.data);
          
        }
     
    }

    const handleSalvar = async () => {
        console.log('Salvar')
        console.log(revisiones)
        const url = `${apiUrl.url}embarques/revisar_anotaciones/`
        const data = {
            anotaciones: revisiones
        }
        setOpenDialog(false)
        const resp = await axios.post(url, data)

    }  
    
    const handleRevision = (e, anotacion_id) => {

        const found = revisiones.find((revision)=>revision == anotacion_id)

        if(e.target.checked){
            if(found){
                return
            }
            setRevisiones([...revisiones, anotacion_id])

        }else{
            if(!found){
                return
            }
            const revisonesTemp = revisiones.filter((revision)=>revision != anotacion_id)
            setRevisiones(revisonesTemp)
        }
    }

    useEffect(()=>{
        getData()
    },[])

    

    return (
        <Box sx={{width:'100%', height:600, padding:1}}>
            <Box>
                <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                    <Grid item xs={12}>
                        <Typography  align='center'  >{envio?.destinatario}</Typography>
                    </Grid>
                    <Grid item xs={5}>
                        <Typography  align='center' > Docto: {envio?.documento}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography  align='center' > Fecha: {formatDate(envio?.fecha_documento)}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography  align='center' > Tipo: {envio?.tipo_documento}</Typography>
                    </Grid>
                    <Grid  item xs={6} display="flex" justifyContent="center" alignItems="center"  >
                            <Typography  align='center' > Fecha Entrega: {formatDate(envio?.instruccion.fecha_de_entrega)}</Typography>
                    </Grid>
                </Grid>
            </Box>
            <Divider/>
            <Box sx={{height:'76%', overflow:'auto'}}>
                {
                    envio?.anotaciones.map((anotacion)=>(
                        <Accordion key={anotacion.id}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1-content"
                                id="panel1-header"
                                >
                                    <Grid container display="flex" width={'100%'}  height={'100%'}>
                                        <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                            <Typography   color='primary'>
                                                Fecha: {anotacion.fecha}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                            <Typography   color='primary'>
                                                Ingresó: {anotacion.create_user}
                                            </Typography>
                                        </Grid>
                                        <Grid  item xs={3} display="flex" justifyContent="start" alignItems="center"  >
                                            {
                                                !anotacion.revisada && (
                                                    <Typography   color='error'>
                                                     
                                                        Pendiente
                                                    </Typography>
                                                    
                                                )
                                            }
                                        </Grid>
                                    </Grid>
                                </AccordionSummary>
                                <Divider />
                                <AccordionDetails>
                                    {
                                        !anotacion.revisada && (
                                            <Box>
                                                <FormControlLabel control={<Checkbox  name='revision' onChange={(e)=>{handleRevision(e, anotacion.id) }}/>} label="Marcar revisión"  />    
                                            </Box>
                                        )
                                    }
                                    <Box>
                                        {anotacion.anotacion}
                                    </Box>
                                </AccordionDetails>
                        </Accordion>
                    ))
                }
            </Box>
            <Divider/>
            <Box display="flex" alignItems='center' justifyContent='center' width={'100%'}  height={'8%'}>
                
                        <Button  sx={{mr:8, ml:5 }} onClick={handleSalvar} disabled={revisiones.length == 0}  >Salvar</Button>
                        <Button onClick={()=>{setOpenDialog(false)}} >Salir</Button>
                    
            </Box>
        </Box>
    );
}

export default AnotacionesForm;

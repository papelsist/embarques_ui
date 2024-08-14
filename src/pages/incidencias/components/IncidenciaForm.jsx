import React, {useEffect, useState, useContext} from 'react';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { Button, Dialog, Paper, Typography, Divider, Box, Grid, TextField,List, ListItem, ListItemText, IconButton,Card , CardMedia, CardActions,
    Avatar, InputLabel, Select, MenuItem, FormControl
 } from '@mui/material';
import PhotoIcon from '@mui/icons-material/Photo';

import { changeDateStr } from '../../../utils';
import SeguimientoForm from './SeguimientoForm';



const  estadoIncidencia = ["PENDIENTE", "RESUELTA", "CANCELADA"]

const IncidenciaForm = ({incidenciaRow, setShowIncidencia}) => {

    const { auth } = useContext(ContextEmbarques)
    const [incidencia, setIncidencia] = useState({})
    const [showDialog, setShowDialog] = useState(false)
    const [showImage, setShowImage] = useState(false)
    const [img, setImg] = useState('')

    const getIncidencia= async()=>{
        const url = `${apiUrl.url}embarques/incidencia/${incidenciaRow.id}`
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${auth.access}` }})
        if(res.data){
            setIncidencia(res.data)
        }
    }

    const updateIncidencia = ()=>{
        getIncidencia()
    }

    const mostrarImagen = (img) =>{
        setImg(img)
        setShowImage(true)
    }

    useEffect(() => {
        getIncidencia()
    }, [])

    return (
        <div>
          
            <Paper sx={{padding: '1rem', height:'100%' }}>
                <Box sx={{display:'flex'}}> 
                   {/*  Datos Incidencia */}
                    <Box> 
                        <Typography variant="h6" sx={{textAlign: 'center'}} >
                            {
                                incidencia &&
                                (`Incidencia: ${incidenciaRow.folio}  -  ${changeDateStr(incidencia.fecha)}  - ${incidenciaRow.status} `)
                            }
                        
                        </Typography>
                        <Divider sx={{margin: '1.5rem' }} />
                            <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                            <Grid item xs={12} md={3}> 
                                <TextField
                                    label="Embarque"
                                    value={incidenciaRow.embarque}
                                    fullWidth                                
                                    name='clave'
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={9}>
                                <TextField
                                    label="Operador"
                                    value={incidenciaRow.operador}
                                    fullWidth
                                    name='operador'
                                    disabled 
                                />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                                <Grid item xs={12} md={12}>
                                <TextField
                                    label="Destinatario"
                                    value={incidenciaRow.destinatario}
                                    fullWidth
                                    name='destinatario'
                                    disabled
                                />
                                </Grid>
                                
                            </Grid>
                            <Grid container spacing={2} sx = {{marginBottom:'.5rem'}}>    
                                <Grid item xs={12} md={4}>
                                <TextField
                                    label="Documento"
                                    value={incidenciaRow.documento}
                                    fullWidth
                                    name='documento'
                                    disabled
                                />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                <TextField
                                    label="Fecha Documento"
                                    value={changeDateStr(incidenciaRow.fecha_documento)}
                                    fullWidth
                                    name='fecha_documento'
                                    disabled
                                />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                <TextField
                                    label="Sucursal"
                                    value={incidenciaRow.sucursal}
                                    fullWidth
                                    name='sucursal'
                                    disabled
                                />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                                <Grid item xs={12} md={12}>
                                <TextField
                                    label="Comentario"
                                    value={incidenciaRow.comentario}
                                    fullWidth
                                    name='comentario'
                                    disabled
                                    multiline
                                    rows={5} // Puedes ajustar el número de filas según sea necesario
                                />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                                {   incidenciaRow.img1 &&
                                     <Grid item xs={2} md={2}>
                                     <IconButton  onClick={()=>{mostrarImagen(incidenciaRow.img1)}}> 
                                         <Avatar alt="Imagen3" src={incidenciaRow.img1} />
                                     </IconButton>
                                    </Grid>

                                }
                                {   incidenciaRow.img2 &&
                                     <Grid item xs={2} md={2}>
                                     <IconButton  onClick={()=>{mostrarImagen(incidenciaRow.img2)}}> 
                                         <Avatar alt="Imagen3" src={incidenciaRow.img2} />
                                     </IconButton>
                                    </Grid>

                                }
                                {   incidenciaRow.img3 &&
                                    <Grid item xs={2} md={2}>
                                     <IconButton  onClick={()=>{mostrarImagen(incidenciaRow.img3)}}> 
                                             {/* <PhotoIcon sx={{fontSize:50, color:'success.main',}}  /> */}
                                             <Avatar alt="Imagen3" src={incidenciaRow.img3} />
                                     </IconButton>
                                    </Grid> 
                                   

                                }
                                <Grid item xs={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="select-tipo-label">Estado</InputLabel>
                                        <Select
                                            labelId="select-tipo-label"
                                            id="select-tipo"
                                            label="Estado"
                                            value={incidenciaRow.status} 
                                            name='statis'
                                            //onChange={handleChangeSelector}

                                        >
                                            {estadoIncidencia.map((estado, index) => (
                                                <MenuItem value={estado} key={index}>
                                                    {estado}
                                                </MenuItem>
                                            ))}
                                            
                                        </Select>
                                        </FormControl>
                                </Grid>
                               
                                
                            </Grid>
                    </Box>
                        {/*  Termina Datos incidencia */}
                        {/*  Seguimiento */}
                        <Box sx={{width:'30rem' ,maxHeight:'10'}}>
                            <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                                <Grid item xs={12} md={12} >
                                    <Typography variant="h6" sx={{textAlign: 'center'}} >
                                        Seguimiento
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider sx={{margin: '1.5rem' }} />
                            <List sx={{ width: '100%', maxWidth: 450, bgcolor: 'background.paper',maxHeight: 340, overflow: 'auto'  }}>
                                {
                                incidencia.seguimientos && incidencia.seguimientos.map((seg, index)=>(
                                    <ListItem alignItems="flex-start" key={seg.id}>
                                        <ListItemText
                                        primary={`${seg.fecha} - ${seg.create_user}`}
                                        secondary={
                                            <React.Fragment>
                                            <Typography
                                                sx={{ display: 'inline' }}
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                               Actualización
                                            </Typography>
                                            { `:  ${seg.comentario}`}
                                            </React.Fragment>
                                        }
                                        />
                                    </ListItem>
                                ))
                            }
                            </List>
                        </Box>
                        {/*  Termina Seguimiento */}
                        
                </Box>
                <Box sx={{ display:'flex', alignItems:'center'}}>
                    <Grid container spacing={2} sx={{marginBottom:'.5rem'}}>
                        <Grid item xs={3} md={3} >
                            <Button onClick={()=>{setShowDialog(true)}}>Actualizar</Button>
                        </Grid>
                        <Grid item xs={3} md={3} >
                            <Button onClick={()=>{setShowIncidencia(false)}}>Cerrar</Button>
                        </Grid>
                    </Grid>
                        
                </Box>               
            </Paper>
            
            <Dialog open={showDialog} onClose={()=>{setShowDialog(false)}}>
                <SeguimientoForm incidenciaRow={incidenciaRow} setShowSeguimiento={setShowDialog} updateIncidencia={updateIncidencia} />
            </Dialog>
            <Dialog open={showImage} onClose={()=>{setShowImage(false)}}>
                <Card>
                    <CardMedia
                        component="img"
                        height="600"
                        image={img}
                        alt="img_incidencia"
                    />
                    <CardActions sx={{}}>
                        <Button size="small" color="primary" onClick={()=>{setShowImage(false)}} >
                            Cerrar
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
        </div>
    );
}

export default IncidenciaForm;

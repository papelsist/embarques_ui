import React,{useContext} from 'react';
import { Box, Button,IconButton,Tooltip,Dialog,Paper, Divider,TextField,Grid, Typography,List, ListSubheader, ListItem,ListItemText} from '@mui/material';
import { apiUrl } from '../../../../conf/axios_instance';
import axios from 'axios';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';


const EmbarquePasanForm = ({embarque_id, setOpenDialog}) => {

    const {auth} = useContext(ContextEmbarques);
    const [embarque, setEmbarque] = React.useState(null);
    const [entrega, setEntrega] = React.useState(null);
    const [partidas, setPartidas] = React.useState(null);


    const getData = async() =>{
        const url = `${apiUrl.url}embarques/crear_asignacion/${embarque_id}`
        const res =  await axios.get(url,{headers: { Authorization: `Bearer ${auth.access}` }})
        console.log(res.data);
        setEmbarque(res.data)
        setEntrega(res.data.partidas[0])
        setPartidas(res.data.partidas[0].detalles)
    }


    React.useEffect(()=>{
        getData()
        return ()=>{
            setEmbarque(null)
        }
    },[])

    return (
        <div>
            <Paper elevation={3} style={{padding:10}}>
                <Box>
                    <Typography variant="h6" align="center">Embarque Pasan</Typography>
                    <Divider/>
                    <Grid container columnSpacing={2}    
                        sx={{
                            display: 'flex' ,
                            '& .MuiTextField-root': { ml: 1, mr: 1},
                        }}
                    >
                         <Grid item xs={3}>
                            <TextField label={'Fecha'} name="fecha" variant="standard"  value={embarque? embarque.fecha : ''} fullWidth disabled />
                         </Grid>
                         <Grid item xs={7}>
                            <TextField label={'Destinatario'} name="destinatario" variant="standard"  value={entrega? entrega.destinatario : ''} fullWidth  disabled/>
                         </Grid>
                            <Grid item xs={2}>
                                <TextField label={'Documento'} name="documento" variant="standard"  value={entrega? entrega.documento : ''} fullWidth disabled />
                            </Grid>
                          

                    </Grid>
                    <Divider sx={{paddingTop: 2}}/>
                </Box>
                <Box>
                <List
                    sx={{
                        width: '100%',
                        height: 400,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        maxHeight: 400,
                        '& ul': { padding: 0 },
                    }}
                    subheader={<li />}
                >
                    <ListSubheader > 
                    <Grid container columnSpacing={1}    
                            sx={{
                                    display: 'flex' ,
                                    '& .MuiTextField-root': { ml: 1},
                                }}
                        >
                            <Grid item xs={3} justifyContent={'center'}>
                                <ListItemText 
                                    primary={'CLAVE'}
                                    primaryTypographyProps={{
                                        fontSize: 16,
                                        align: 'center'
                                     }}
                                />
                            </Grid>
                            <Grid item xs={6} justifyContent={'center'}>
                                <ListItemText 
                                    primary={'DESCRIPCION'}
                                    primaryTypographyProps={{
                                            fontSize: 16,
                                            align: 'center'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3} justifyContent={'center'}>
                                <ListItemText 
                                    primary={'CANTIDAD'}
                                    primaryTypographyProps={{
                                            fontSize: 16,
                                            align: 'center'
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </ListSubheader>
                    {partidas && partidas.map((partida,index)=>(
                        <ListItem key={index}>
                            <Grid container columnSpacing={1}    
                                sx={{
                                    display: 'flex' ,
                                    '& .MuiTextField-root': { ml: 1},
                                }}
                            >
                                <Grid item xs={3} justifyContent={'center'}>
                                    <ListItemText 
                                        primary={partida.clave}
                                        primaryTypographyProps={{
                                            fontSize: 16,
                                            align: 'center'
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6} justifyContent={'center'}>
                                    <ListItemText 
                                        primary={partida.descripcion}
                                        primaryTypographyProps={{
                                                fontSize: 16,
                                                align: 'left'
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={3} justifyContent={'center'}>
                                    <ListItemText 
                                        primary={partida.cantidad}
                                        primaryTypographyProps={{
                                                fontSize: 16,
                                                align: 'center'
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </ListItem>
                    ))}
                </List>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'center', paddingTop: 2}}>
                    <Button variant="contained" color="primary" onClick={()=>setOpenDialog(false)}>Cerrar</Button>
                </Box>

            </Paper>   
        </div>
    );
}

export default EmbarquePasanForm;

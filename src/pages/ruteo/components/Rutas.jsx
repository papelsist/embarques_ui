import React, { useEffect, useState, useContext } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { ContextEmbarques } from '../../../context/ContextEmbarques';

import "./Rutas.css"
import { IconButton } from '@mui/material';
import RutaForm from '../ruta_form/RutaForm';
import { ContextRuteo } from '../../../context/ContextRuteo';

const Rutas = () => {

    const [showDialog, setShowDialog] = useState(false);
    const [ruta, setRuta] = useState(null);
    const {setLoading} = useContext(ContextEmbarques);
    const {rutas} = useContext(ContextRuteo)

    const showRuta = (object) =>{
        setRuta(object)
        setShowDialog(true)
    }

    const handleClose = ()=>{
        console.log("Cerrando el Dialog")
    }

    useEffect(() => {
      setLoading(false)
    }, []);

return (
        <div className='rutas-container'>
            
               <List 
                sx={{ width: '96%', bgcolor: 'background.paper', maxHeight: 800, overflow: 'auto', }}
                component="nav"
                    aria-labelledby="rutas-subheader"
                    subheader={
                        <ListSubheader component="div" id="rutas-subheader">
                            Rutas
                            <Divider  />
                        </ListSubheader>
                    }
                > 
                        {rutas && rutas.map((ruta)=>(
                            <div key={ruta.embarque.id}>
                            <ListItem alignItems="flex-start"  onClick={()=>{showRuta(ruta)}}>
                                <ListItemAvatar>
                                <IconButton >
                                    <LocalShippingIcon />
                                </IconButton>
                                </ListItemAvatar>
                                <ListItemText
                                primary={`Emb - ${ruta.embarque.documento}:
                                        ${ruta.embarque.operador.nombre} `}
                                secondary={
                                    <>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {`Documentos: ${ruta.destinos.length}      Por enviar : ${ruta.ocupado} Kgs `}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                     {/*    {`Capacidad: ${ruta.embarque.operador.transporte.capacidad_max_kilos}  `} */}
                                    </Typography>
                                    </>
                                }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                            </div>

                        ))}
                    </List>
            <Dialog 
                open={showDialog} 
                onClose={()=>{setShowDialog(false)}}
                PaperProps={{
                    sx: {
                      width: "100%",
                      maxWidth: "80rem",
                      height:"80%" ,
                      maxHeight:"70rem"
                    },
                  }}
            >
                  <RutaForm ruta={ruta} setShowDialog={setShowDialog} />                 
            </Dialog>
        </div>
    );
}

export default Rutas;

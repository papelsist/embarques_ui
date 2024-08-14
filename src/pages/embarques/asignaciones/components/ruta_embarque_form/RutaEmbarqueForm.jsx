import React,{useContext, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';
import { ContextEmbarques } from '../../../../../context/ContextEmbarques';
import {Paper,IconButton} from '@mui/material';


import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';

import Typography from '@mui/material/Typography';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import PrintIcon from '@mui/icons-material/Print';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Mapa from '../../../../../components/map/Mapa';



const RutaEmbarqueForm = ({ruta, setShowRuta}) => {

    const {sucursales,auth,setLoading} = useContext(ContextEmbarques)
    const [center, setCenter] = useState({latitud: 19.410050,longitud: -99.099976 })
    const [puntos, setPuntos] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const  [entregaSeleccionada, setEntregaSeleccionada] = useState(null)

    const centrarEntrega = (destino)=>{
        const centro = {latitud:destino.instruccion.direccion_latitud,longitud: destino.instruccion.direccion_longitud }
        setCenter(centro)
        console.log(ruta)
    }
    const seleccionarEntrega =(destino)=>{
        centrarEntrega(destino)
        setEntregaSeleccionada(destino)
    }

    const centrarMapa = ()=>{
        setCenter({latitud: 19.410050,longitud: -99.099976 })
        setEntregaSeleccionada(null)
    }

    const buildPuntos = ()=>{
        let punto = {nombre: null, latitud: null,longitud: null,tipo: "ENTREGA" }
        let ubicaciones = []
        for(let destino of ruta){
            //console.log(destino)
            punto = {
                    nombre: destino.destinatario,
                    latitud: destino.instruccion.direccion_latitud,
                    longitud: destino.instruccion.direccion_longitud 
                }
            ubicaciones.push(punto)
            //console.log(ubicaciones)  
            setPuntos(ubicaciones)
            setPuntos([...sucursales,...ubicaciones])
        }
    }


    useEffect(()=>{ 
        setDestinos(ruta)
        buildPuntos()
    },[])
   

    return (
        <div className='ruta-form-container'>
        <div className='ruta-header' >
           {/*  <div className='titulo-ruta-header' >
                Emb: {ruta.embarque.documento} - {ruta.embarque.operador.nombre}
            </div>  */}
            <div className='info-ruta-header' >
         
            </div> 
            <div className='acciones-ruta-header' >
           {/*  <IconButton onClick={asignar} >
                    <LocalShippingIcon />
            </IconButton>
            <IconButton onClick={imprimirRuta} >
                    <PrintIcon />
            </IconButton> */}
            <IconButton onClick={()=>{setShowRuta(false)}} >
                    <HighlightOffIcon />
            </IconButton>
            </div> 
        </div>
        <div className='ruta-mapa'>
            <Mapa puntos = {puntos} center={center} />
        </div>
        <div className="ruta-entregas">
        <List 
            sx={{ width: '96%', bgcolor: 'background.div', maxHeight: 380, overflow: 'auto', }}
            component="nav"
                aria-labelledby="rutas-subheader"
                subheader={
                    <ListSubheader component="div" id="rutas-subheader">
                        <IconButton onClick={centrarMapa} >
                             <MyLocationIcon />
                        </IconButton>
                        Entregas 
                    </ListSubheader>
                }
            > 
                    {destinos && destinos.map((destino)=>(
                        <div key={destino.id}>
                        <ListItem alignItems="flex-start" onClick={()=>{seleccionarEntrega(destino)}}>
                            {/* <ListItemAvatar>
                            <IconButton onClick={()=>{showRuta(ruta)}} >
                             Icon
                            </IconButton>
                            </ListItemAvatar> */}
                            <ListItemText
                            primary={`${destino.documento}:
                                    ${destino.destinatario} `}
                            secondary={
                                <>
                                <Typography
                                    sx={{ display: 'inline' }}
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                >
                                Kilos:   {destino.kilos}
                                </Typography>
                                <Typography
                                    sx={{ display: 'block' }}
                                    component="span"
                                    variant="p"
                                    color="text.primary"
                                >
                                    {`Dir: ${destino.instruccion.direccion_calle} ${destino.instruccion.direccion_numero_exterior} ${destino.instruccion.direccion_numero_interior?destino.instruccion.direccion_numero_interior:""} `}
                                </Typography>
                                <Typography
                                    sx={{ display: 'block' }}
                                    component="span"
                                    variant="p"
                                    color="text.primary"
                                >
                                    {`${destino.instruccion.direccion_colonia} ${destino.instruccion.direccion_codigo_postal} ${destino.instruccion.direccion_municipio}  ${destino.instruccion.direccion_estado}`}
                                </Typography>
                              
                                </>
                            }
                            />
                        </ListItem>
                        <Divider  component="li" />
                        </div>

                    ))}
                </List>
        </div>
{/*         <div className="ruta-envios-det">
        <List 
            sx={{ width: '96%', bgcolor: 'background.paper', maxHeight: 110, overflow: 'auto', }}
            component="nav"
                aria-labelledby="rutas-subheader"
                subheader={
                    <ListSubheader component="div" id="rutas-subheader">
                        Partidas
                    </ListSubheader>
                }
            > 
                    {entregaSeleccionada && 
                    entregaSeleccionada.detalles.map((detalle)=>(
                        <div key={detalle.id}>
                        <ListItem alignItems="flex-start" >
                            <ListItemText
                            primary={``}
                            secondary={
                                <>
          
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                    Kilos: 
                                    </Typography>
                               
                              
                                </>
                            }
                            />
                        </ListItem>
                        <Divider  component="li" />
                        </div>

                    ))}
                </List>
        </div> */}

          
        
    </div>
    );
}

export default RutaEmbarqueForm;

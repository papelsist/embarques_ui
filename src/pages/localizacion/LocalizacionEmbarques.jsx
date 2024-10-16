import React, {useState, useContext, useEffect} from 'react';
import {ContextEmbarques} from '../../context/ContextEmbarques';
import MapaLocalizacion from '../../components/mapa_localizacion/MapaLocalizacion';
import { Button, Grid, Typography, List,ListItem, ListItemText,ListSubheader, Divider, ListItemAvatar, IconButton} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import {hivemqConf} from '../../conf/hivemq_conf';
import {apiUrl} from '../../conf/axios_instance'
import { tiempoTranscurrido,formatDateTime } from '../../utils/dateUtils';
import axios from 'axios';
import mqtt from 'mqtt';

import './LocalizacionEmbarques.css';




const LocalizacionEmbarques = () => {
    const {url,options} = hivemqConf;
    const [client, setClient] = useState(null);
    const [center, setCenter] = useState({latitud: 19.410050,longitud: -99.099976 });
    const {sucursales, auth} = useContext(ContextEmbarques)
    const [localizaciones, setLocalizaciones] = useState([])
    const [selected, setSelected] = useState(null);
    const [ubicacionSelected,setUbicacionSelected] = useState([]);
    const [destSelected, setDestSelected] = useState([]);
    const [centerEmbarque, setCenterEmbarque] = useState({latitud: 19.410050,longitud: -99.099976 });


    const asignacion = async(message) => {
        const validJsonStr = message.replace(/(\w+):/g, '"$1":'); // Agrega comillas a las claves 
        const ubicacion = JSON.parse(validJsonStr);
        const url = `${apiUrl.url}embarques/ruta_embarque/${ubicacion.embarque_id}`
        const resp = await axios.get(url, {headers: {Authorization: `Bearer ${auth.access}`}})
        if (resp.data ) {
            ubicacion.embarque = resp.data;
        }
            setLocalizaciones((prevLocalizaciones)=>{
                const found = prevLocalizaciones.find((element)=> element.nombre === ubicacion.nombre);
                if (found) {
                    return prevLocalizaciones.map((element)=>{
                        if (element.nombre === ubicacion.nombre) {
                            return ubicacion
                        }else{
                            return element
                        }
                    })
                }else{
                    return [...prevLocalizaciones, ubicacion]
                }
            })
    }

    const solicitarUbicacion = () => {
        setDestSelected([]);
        setUbicacionSelected([]);
      client.publish('solicitudes', 'Solicitar Ubicacion');
    }

    const seleccionarEmbarque = (item) => {
        setUbicacionSelected([item]);
        setSelected(item);
        setDestSelected([]);
        setCenterEmbarque({latitud: item.latitud, longitud: item.longitud})
    }  
    
    const seleccionarDestino = (item) => {
        console.log(item);
        console.log(item.envio.instruccion);
        const destino = {
            nombre: item.destinatario,
            latitud: item.envio.instruccion.direccion_latitud,
            longitud: item.envio.instruccion.direccion_longitud,
            tipo: "DESTINO"
        }
        
        setDestSelected([destino]);
       
    }

    const buildDireccion = (instruccion) => {
        return `${instruccion.direccion_calle} 
                No. ${instruccion.direccion_numero_exterior} 
                ${instruccion.direccion_numero_interior?instruccion.direccion_numero_interior:""}
                    ${instruccion.direccion_colonia}
                    ${instruccion.direccion_codigo_postal}
                    ${instruccion.direccion_municipio}
                    ${instruccion.direccion_estado}` 
    }
    

    useEffect(() => {

    
        let mqttClient = mqtt.connect(url,options);

        //configuración de eventos

        mqttClient.on('connect', function () {
            console.log('Connected');
        });
        
        mqttClient.on('error', function (error) {
            console.log(error);
        });
        
        mqttClient.on('message', function (topic, message) {
            asignacion(message.toString());
        });

        mqttClient.on('disconnect', () => {
            console.log('Disconnected from HiveMQ');
            
          });

          mqttClient.on('close', () => {
            console.log('Connection closed');
            
          });

        // subscripcion a topico ubicacion
        
        mqttClient.subscribe('ubicacion');
        
        setClient(mqttClient);


        return () => {
            mqttClient.end();
        }
    },[])

  



    return (

        <div className='locallizacion-container'>
            <header className='localizacion-header'>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={10} sx={{display:'flex', alignItems:'center', justifyContent:'center'}} >

                    <Typography variant="h4" component="h1" gutterBottom>
                            Localizacion de Embarques
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{display:'flex', alignItems:'center', justifyContent:'start'}}>

                        <Button variant="contained" onClick={solicitarUbicacion}>Solicitar Ubicacion</Button>
                    </Grid>
                </Grid>
            </header>
            <div className='localizacion-panel' >
               
                <main className='mapa-panel'>
                       <MapaLocalizacion puntos = {[...sucursales, ...localizaciones]} center={center}/>
                </main>
               
                <section className='info-panel'>
                        <section className='info-embarques-transito'>
                            {
                                <List 
                                sx={{ width: '96%', bgcolor: 'background.paper', maxHeight: 800, overflow: 'auto', }}
                                component="nav"
                                    aria-labelledby="rutas-subheader"
                                    subheader={
                                        <ListSubheader component="div" id="rutas-subheader">
                                            Embarques en tránsito
                                            <Divider  />
                                        </ListSubheader>
                                    }
                                > 
                               { localizaciones.map((item)=>{
                                    return(
                                        <div key={item.embarque.id}>
                                            <ListItem alignItems="flex-start"  onClick={()=>{seleccionarEmbarque(item)}}>
                                <ListItemAvatar>
                                <IconButton >
                                    <LocalShippingIcon />
                                </IconButton>
                                </ListItemAvatar>
                                <ListItemText
                                primary={`Emb - ${item.embarque.documento}:
                                        ${item.embarque.operador.nombre} `}
                                secondary={
                                    <>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Salida: { formatDateTime(item.embarque.or_fecha_hora_salida)}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        Tiempo: {tiempoTranscurrido(item.embarque.or_fecha_hora_salida)}
                                    </Typography>

                                    </>
                                }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                                            
                                        </div>
                                    )

                                })}
                                </List>
                            }
                        </section>
                  
                       
                </section>
                <section className='main-panel'>
                    
                    <section className='info-embarque' >
                        {
                            <List 
                            sx={{ width: '96%', bgcolor: 'background.paper', maxHeight: 350, overflow: 'auto', }}
                            component="nav"
                                aria-labelledby="rutas-subheader"
                                subheader={
                                    <ListSubheader component="div" id="rutas-subheader">
                                        Entregas en el embarque {selected?.embarque?.documento}
                                        <Divider  />
                                    </ListSubheader>
                                }
                            > 
                            {
                                 selected?.embarque?.partidas.map((item)=>{
                                    return(
                                        <div key={item.id}>
                                            <ListItem alignItems="flex-start" onClick={()=>{seleccionarDestino(item)}} >
                                                <ListItemText
                                                    primary={`Destinatario: ${item.destinatario}`}
                                                    secondary={
                                                        <>
                                                            <Typography
                                                                sx={{ display: 'block' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                Dir: { buildDireccion(item.envio.instruccion)}
                                                            </Typography>
                                                            <Typography
                                                                sx={{ display: 'inline' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                Arribo: { formatDateTime(item.arribo)}
                                                            </Typography>
                                                            <Typography
                                                                sx={{ display: 'block' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                Recepción: { formatDateTime(item.recepcion)}
                                                            </Typography>
                                                            <Typography
                                                                sx={{ display: 'block' }}
                                                                component="span"
                                                                variant="body2"
                                                                color="text.primary"
                                                            >
                                                                Recibió: { item.recibio}
                                                            </Typography>
                                                            
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </div>
                                    )
                                })
                            }

                            </List>
                        }
                         
                         {/* {
                           selected?.embarque?.partidas.map((item)=>{
                               return(
                                   <div key={item.id}>
                                      {item.id}
                                      {item.destinatario}
                                        {item.arribo}
                                        {item.recepcion}
                                   </div>
                               )
                           })
                      
                         } */}
                   </section>
                    <section className='mapa-envio-panel'>
                            <MapaLocalizacion puntos = {[...ubicacionSelected,...destSelected]} center={centerEmbarque}/>
                    </section>    
                </section>
            </div>
            <footer className='localizacion-footer'>
                <p>Localizacion de Embarques</p>
            </footer>
        </div>
    );
}

export default LocalizacionEmbarques;

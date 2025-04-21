import React, {useState, useContext, useEffect} from 'react';
import {ContextEmbarques} from '../../context/ContextEmbarques';
import MapaLocalizacion from '../../components/mapa_localizacion/MapaLocalizacion';
import { Button, Grid, Typography, List,ListItem, ListItemText,ListSubheader, Divider, ListItemAvatar, IconButton,Fab, Box,
    FormGroup,Switch,FormControlLabel
} from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import {apiUrl} from '../../conf/axios_instance'
import { tiempoTranscurrido,formatDateTime } from '../../utils/dateUtils';
import axios from 'axios';

import SvgIcon from '@mui/material/SvgIcon';


import './LocalizacionEmbarques.css';
import CamionetaIcon from '../../components/camioneta/camioneta_icon';

const LocalizacionTransportesGPS = () => {

    const {sucursales, auth, setLoading} = useContext(ContextEmbarques)
    const [localizaciones, setLocalizaciones] = useState([])
    const [selected, setSelected] = useState(null);
    const [ubicacionSelected,setUbicacionSelected] = useState([]);
    const [destSelected, setDestSelected] = useState([]);
    const [centerEmbarque, setCenterEmbarque] = useState({latitud: 19.410050,longitud: -99.099976 });
    const [transito, setTransito] = useState([])
    const [disponibles, setDisponibles] = useState([])
    const [showVoronoi, setShowVoronoi] = useState(false)
    const [layer, setLayer] = useState("OPENSTREETMAP")


    const solicitarUbicacion = async() => {
     
        const url = `${apiUrl.url}get_ubicaciones_gps`
        const params = {
            sucursal: auth.sucursal.nombre
        }
       try{
            const res =  await axios.get(url,{params})
            let count = 0
            console.log(res.data);
            const locs = res.data.map((item)=>{
                count = count + 1
                return {latitud: item.latitud, longitud: item.longitud,tipo:'TRANSPORTE',nombre:item.operador}
            })
            setSelected(null)
            const transitoTemp =[]
            const disponiblesTemp = []

            for(let item of res.data){
                if(item.embarque !== null){
                    transitoTemp.push(item)
                }else{
                    disponiblesTemp.push(item)
                }
            }
            setLoading(false)

        setLocalizaciones(locs)
        setTransito([...transitoTemp])
        setDisponibles([...disponiblesTemp])
        }catch(e){
            setLoading(false)
            console.log('Error al solicitar ubicaciones',e);
       }
        
    }

    const seleccionarEmbarque = (item) => {
        const localizacionesTemp = localizaciones.filter((loc)=>loc.tipo === 'TRANSPORTE')
        setLocalizaciones([...localizacionesTemp]);
        setUbicacionSelected([item]);
        setSelected(item);
        setDestSelected([]);
        setCenterEmbarque({latitud: item.latitud, longitud: item.longitud})
    } 
    
    const seleccionarDestino = (item) => {
        const destino = {
            nombre: item.destinatario,
            latitud: item.envio.instruccion.direccion_latitud,
            longitud: item.envio.instruccion.direccion_longitud,
            tipo: "DESTINO"
        }
        
        setDestSelected([destino]);
        setLocalizaciones([...localizaciones, destino])
       
    }

    const handleChangeVoronoi = (event) => {
        setShowVoronoi(event.target.checked)
    }

    const handleChangeLayer = (event) => {
        console.log("cambiando el layer");
        if(event.target.checked){
            setLayer("GOOGLECALLES")
        }else{
            setLayer("OPENSTREETMAP")
        }
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

    useEffect(()=>{
        setLoading(true)
        solicitarUbicacion()
    },[])


    return (
        <div className='locallizacion-container'>
        <div className='localizacion-panel' >
            <section className='info-panel'>
                    <section className='info-embarques-transito'>
                    
                            <List 
                            sx={{ width: '96%', bgcolor: 'background.paper', height:'85%', overflow: 'auto', }}
                            component="nav"
                                aria-labelledby="rutas-subheader"
                                subheader={
                                    <ListSubheader component="div" id="rutas-subheader">
                                        Embarques en tránsito
                                        <Divider  />
                                    </ListSubheader>
                                }
                            > 
                           { transito.map((item)=>{
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
                           <Divider />
                           <Box>
                           <FormGroup>
                                <FormControlLabel control={<Switch onChange={handleChangeVoronoi} />} label="Voronoi" />
                                {/* <FormControlLabel control={<Switch onChange={handleChangeLayer} />} label="Google" /> */}
                            </FormGroup>

                           </Box>
                        
                    </section>
            </section>
            <main className='mapa-panel'>
                   <MapaLocalizacion puntos = {[...sucursales, ...localizaciones]} center={centerEmbarque} showVoronoi={showVoronoi} layer={layer}/>
            </main>
            <section className='main-panel'>
                
                <section className='info-embarque' >
                  
                        <List 
                        sx={{ width: '96%', bgcolor: 'background.paper', height: '96%', overflow: 'auto', }}
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
                   
                     
               </section>
                <section className='mapa-envio-panel'>
                        <List 
                            sx={{ width: '96%', bgcolor: 'background.paper', height:'96%', overflow: 'auto', }}
                            component="nav"
                                aria-labelledby="rutas-subheader"
                                subheader={
                                    <ListSubheader component="div" id="rutas-subheader">
                                        Transportes  Disponibles
                                        <Divider  />
                                    </ListSubheader>
                                }
                            > 
                           { disponibles.map((item)=>{
                                return(
                                    <div key={item.id}>
                                        <ListItem alignItems="flex-start"  onClick={()=>{seleccionarEmbarque(item)}}>
                            <ListItemAvatar>
                            <IconButton >
                                <LocalShippingIcon />
                            </IconButton>
                            </ListItemAvatar>
                            <ListItemText
                            primary={`Op: ${item.operador} `}
                            />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                                        
                                    </div>
                                )

                            })}
                            </List>
                </section>    
            </section>
            
        </div>
    
        <Fab 
                color="primary" aria-label="add"  
                sx={{position: "fixed",bottom: (theme) => theme.spacing(5),right: (theme) => theme.spacing(50)}}
                onClick={solicitarUbicacion}
            >
                <NavigationIcon  sx={{fontSize:25}} />
            </Fab>
    </div>
    );
}

export default LocalizacionTransportesGPS;

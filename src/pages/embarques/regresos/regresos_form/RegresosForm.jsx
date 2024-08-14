import React,{useContext, useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import Mapa from '../../../../components/map/Mapa';
import axios from 'axios';
import {ContextEmbarques}  from '../../../../context/ContextEmbarques'
import {Paper,IconButton} from '@mui/material';
import { sortObjectsList } from '../../../../utils/embarqueUtils';
import { apiUrl } from '../../../../conf/axios_instance';

import {ListItem,List,Typography} from '@mui/material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import "./RegresosForm.css"

const RegresosForm = () => {

    const params = useParams()
    const {auth} = useContext(ContextEmbarques);
    const [embarque, setEmbarque] = useState();
    const [center, setCenter] = useState({latitud: 19.410050,longitud: -99.099976 });
    const [entregas, setEntregas] = useState([]);
    const [puntos, setPuntos] = useState([]);
    const  [entregaSeleccionada, setEntregaSeleccionada] = useState(null)
    const {sucursales} = useContext(ContextEmbarques)
    

    const centrarEntrega = (entrega)=>{
        const centro = {latitud:entrega.recepcion_latitud,longitud: entrega.recepcion_longitud}
        setCenter(centro)
    }

    const seleccionarEntrega =(entrega)=>{
        centrarEntrega(entrega)
        setEntregaSeleccionada(entrega)
    }

    const centrarMapa = ()=>{
        setCenter({latitud: 19.410050,longitud: -99.099976 })
        setEntregaSeleccionada(null)
    }

    const getData=async ()=>{
        const url = `${apiUrl.url}embarques/actualizar_entregas/${params.id}`
        const res =  await axios.get(url,{headers: { Authorization: `Bearer ${auth.access}` }})
        setEmbarque(res.data)
        if(res.data?.partidas.length != 0){
            const partidasEmbarque = res.data.partidas
            let entregasEmbarque = []
            let puntosEntrega = []
            for(let partida of partidasEmbarque){
                let entregaEmbarque = {}
                let puntoEntrega = {}
                if(partida.detalles.length != 0){

                    entregaEmbarque.entregaId = partida.id
                    entregaEmbarque.documento = partida.documento
                    entregaEmbarque.entidad = partida.entidad
                    entregaEmbarque.destinatario = partida.destinatario
                    entregaEmbarque.envioId = partida.envio
                    entregaEmbarque.fechaDocumento = partida.fecha_documento
                    entregaEmbarque.sucursal = partida.sucursal
                    entregaEmbarque.tipoDocumento = partida.tipo_documento
                    entregaEmbarque.arribo = partida.arribo
                    entregaEmbarque.arribo_latitud = partida.arribo_latitud
                    entregaEmbarque.arribo_longitud = partida.arribo_longitud
                    entregaEmbarque.recepcion = partida.recepcion
                    entregaEmbarque.recepcion_latitud = partida.recepcion_latitud
                    entregaEmbarque.recepcion_longitud = partida.recepcion_longitud
                    entregaEmbarque.recibio = partida.recibio
                    entregaEmbarque.detalles = []
                    const detalles = partida.detalles
                   
                    for(let detalle of detalles){
                        const detalleDict = {}
                        detalleDict.entregaDetId = detalle.id
                        detalleDict.clave = detalle.clave
                        detalleDict.me_descripcion = detalle.descripcion
                        detalleDict.id = detalle.envio_det
                        detalleDict.enviar = detalle.cantidad
                        detalleDict.valor = detalle.valor
                        detalleDict.me_cantidad = detalle.cantidad_envio
                        detalleDict.saldoEnvio = detalle.saldo
                        detalleDict.enviado = detalle.enviado
                        detalleDict.saldo = detalle.saldo 
                        entregaEmbarque.detalles.push(detalleDict)
                        
                    }
                    entregasEmbarque.push(entregaEmbarque)
                    puntoEntrega.nombre = partida.destinatario
                    puntoEntrega.latitud = partida.recepcion_latitud
                    puntoEntrega.longitud = partida.recepcion_longitud
                    puntoEntrega.tipo = "ENTREGA"
                    if(puntoEntrega.latitud && puntoEntrega.longitud)
                        puntosEntrega.push(puntoEntrega)
                }
                
            }
            const entregasEmbarqueSort = sortObjectsList(entregasEmbarque,'entregaId')
            setEntregas(entregasEmbarqueSort)
            setPuntos([...sucursales,...puntosEntrega])
            
            
        }
    }
        useEffect(() => {
        getData()
        }, []);
    
    return (
        <div className='regresos-form-container'>
            <div className='regresos-header' >
            <Paper elevation={3} sx={{height:"100%"} }>
                Encabezado
                <IconButton onClick={centrarMapa}>
                    <MyLocationIcon />
                </IconButton>
            
            </Paper> 
              
            </div>
            <div className='regresos-mapa'>
                    <Mapa puntos = {puntos} center={center}/>
            </div>
            <div className='regresos-embarque' >
            <Paper elevation={3} >
                <Typography>Entregas</Typography>
                <List style={{height: '50vh', overflow: 'auto'}}>
                    {entregas.map((entrega)=>(
                        <ListItem component="div" disablePadding key={entrega.entregaId}>
                        <ListItemButton onClick={()=>{seleccionarEntrega(entrega)}}>
                            <ListItemText primary={`${entrega.destinatario}`} />
                            
                        </ListItemButton>
                    </ListItem>
                    ))}

            </List>

            </Paper>
            </div>
            <div className='regresos-entrega'>
            <Paper elevation={3} sx={{height:"100%",width:"100%"}}>
                Datos Entregas
                <List style={{height: '100%', overflow: 'auto'}}>
                    {entregaSeleccionada && 
                    entregaSeleccionada.detalles.map((detalle)=>(
                        <ListItem component="div" disablePadding key={detalle.entregaDetId}>
                          <ListItemButton >
                                <ListItemText primary={`${detalle.clave} - ${detalle.me_descripcion}`} />
                                {`${detalle.me_cantidad}`}
                            </ListItemButton>
                        </ListItem>
                    ))
                    }
                </List>
                
            </Paper>
            </div>
            <div>
                
            </div>
           
        </div>
    );
}

export default RegresosForm;

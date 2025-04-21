import React, { useEffect, useState, useContext } from 'react';
import { Box, Divider,TextField,Grid, Typography, Button, Checkbox,FormControlLabel,Fab,Dialog,Paper,IconButton  } from '@mui/material';
import RouteIcon from '@mui/icons-material/Route';
import axios from 'axios';
import ToolbarRuteo from './components/ToolbarRuteo';
import { useLocation, useNavigate } from 'react-router-dom';
import Rutas from './components/Rutas';
import Outliers from './components/Outliers';
import NoAsignados from './components/NoAsignados';
import { apiUrl } from '../../conf/axios_instance';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { ContextRuteo } from '../../context/ContextRuteo';




import "./Ruteo.css"




const Ruteo = () => {
    const location = useLocation();
    const navigate = useNavigate()
    const{sucursal,auth, setLoading} = useContext(ContextEmbarques)
    const {ruteo,setRuteo,rutas,setRutas,outliers,setOutliers,noAsignados,setNoAsignados} = useContext(ContextRuteo)

    const getRuteo = async() =>{
        if(ruteo && Object.keys(ruteo).length > 0 ){
            console.log("Ruta ya generada limpie la ruta para volverla a generar")
        }else{
            setLoading(true)
            const fecha = new Date().toISOString().split('T')[0]
            const url = `${apiUrl.url}ruteo/sugerencia_ruta_pendientes?fecha=${fecha}=&sucursal=${sucursal.nombre}`
            const resp = await axios.get(url,{
                headers: { Authorization: `Bearer ${auth.access}` }
            } )
            const objetoRecibido = resp.data
            setRuteo(objetoRecibido)
            setRutas(objetoRecibido.rutas)
            setOutliers(objetoRecibido.outliers)
            setNoAsignados(objetoRecibido.no_asignados)
            setLoading(false)
        }
    }

    const limpiarRuta=()=>{
        setRuteo(null)
        setRutas(null)
        setOutliers(null)
        setNoAsignados(null)
    }

    

    useEffect(() => {
       console.log("Ejecutando el effect de ruteo...")
        const objetoRecibido = location.state;
        
        if (objetoRecibido) {
            console.log("Objeto Recibido")
            console.log(objetoRecibido)
            setRuteo(objetoRecibido)
            setRutas(objetoRecibido.rutas)
            setOutliers(objetoRecibido.outliers)
            setNoAsignados(objetoRecibido.no_asignados)
            setLoading(false)
        }
        setLoading(false)
        
    }, []);
    return (
            <>
                {/* <ToolbarRuteo /> */}
            
                <div className="ruteo-container">
                    <div className="ruteo-rutas">
                        <Rutas />
                    </div>
                <div className="ruteo-outliers">
                        <Outliers />
                </div>
                <div className="ruteo-no-asignadoss">
                        <NoAsignados />
                </div>
                </div>
                <Fab 
                    color="primary" aria-label="add"  
                    sx={{position: "fixed",bottom: (theme) => theme.spacing(10),right: (theme) => theme.spacing(10)}}
                onClick={getRuteo}
                >
                    <RouteIcon sx={{fontSize:35}}  /> 
                </Fab>
            </>
    );
}

export default Ruteo;

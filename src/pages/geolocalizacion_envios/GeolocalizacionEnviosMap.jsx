import React, { useContext, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Button, Fab, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios';
import { LogoIcon, TruckIcon,OfficeIcon } from '../../components/map/iconos_mapa';

// Componente para controlar el centro del mapa
const MapController = ({ center, zoom = 12 }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.latitud && center.longitud) {
            const latlng = { lat: center.latitud, lng: center.longitud };
            map.setZoom(zoom);
            map.flyTo(latlng, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

// Componente para redimensionar el mapa cuando cambia el tamaño del contenedor
const MapResizeHandler = ({ isFullscreen }) => {
    const map = useMap();
    
    useEffect(() => {
        // Pequeño delay para asegurar que el DOM se haya actualizado
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        
        // También redimensionar cuando cambia el tamaño de la ventana
        const handleResize = () => {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [isFullscreen, map]);
    
    return null;
};

// Componente para cerrar el popup
const PopupContent = ({ envio, onAsignarEnvio }) => {
    const map = useMap();
    
    const handleAsignar = () => {
        if (onAsignarEnvio) {
            onAsignarEnvio(envio);
            map.closePopup();
        }
    };

    return (
        <>
            <Typography variant="subtitle2" fontWeight="bold">
                Factura: {envio.documento}
            </Typography>
            <Typography variant="body2">
                Cliente: {envio.destinatario || 'N/A'}
            </Typography>
            <Typography variant="body2">
                Dirección: {envio.instruccion.direccion_calle || 'N/A'}
            </Typography>
            <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleAsignar}
            >
                Asignar
            </Button>
        </>
    );
};

// Componente para centrar el mapa en la sucursal
const CentrarSucursalButton = ({ sucursal, onCentrar }) => {
    const map = useMap();
    
    const handleCentrar = () => {
        if (sucursal && sucursal.direccion_latitud && sucursal.direccion_longitud) {
            const latlng = { lat: sucursal.direccion_latitud, lng: sucursal.direccion_longitud };
            map.setZoom(12);
            map.flyTo(latlng, 12);
            if (onCentrar) {
                onCentrar();
            }
        }
    };

    if (!sucursal || !sucursal.direccion_latitud || !sucursal.direccion_longitud) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                zIndex: 1000,
            }}
        >
            <Tooltip title="Centrar en sucursal" arrow>
                <Fab
                    color="primary"
                    size="medium"
                    onClick={handleCentrar}
                    sx={{
                        boxShadow: 3,
                        '&:hover': {
                            boxShadow: 6,
                        }
                    }}
                >
                    <HomeIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
};

const GeolocalizacionEnviosMap = ({sucursal, envios, envioSeleccionado, onCentrarSucursal, onAsignarEnvio, isFullscreen = false}) => {


    // Verificar que la sucursal tenga coordenadas
    const tieneCoordenadas = sucursal && 
    sucursal.direccion_latitud && 
    sucursal.direccion_longitud;
    
    // Si hay un envío seleccionado con coordenadas, usar esas coordenadas
    const tieneEnvioSeleccionado = envioSeleccionado && 
    envioSeleccionado.instruccion?.direccion_latitud && 
    envioSeleccionado.instruccion?.direccion_longitud;

    // Coordenadas por defecto (Ciudad de México) si no hay sucursal
    const centroMapa = tieneEnvioSeleccionado
        ? [envioSeleccionado.instruccion.direccion_latitud, envioSeleccionado.instruccion.direccion_longitud]
        : tieneCoordenadas
        ? [sucursal.direccion_latitud, sucursal.direccion_longitud]
        : [19.4618881, -99.1764352];

    const centerObj = tieneEnvioSeleccionado
        ? { latitud: envioSeleccionado.instruccion.direccion_latitud, longitud: envioSeleccionado.instruccion.direccion_longitud }
        : tieneCoordenadas
        ? { latitud: sucursal.direccion_latitud, longitud: sucursal.direccion_longitud }
        : { latitud: 19.46, longitud: -99.18 };


    return (
        
            <Box sx={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                <MapContainer
                    center={centroMapa}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Marcador de la sucursal */}
                    {tieneCoordenadas && (
                        <Marker 
                            position={[sucursal.direccion_latitud, sucursal.direccion_longitud]} 
                            icon={LogoIcon}
                        >
                            <Popup>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Sucursal: {sucursal.nombre || 'N/A'}
                                </Typography>
                                <Typography variant="body2">
                                    {sucursal.direccion || 'Sin dirección'}
                                </Typography>
                            </Popup>
                        </Marker>
                    )}

                    {/* Marcadores de los envíos */}
                    {envios.map((envio) => {
                        if (envio.instruccion.direccion_latitud && envio.instruccion.direccion_longitud) {
                            return (
                                <Marker
                                    key={envio.id || envio.factura}
                                    position={[envio.instruccion.direccion_latitud, envio.instruccion.direccion_longitud]}
                                    icon={OfficeIcon}
                                >
                                    <Popup>
                                        <PopupContent envio={envio} onAsignarEnvio={onAsignarEnvio} />
                                    </Popup>
                                </Marker>
                            );
                        }
                        return null;
                    })}

                    <MapController center={centerObj} zoom={tieneEnvioSeleccionado ? 12 : 12} />
                    <MapResizeHandler isFullscreen={isFullscreen} />
                    <CentrarSucursalButton sucursal={sucursal} onCentrar={onCentrarSucursal} />
                </MapContainer>
            </Box>
    );
};

export default GeolocalizacionEnviosMap;

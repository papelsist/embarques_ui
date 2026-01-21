import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Divider,
    Tooltip,
    Chip,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { ContextEmbarques } from '../../../../../context/ContextEmbarques';
import Mapa from '../../../../../components/map/Mapa';

const RutaEmbarqueForm = ({ ruta, setShowRuta }) => {
    const { sucursales } = useContext(ContextEmbarques);
    const [center, setCenter] = useState({ latitud: 19.410050, longitud: -99.099976 });
    const [puntos, setPuntos] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);

    const centrarEntrega = (destino) => {
        if (destino?.instruccion?.direccion_latitud && destino?.instruccion?.direccion_longitud) {
            const centro = {
                latitud: destino.instruccion.direccion_latitud,
                longitud: destino.instruccion.direccion_longitud
            };
            setCenter(centro);
        }
    };

    const seleccionarEntrega = (destino) => {
        centrarEntrega(destino);
        setEntregaSeleccionada(destino);
    };

    const centrarMapa = () => {
        setCenter({ latitud: 19.410050, longitud: -99.099976 });
        setEntregaSeleccionada(null);
    };

    const buildPuntos = () => {
        if (!ruta || ruta.length === 0) return;
        
        const ubicaciones = ruta
            .filter(destino => destino?.instruccion?.direccion_latitud && destino?.instruccion?.direccion_longitud)
            .map(destino => ({
                nombre: destino.destinatario || 'Sin nombre',
                latitud: destino.instruccion.direccion_latitud,
                longitud: destino.instruccion.direccion_longitud,
                tipo: 'ENTREGA'
            }));

        setPuntos([...sucursales, ...ubicaciones]);
    };

    useEffect(() => {
        if (ruta) {
            setDestinos(ruta);
            buildPuntos();
        }
    }, [ruta]);

    const formatDireccion = (instruccion) => {
        if (!instruccion) return 'Sin dirección';
        
        const calle = instruccion.direccion_calle || '';
        const numExt = instruccion.direccion_numero_exterior || '';
        const numInt = instruccion.direccion_numero_interior ? ` Int. ${instruccion.direccion_numero_interior}` : '';
        const colonia = instruccion.direccion_colonia || '';
        const cp = instruccion.direccion_codigo_postal || '';
        const municipio = instruccion.direccion_municipio || '';
        const estado = instruccion.direccion_estado || '';

        const direccion1 = `${calle} ${numExt}${numInt}`.trim();
        const direccion2 = `${colonia} ${cp} ${municipio} ${estado}`.trim();

        return { direccion1, direccion2 };
    };

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 0, overflow: 'hidden' }}>
            {/* Header */}
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 0,
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocalShippingIcon color="primary" />
                    <Typography variant="h6" component="h2" fontWeight="bold">
                        Ruta de Entregas
                    </Typography>
                    {destinos.length > 0 && (
                        <Chip
                            label={`${destinos.length} ${destinos.length === 1 ? 'entrega' : 'entregas'}`}
                            color="primary"
                            size="small"
                        />
                    )}
                </Box>
                <Tooltip title="Cerrar">
                    <IconButton
                        onClick={() => setShowRuta(false)}
                        color="error"
                        sx={{
                            '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.contrastText'
                            }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, position: 'relative' }}>
                {/* Map Section - Fixed */}
                <Box
                    sx={{
                        flex: 1,
                        position: 'relative',
                        borderRight: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1000,
                            display: 'flex',
                            gap: 1
                        }}
                    >
                        <Tooltip title="Centrar mapa">
                            <Paper
                                elevation={3}
                                sx={{
                                    p: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: 'background.paper'
                                }}
                            >
                                <IconButton
                                    onClick={centrarMapa}
                                    color="primary"
                                    size="small"
                                >
                                    <MyLocationIcon />
                                </IconButton>
                            </Paper>
                        </Tooltip>
                    </Box>
                    <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0
                    }}>
                        <Mapa puntos={puntos} center={center} />
                    </Box>
                </Box>

                {/* Deliveries List Section - Scrollable */}
                <Box
                    sx={{
                        width: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        backgroundColor: 'background.default',
                        flexShrink: 0
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                            backgroundColor: 'background.paper',
                            flexShrink: 0
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationOnIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1" fontWeight="bold">
                                Lista de Entregas
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            Haz clic en una entrega para verla en el mapa
                        </Typography>
                    </Paper>

                    <Box 
                        sx={{ 
                            flex: 1, 
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            minHeight: 0,
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'background.default',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'action.disabled',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: 'action.disabledBackground',
                                },
                            },
                        }}
                    >
                        {destinos.length === 0 ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    p: 3
                                }}
                            >
                                <LocalShippingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                                <Typography variant="body1" color="text.secondary">
                                    No hay entregas disponibles
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {destinos.map((destino, index) => {
                                    const isSelected = entregaSeleccionada?.id === destino.id;
                                    const { direccion1, direccion2 } = formatDireccion(destino.instruccion);

                                    return (
                                        <React.Fragment key={destino.id || index}>
                                            <ListItem
                                                onClick={() => seleccionarEntrega(destino)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected
                                                        ? 'primary.light'
                                                        : 'transparent',
                                                    '&:hover': {
                                                        backgroundColor: isSelected
                                                            ? 'primary.light'
                                                            : 'action.hover'
                                                    },
                                                    transition: 'background-color 0.2s',
                                                    py: 2,
                                                    px: 2
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                            <Typography
                                                                variant="subtitle2"
                                                                fontWeight="bold"
                                                                color={isSelected ? 'primary.contrastText' : 'text.primary'}
                                                            >
                                                                {destino.documento || 'Sin documento'}
                                                            </Typography>
                                                            {isSelected && (
                                                                <Chip
                                                                    label="Seleccionado"
                                                                    size="small"
                                                                    color="primary"
                                                                    sx={{ height: 20 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 1 }}>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight="medium"
                                                                color={isSelected ? 'primary.contrastText' : 'text.primary'}
                                                                sx={{ mb: 0.5 }}
                                                            >
                                                                {destino.destinatario || 'Sin destinatario'}
                                                            </Typography>
                                                            {destino.kilos && (
                                                                <Chip
                                                                    label={`${destino.kilos} kg`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{
                                                                        mb: 1,
                                                                        borderColor: isSelected
                                                                            ? 'primary.contrastText'
                                                                            : 'primary.main',
                                                                        color: isSelected
                                                                            ? 'primary.contrastText'
                                                                            : 'primary.main'
                                                                    }}
                                                                />
                                                            )}
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                color={isSelected ? 'primary.contrastText' : 'text.secondary'}
                                                                sx={{ mt: 0.5 }}
                                                            >
                                                                {direccion1}
                                                            </Typography>
                                                            <Typography
                                                                variant="caption"
                                                                display="block"
                                                                color={isSelected ? 'primary.contrastText' : 'text.secondary'}
                                                            >
                                                                {direccion2}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < destinos.length - 1 && (
                                                <Divider component="li" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default RutaEmbarqueForm;

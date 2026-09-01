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
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import { ContextEmbarques } from '../../../../../context/ContextEmbarques';
import Mapa from '../../../../../components/map/Mapa';

const RutaEmbarqueForm = ({ ruta, setShowRuta, variant = 'default' }) => {
    const { sucursales } = useContext(ContextEmbarques);
    const [center, setCenter] = useState({ latitud: 19.410050, longitud: -99.099976 });
    const [puntos, setPuntos] = useState([]);
    const [destinos, setDestinos] = useState([]);
    const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);
    const isGeo = variant === 'geolocalizacion';

    const centrarEntrega = (destino) => {
        if (destino?.instruccion?.direccion_latitud && destino?.instruccion?.direccion_longitud) {
            setCenter({
                latitud: destino.instruccion.direccion_latitud,
                longitud: destino.instruccion.direccion_longitud,
            });
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
            .filter(
                (destino) =>
                    destino?.instruccion?.direccion_latitud && destino?.instruccion?.direccion_longitud
            )
            .map((destino) => ({
                nombre: destino.destinatario || 'Sin nombre',
                latitud: destino.instruccion.direccion_latitud,
                longitud: destino.instruccion.direccion_longitud,
                tipo: 'ENTREGA',
            }));

        setPuntos([...sucursales, ...ubicaciones]);
    };

    useEffect(() => {
        if (ruta) {
            setDestinos(ruta);
            buildPuntos();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ruta]);

    const formatDireccion = (instruccion) => {
        if (!instruccion) return { direccion1: 'Sin dirección', direccion2: '' };

        const calle = instruccion.direccion_calle || '';
        const numExt = instruccion.direccion_numero_exterior || '';
        const numInt = instruccion.direccion_numero_interior ? ` Int. ${instruccion.direccion_numero_interior}` : '';
        const colonia = instruccion.direccion_colonia || '';
        const cp = instruccion.direccion_codigo_postal || '';
        const municipio = instruccion.direccion_municipio || '';
        const estado = instruccion.direccion_estado || '';

        const direccion1 = `${calle} ${numExt}${numInt}`.trim() || 'Sin dirección';
        const direccion2 = [colonia, cp ? `C.P. ${cp}` : '', municipio, estado].filter(Boolean).join(', ');

        return { direccion1, direccion2 };
    };

    const headerIcon = isGeo ? (
        <RouteIcon color="primary" />
    ) : (
        <LocalShippingIcon color="primary" />
    );

    const listPanelWidth = isGeo ? 360 : 400;

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Paper
                elevation={isGeo ? 0 : 2}
                sx={{
                    px: isGeo ? 2.5 : 2,
                    py: isGeo ? 2 : 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 0,
                    borderBottom: 1,
                    borderColor: 'divider',
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {headerIcon}
                    <Typography variant="h6" fontWeight="bold">
                        Ruta de entregas
                    </Typography>
                    {destinos.length > 0 && (
                        <Chip
                            label={`${destinos.length} entrega${destinos.length === 1 ? '' : 's'}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                    )}
                </Box>
                <Tooltip title="Cerrar">
                    <IconButton size="small" onClick={() => setShowRuta(false)} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Paper>

            <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
                <Box
                    sx={{
                        flex: 1,
                        position: 'relative',
                        borderRight: 1,
                        borderColor: 'divider',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1000,
                        }}
                    >
                        <Tooltip title="Centrar mapa">
                            <Paper
                                elevation={isGeo ? 1 : 3}
                                sx={{
                                    p: 0.25,
                                    borderRadius: 1,
                                    bgcolor: 'background.paper',
                                }}
                            >
                                <IconButton onClick={centrarMapa} color="primary" size="small">
                                    <MyLocationIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        </Tooltip>
                    </Box>
                    <Box sx={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                        <Mapa puntos={puntos} center={center} />
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: listPanelWidth,
                        maxWidth: '40%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        bgcolor: isGeo ? 'grey.50' : 'background.default',
                        flexShrink: 0,
                    }}
                >
                    <Box
                        sx={{
                            p: 1.5,
                            borderBottom: 1,
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            flexShrink: 0,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle2" fontWeight="bold">
                                Entregas
                            </Typography>
                        </Box>
                        {!isGeo && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Haz clic en una entrega para verla en el mapa
                            </Typography>
                        )}
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            minHeight: 0,
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
                                    p: 3,
                                }}
                            >
                                <LocalShippingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No hay entregas disponibles
                                </Typography>
                            </Box>
                        ) : (
                            <List dense disablePadding>
                                {destinos.map((destino, index) => {
                                    const isSelected = entregaSeleccionada?.id === destino.id;
                                    const { direccion1, direccion2 } = formatDireccion(destino.instruccion);

                                    return (
                                        <React.Fragment key={destino.id || index}>
                                            <ListItem
                                                onClick={() => seleccionarEntrega(destino)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    py: 1.25,
                                                    px: 1.5,
                                                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                                                    '&:hover': {
                                                        bgcolor: isSelected ? 'action.selected' : 'action.hover',
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 0.75,
                                                                flexWrap: 'wrap',
                                                            }}
                                                        >
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {destino.documento || 'Sin documento'} —{' '}
                                                                {destino.destinatario || 'Sin destinatario'}
                                                            </Typography>
                                                            {destino.kilos && (
                                                                <Chip
                                                                    label={`${destino.kilos} kg`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box sx={{ mt: 0.5 }}>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                display="block"
                                                                sx={{ wordBreak: 'break-word' }}
                                                            >
                                                                {direccion1}
                                                            </Typography>
                                                            {direccion2 && (
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    display="block"
                                                                >
                                                                    {direccion2}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                            {index < destinos.length - 1 && <Divider component="li" />}
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

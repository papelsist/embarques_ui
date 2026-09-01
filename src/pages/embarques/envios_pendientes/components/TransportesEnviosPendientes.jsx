import React, { useContext, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import {
    List,
    Paper,
    Typography,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    Tooltip,
    Button,
} from '@mui/material';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import { useNavigate } from 'react-router-dom';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import { objectIsEmpty } from '../../../../utils/embarqueUtils';

const TransportesEnviosPendientes = ({ asignar, variant = 'default', onClose }) => {
    const { auth, sucursal } = useContext(ContextEmbarques);
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const isGeo = variant === 'geolocalizacion';

    const getData = async () => {
        if (objectIsEmpty(auth)) {
            setLoading(true);
            try {
                const url = `${apiUrl.url}embarques/pendientes_salida`;
                const resp = await axios.get(url, {
                    params: { sucursal: sucursal.id },
                    headers: { Authorization: `Bearer ${auth.access}` },
                });
                setDatos(resp.data || []);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate(`../../login`);
                }
            } finally {
                setLoading(false);
            }
        } else {
            console.log('No esta autenticado');
            navigate(`../../login`);
        }
    };

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const listContent = (
        <>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={32} />
                </Box>
            )}
            {!loading && datos.length === 0 && (
                <Alert severity="info" sx={{ m: isGeo ? 0 : 1 }}>
                    No hay embarques disponibles para asignación.
                </Alert>
            )}
            {!loading && datos.length > 0 && (
                <List dense disablePadding={isGeo}>
                    {datos.map((embarque) => (
                        <ListItem
                            component="div"
                            disablePadding
                            key={embarque.id}
                            onClick={() => asignar(embarque)}
                            sx={
                                isGeo
                                    ? {
                                          borderBottom: 1,
                                          borderColor: 'divider',
                                          '&:hover': { bgcolor: 'action.hover' },
                                      }
                                    : undefined
                            }
                        >
                            <ListItemButton sx={isGeo ? { py: 1.25 } : undefined}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <LocalShippingIcon color={isGeo ? 'primary' : 'inherit'} fontSize="small" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        isGeo ? (
                                            <Typography variant="body2" fontWeight="medium">
                                                {embarque.documento}
                                            </Typography>
                                        ) : (
                                            `${embarque.documento} - ${embarque.operador.nombre}`
                                        )
                                    }
                                    secondary={
                                        isGeo ? (
                                            <Typography variant="caption" color="text.secondary">
                                                {embarque.operador?.nombre}
                                            </Typography>
                                        ) : undefined
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );

    if (isGeo) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    minWidth: { xs: '100%', sm: 420 },
                    maxWidth: 480,
                    p: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    maxHeight: '70vh',
                    boxSizing: 'border-box',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Asignación total
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Tooltip title="Actualizar lista">
                            <span>
                                <IconButton size="small" onClick={getData} disabled={loading}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {onClose && (
                            <IconButton size="small" onClick={onClose} aria-label="Cerrar">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Seleccione el embarque al que desea asignar el envío.
                </Typography>
                <Divider />
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 120,
                        maxHeight: '45vh',
                        overflow: 'auto',
                        border: datos.length > 0 ? 1 : 0,
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                >
                    {listContent}
                </Box>
                {onClose && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="outlined" size="small" onClick={onClose}>
                            Cancelar
                        </Button>
                    </Box>
                )}
            </Paper>
        );
    }

    return (
        <Paper
            sx={{
                width: '100%',
                height: '99%',
                maxHeight: '99%',
                overflow: 'auto',
                bgcolor: 'background.paper',
                padding: '0 .5rem',
            }}
        >
            <List
                subheader={
                    <Typography component="div" sx={{ fontSize: '1.2rem', fontWeight: 'bold', py: 1, px: 2 }}>
                        Embarques disponibles
                    </Typography>
                }
            >
                {listContent}
            </List>
        </Paper>
    );
};

export default TransportesEnviosPendientes;

import React, { useContext, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Tooltip,
    IconButton,
    CircularProgress,
    Paper,
    Divider,
    Alert,
    Chip,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Autocomplete,
} from '@mui/material';
import { debounce } from '@mui/material/utils';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { apiUrl } from '../../conf/axios_instance';

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 520;

const actionIconSx = {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    p: 0.75,
};

const formatDireccion = (instruccion) => {
    if (!instruccion) return null;
    const partes = [
        instruccion.direccion_calle,
        instruccion.direccion_numero_exterior,
        instruccion.direccion_colonia,
        instruccion.direccion_codigo_postal ? `C.P. ${instruccion.direccion_codigo_postal}` : null,
        instruccion.direccion_municipio,
        instruccion.direccion_estado,
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : null;
};

const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ mb: 0.75 }}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    );
};

const EnvioDetalleInline = ({ envio, onCerrar }) => {
    const detalles = envio?.detalles || [];
    const instruccion = envio?.instruccion;

    return (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', height: '100%', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                    Detalle — {envio.documento}
                </Typography>
                <IconButton size="small" onClick={onCerrar} aria-label="Cerrar detalle">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <InfoRow label="Destinatario" value={envio.destinatario} />
            <InfoRow label="Dirección" value={formatDireccion(instruccion)} />
            <InfoRow label="Contacto" value={instruccion?.contacto} />
            <InfoRow label="Teléfono" value={instruccion?.telefono} />
            <InfoRow label="Horario" value={instruccion?.horario} />
            {detalles.length > 0 && (
                <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="caption" fontWeight="bold" color="text.secondary">
                        Partidas ({detalles.length})
                    </Typography>
                    {detalles.map((detalle, index) => (
                        <Typography key={detalle.id || index} variant="caption" display="block" sx={{ mt: 0.5 }}>
                            {detalle.clave} — {detalle.me_descripcion || detalle.descripcion}:{' '}
                            {detalle.me_cantidad ?? detalle.cantidad}
                        </Typography>
                    ))}
                </>
            )}
        </Paper>
    );
};

const BuscadorEnviosClienteGeolocalizacionPanel = ({
    overlayZIndex = 1400,
    onClose,
    onEnvioSeleccionadoMapa,
    onAsignacionParcial,
    onAsignacionTotal,
}) => {
    const { sucursal, auth } = useContext(ContextEmbarques);
    const [cliente, setCliente] = useState(null);
    const [clienteInput, setClienteInput] = useState('');
    const [opcionesCliente, setOpcionesCliente] = useState([]);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [envios, setEnvios] = useState([]);
    const [envioSeleccionadoId, setEnvioSeleccionadoId] = useState(null);
    const [envioDetalleId, setEnvioDetalleId] = useState(null);
    const [message, setMessage] = useState(null);
    const [buscando, setBuscando] = useState(false);

    const envioDetalle = useMemo(
        () => envios.find((e) => e.id === envioDetalleId) || null,
        [envios, envioDetalleId]
    );

    const haySeleccion = envioSeleccionadoId != null;

    const buscarClientes = useMemo(
        () =>
            debounce(async (term) => {
                const q = (term || '').trim();
                if (q.length < 2) {
                    setOpcionesCliente([]);
                    return;
                }
                setLoadingClientes(true);
                try {
                    const url = `${apiUrl.url}embarques/search_cliente`;
                    const response = await axios.get(url, {
                        params: { term: q },
                        headers: auth?.access ? { Authorization: `Bearer ${auth.access}` } : undefined,
                    });
                    setOpcionesCliente(response.data || []);
                } catch (error) {
                    console.error('Error al buscar cliente:', error);
                    setOpcionesCliente([]);
                } finally {
                    setLoadingClientes(false);
                }
            }, 400),
        [auth?.access]
    );

    const buscar = async () => {
        if (!cliente) return;
        setBuscando(true);
        setEnvios([]);
        setEnvioSeleccionadoId(null);
        setEnvioDetalleId(null);
        setMessage(null);
        try {
            const url = `${apiUrl.url}embarques/get_envios_pendientes_cliente/`;
            const response = await axios.get(url, {
                params: {
                    sucursal: sucursal?.nombre,
                    nombre: cliente.nombre,
                    rfc: cliente.rfc,
                },
                headers: auth?.access ? { Authorization: `Bearer ${auth.access}` } : undefined,
            });
            const lista = response.data?.envios || [];
            if (response.data?.message === 'OK' && lista.length > 0) {
                setEnvios(lista);
            } else {
                setMessage('No se encontraron envíos pendientes del cliente');
            }
        } catch (error) {
            console.error('Error al buscar envíos del cliente:', error);
            setMessage('Error al buscar los envíos del cliente');
        } finally {
            setBuscando(false);
        }
    };

    const handleToggleSeleccion = (envio) => {
        if (envioSeleccionadoId === envio.id) {
            setEnvioSeleccionadoId(null);
        } else {
            setEnvioSeleccionadoId(envio.id);
            onEnvioSeleccionadoMapa?.(envio);
        }
    };

    const handleToggleDetalle = (envio) => {
        setEnvioDetalleId((prev) => (prev === envio.id ? null : envio.id));
    };

    const handleAsignacionParcial = () => {
        if (!haySeleccion) return;
        onAsignacionParcial?.({ [envioSeleccionadoId]: true });
    };

    const handleAsignacionTotal = () => {
        if (!haySeleccion) return;
        onAsignacionTotal?.({ [envioSeleccionadoId]: true });
    };

    const mostrarDetalle = Boolean(envioDetalle);

    return (
        <Paper
            elevation={0}
            sx={{
                width: PANEL_WIDTH,
                maxWidth: '95vw',
                height: PANEL_HEIGHT,
                minHeight: PANEL_HEIGHT,
                maxHeight: PANEL_HEIGHT,
                p: 2,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonSearchIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Envíos por cliente
                    </Typography>
                </Box>
                {onClose && (
                    <IconButton size="small" onClick={onClose} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
            <Divider sx={{ flexShrink: 0 }} />

            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, flexShrink: 0 }}>
                <Autocomplete
                    disablePortal={false}
                    options={opcionesCliente}
                    loading={loadingClientes}
                    value={cliente}
                    inputValue={clienteInput}
                    filterOptions={(x) => x}
                    getOptionLabel={(option) => {
                        if (!option) return '';
                        if (typeof option === 'string') return option;
                        const rfc = option.rfc ? ` (${option.rfc})` : '';
                        return `${option.nombre || ''}${rfc}`;
                    }}
                    isOptionEqualToValue={(option, selected) =>
                        Boolean(option?.id && selected?.id && option.id === selected.id)
                    }
                    noOptionsText={
                        clienteInput.trim().length < 2
                            ? 'Escribe al menos 2 caracteres'
                            : 'No hay clientes'
                    }
                    sx={{ flex: 1, minWidth: 0 }}
                    slotProps={{
                        popper: {
                            sx: { zIndex: overlayZIndex },
                            style: { zIndex: overlayZIndex },
                        },
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Cliente"
                            size="small"
                            fullWidth
                        />
                    )}
                    onInputChange={(event, newInputValue, reason) => {
                        setClienteInput(newInputValue);
                        if (reason === 'input' || reason === 'clear') {
                            buscarClientes(newInputValue);
                        }
                    }}
                    onChange={(event, newValue) => {
                        setCliente(newValue);
                        setEnvios([]);
                        setEnvioSeleccionadoId(null);
                        setEnvioDetalleId(null);
                        setMessage(null);
                    }}
                />
                <Button
                    color="primary"
                    variant="contained"
                    size="small"
                    startIcon={
                        buscando ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <TroubleshootIcon />
                        )
                    }
                    onClick={buscar}
                    disabled={!cliente || buscando}
                    sx={{ minWidth: 96, height: 40, flexShrink: 0 }}
                >
                    Buscar
                </Button>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {message && (
                    <Alert severity="warning" sx={{ py: 0.5, flexShrink: 0 }}>
                        {message}
                    </Alert>
                )}

                {envios.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {envios.length} envío(s) — seleccione uno para asignar
                    </Typography>
                )}

                <Box
                    sx={{
                        flex: mostrarDetalle ? '0 0 42%' : 1,
                        minHeight: 0,
                        overflow: 'auto',
                        border: envios.length > 0 ? 1 : 0,
                        borderColor: 'divider',
                        borderRadius: 1,
                    }}
                >
                    <List dense disablePadding>
                        {envios.map((envio) => {
                            const isSelected = envioSeleccionadoId === envio.id;
                            const detalleActivo = envioDetalleId === envio.id;
                            return (
                                <ListItem
                                    key={envio.id}
                                    disablePadding
                                    secondaryAction={
                                        <Tooltip title={detalleActivo ? 'Ocultar detalle' : 'Ver detalle'}>
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                color={detalleActivo ? 'info' : 'default'}
                                                onClick={() => handleToggleDetalle(envio)}
                                                sx={actionIconSx}
                                            >
                                                <InfoOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    }
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: 'divider',
                                        bgcolor: isSelected ? 'action.selected' : 'transparent',
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Checkbox
                                            edge="start"
                                            checked={isSelected}
                                            onChange={() => handleToggleSeleccion(envio)}
                                        />
                                    </ListItemIcon>
                                    <ListItemButton onClick={() => handleToggleSeleccion(envio)} sx={{ pr: 7 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {envio.documento}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={envio.tipo_documento}
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {envio.destinatario}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                {mostrarDetalle && (
                    <Box sx={{ flex: '0 0 38%', minHeight: 0, overflow: 'hidden' }}>
                        <EnvioDetalleInline
                            envio={envioDetalle}
                            onCerrar={() => setEnvioDetalleId(null)}
                        />
                    </Box>
                )}
            </Box>

            <Divider sx={{ flexShrink: 0 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexShrink: 0 }}>
                <Tooltip title="Asignación parcial">
                    <span>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ChecklistRtlIcon />}
                            onClick={handleAsignacionParcial}
                            disabled={!haySeleccion}
                        >
                            Parcial
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title="Asignación total">
                    <span>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<LocalShippingIcon />}
                            onClick={handleAsignacionTotal}
                            disabled={!haySeleccion}
                        >
                            Total
                        </Button>
                    </span>
                </Tooltip>
            </Box>
        </Paper>
    );
};

export default BuscadorEnviosClienteGeolocalizacionPanel;

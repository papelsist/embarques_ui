import React, { useContext, useMemo, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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
} from '@mui/material';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { apiUrl } from '../../conf/axios_instance';

const TIPOS = ['CON', 'COD', 'CRE'];

const PANEL_WIDTH = 420;
const PANEL_HEIGHT = 500;

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

const BuscadorEnvioGeolocalizacionPanel = ({
    overlayZIndex = 1400,
    onClose,
    onEnvioSeleccionadoMapa,
    onAsignacionParcial,
    onAsignacionTotal,
}) => {
    const { sucursal } = useContext(ContextEmbarques);
    const [documento, setDocumento] = useState('');
    const [origen, setOrigen] = useState('');
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

    const buscar = async () => {
        if (!documento || !origen) return;
        setBuscando(true);
        setEnvios([]);
        setEnvioSeleccionadoId(null);
        setEnvioDetalleId(null);
        setMessage(null);
        try {
            const url = `${apiUrl.url}embarques/get_envio_pendiente/`;
            const response = await axios.get(url, {
                params: {
                    documento,
                    origen,
                    sucursal: sucursal?.nombre,
                },
            });
            const lista = response.data?.envios || [];
            if (response.data?.message === 'OK' && lista.length > 0) {
                setEnvios(lista);
            } else {
                setMessage('No se encontró el envío pendiente');
            }
        } catch (error) {
            console.error('Error al buscar envío:', error);
            setMessage('Error al buscar el envío');
        } finally {
            setBuscando(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && documento && origen && !buscando) {
            e.preventDefault();
            buscar();
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
                    <TroubleshootIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight="bold">
                        Buscador de envío
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
                <TextField
                    label="Documento"
                    name="documento"
                    type="number"
                    size="small"
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ width: 120, flexShrink: 0 }}
                />
                <FormControl size="small" sx={{ width: 100, flexShrink: 0 }}>
                    <InputLabel id="buscador-origen-label">Origen</InputLabel>
                    <Select
                        labelId="buscador-origen-label"
                        value={origen}
                        label="Origen"
                        onChange={(e) => setOrigen(e.target.value)}
                        MenuProps={{
                            disablePortal: false,
                            sx: { zIndex: overlayZIndex },
                            PaperProps: { sx: { zIndex: overlayZIndex } },
                            style: { zIndex: overlayZIndex },
                        }}
                    >
                        {TIPOS.map((tipo) => (
                            <MenuItem key={tipo} value={tipo}>
                                {tipo}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
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
                    disabled={!documento || !origen || buscando}
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

export default BuscadorEnvioGeolocalizacionPanel;

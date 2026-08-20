import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Chip,
    Backdrop,
    Slide,
    Tooltip,
    TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import axios from 'axios';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { apiUrl } from '../../conf/axios_instance';

const PANEL_WIDTH = '35%';

const nowIsoLocal = () => new Date().toISOString().replace('Z', '');

const formatFechaHora = (value) => {
    if (!value) return null;
    try {
        return new Date(value).toLocaleString('es-MX');
    } catch {
        return String(value);
    }
};

const StatusRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: 1, minWidth: 0 }}>
        {value ? (
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 16 }} />
        ) : (
            <HighlightOffIcon color="disabled" sx={{ fontSize: 16 }} />
        )}
        <Typography variant="caption" color="text.secondary" noWrap>
            {label}: {value ? formatFechaHora(value) : 'Pendiente'}
        </Typography>
    </Box>
);

const ControlRow = ({ children, action }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            width: '100%',
            minHeight: 34,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>{children}</Box>
        <Box
            sx={{
                width: 34,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {action || null}
        </Box>
    </Box>
);

const toBitacoraPartida = (partida) => ({
    entregaId: partida.id,
    arribo: partida.arribo || null,
    arribo_latitud: partida.arribo_latitud || null,
    arribo_longitud: partida.arribo_longitud || null,
    recepcion: partida.recepcion || null,
    recepcion_latitud: partida.recepcion_latitud || null,
    recepcion_longitud: partida.recepcion_longitud || null,
    recibio: partida.recibio || null,
});

const EmbarqueTransitoDetalleLateral = ({
    open,
    onClose,
    embarque,
    onEntregaEliminada,
    onEntregaActualizada,
    isFullscreen = false,
}) => {
    const { auth } = useContext(ContextEmbarques);
    const [partidas, setPartidas] = useState([]);
    const [savingId, setSavingId] = useState(null);
    const [recibiosBloqueados, setRecibiosBloqueados] = useState(() => new Set());

    useEffect(() => {
        const lista = embarque?.partidas || [];
        setPartidas(lista);
        setRecibiosBloqueados(
            new Set(
                lista
                    .filter((p) => (p.recibio || '').trim())
                    .map((p) => p.id)
            )
        );
    }, [embarque]);

    const configureSwalZIndex = () => {
        if (!isFullscreen) return;
        const applyZIndex = () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) swalContainer.style.zIndex = '13000';
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) swalPopup.style.zIndex = '13001';
            const swalBackdrop =
                document.querySelector('.swal2-backdrop-show') ||
                document.querySelector('.swal2-backdrop');
            if (swalBackdrop) swalBackdrop.style.zIndex = '12999';
        };
        applyZIndex();
        setTimeout(applyZIndex, 10);
        setTimeout(applyZIndex, 50);
        setTimeout(applyZIndex, 100);
    };

    const warn = (text) => {
        Swal.fire({
            icon: 'warning',
            title: 'Atención',
            text,
            didOpen: configureSwalZIndex,
        });
    };

    const persistPartida = async (partidaActualizada) => {
        if (!embarque?.id) return false;
        setSavingId(partidaActualizada.id);
        try {
            const url = `${apiUrl.url}embarques/actualizar_bitacora`;
            await axios.post(
                url,
                {
                    id: embarque.id,
                    partidas: [toBitacoraPartida(partidaActualizada)],
                },
                { headers: { Authorization: `Bearer ${auth.access}` } }
            );
            setPartidas((prev) =>
                prev.map((p) => (p.id === partidaActualizada.id ? partidaActualizada : p))
            );
            if (onEntregaActualizada) {
                onEntregaActualizada(partidaActualizada);
            }
            return true;
        } catch (error) {
            console.error('Error al actualizar bitácora:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el cambio',
                didOpen: configureSwalZIndex,
            });
            return false;
        } finally {
            setSavingId(null);
        }
    };

    const handleRegistrarArribo = async (partida) => {
        if (partida.arribo) return;
        await persistPartida({
            ...partida,
            arribo: nowIsoLocal(),
        });
    };

    const handleRegistrarRecepcion = async (partida) => {
        if (!partida.arribo) {
            warn('Debe registrar arribo previamente');
            return;
        }
        if (partida.recepcion) return;
        await persistPartida({
            ...partida,
            recepcion: nowIsoLocal(),
        });
    };

    const handleRecibioChange = (partidaId, value) => {
        if (recibiosBloqueados.has(partidaId)) return;
        setPartidas((prev) =>
            prev.map((p) => (p.id === partidaId ? { ...p, recibio: value } : p))
        );
    };

    const handleGuardarRecibio = async (partida) => {
        if (recibiosBloqueados.has(partida.id)) return;
        if (!partida.recepcion) {
            warn('Debe registrar recepción previamente');
            return;
        }
        const nombre = (partida.recibio || '').trim();
        if (!nombre) {
            warn('Indique quién recibió');
            return;
        }

        const ok = await persistPartida({ ...partida, recibio: nombre });
        if (ok) {
            setRecibiosBloqueados((prev) => new Set(prev).add(partida.id));
        }
    };

    const handleBorrarEntrega = (partida) => {
        if (partida.arribo) {
            warn('No se puede eliminar un envío que ya tiene arribo registrado');
            return;
        }

        Swal.fire({
            title: `¿Está seguro de borrar ${partida.documento} del Cte: ${partida.destinatario}?`,
            text: 'Esta acción no se puede revertir!',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                const url = `${apiUrl.url}embarques/eliminar_entrega`;
                const resp = await axios.post(
                    url,
                    { ...partida, entregaId: partida.id },
                    { headers: { Authorization: `Bearer ${auth.access}` } }
                );
                if (resp.data.deleted >= 0) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado!',
                        text: 'El envío ha sido borrado!',
                        didOpen: configureSwalZIndex,
                    });
                    if (onEntregaEliminada) {
                        onEntregaEliminada(partida.id);
                    }
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo eliminar!',
                        text: 'Hubo un error!',
                        didOpen: configureSwalZIndex,
                    });
                }
            } catch (error) {
                console.error('Error al eliminar entrega:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'No se pudo eliminar!',
                    text: 'Hubo un error!',
                    didOpen: configureSwalZIndex,
                });
            }
        });
    };

    return (
        <>
            <Backdrop
                open={open}
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1200,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }}
            />
            <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: PANEL_WIDTH,
                        minWidth: PANEL_WIDTH,
                        maxWidth: PANEL_WIDTH,
                        height: '100%',
                        zIndex: 1201,
                        bgcolor: 'background.paper',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        borderTopRightRadius: 12,
                        borderBottomRightRadius: 12,
                        boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: 'divider',
                            flexShrink: 0,
                            minHeight: 64,
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                Envíos del embarque
                            </Typography>
                            {embarque?.documento && (
                                <Typography variant="caption" color="text.secondary">
                                    Emb. {embarque.documento} — {embarque.operador?.nombre || 'N/A'}
                                </Typography>
                            )}
                        </Box>
                        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                            Entregas ({partidas.length})
                        </Typography>

                        {partidas.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No hay envíos en este embarque
                            </Typography>
                        ) : (
                            <List dense disablePadding>
                                {partidas.map((partida, index) => {
                                    const isSaving = savingId === partida.id;
                                    return (
                                        <React.Fragment key={partida.id || index}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    px: 0,
                                                    py: 1.25,
                                                    flexDirection: 'row',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                                                        {partida.tipo_documento && (
                                                            <Chip size="small" label={partida.tipo_documento} variant="outlined" />
                                                        )}
                                                        {partida.sucursal && (
                                                            <Chip size="small" label={partida.sucursal} variant="outlined" />
                                                        )}
                                                    </Box>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="body2" fontWeight="medium">
                                                                {partida.documento || 'Sin documento'} — {partida.destinatario || 'Sin destinatario'}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Box sx={{ mt: 0.5 }} component="span">
                                                                <ControlRow
                                                                    action={
                                                                        !partida.arribo ? (
                                                                            <Tooltip title="Registrar arribo">
                                                                                <span>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="success"
                                                                                        disabled={isSaving}
                                                                                        onClick={() => handleRegistrarArribo(partida)}
                                                                                    >
                                                                                        <FlightLandIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </span>
                                                                            </Tooltip>
                                                                        ) : null
                                                                    }
                                                                >
                                                                    {partida.arribo ? (
                                                                        <StatusRow label="Arribo" value={partida.arribo} />
                                                                    ) : (
                                                                        <>
                                                                            <HighlightOffIcon color="disabled" sx={{ fontSize: 16, mr: 0.75 }} />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Arribo: Pendiente
                                                                            </Typography>
                                                                        </>
                                                                    )}
                                                                </ControlRow>

                                                                <ControlRow
                                                                    action={
                                                                        !partida.recepcion ? (
                                                                            <Tooltip title="Registrar recepción">
                                                                                <span>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="warning"
                                                                                        disabled={isSaving || !partida.arribo}
                                                                                        onClick={() => handleRegistrarRecepcion(partida)}
                                                                                    >
                                                                                        <AssignmentTurnedInIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </span>
                                                                            </Tooltip>
                                                                        ) : null
                                                                    }
                                                                >
                                                                    {partida.recepcion ? (
                                                                        <StatusRow label="Recepción" value={partida.recepcion} />
                                                                    ) : (
                                                                        <>
                                                                            <HighlightOffIcon color="disabled" sx={{ fontSize: 16, mr: 0.75 }} />
                                                                            <Typography variant="caption" color="text.secondary">
                                                                                Recepción: Pendiente
                                                                            </Typography>
                                                                        </>
                                                                    )}
                                                                </ControlRow>

                                                                {recibiosBloqueados.has(partida.id) ? (
                                                                    <Box sx={{ mt: 0.5, minHeight: 34, display: 'flex', alignItems: 'center' }}>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Recibió: {partida.recibio}
                                                                        </Typography>
                                                                    </Box>
                                                                ) : partida.recepcion ? (
                                                                    <ControlRow
                                                                        action={
                                                                            <Tooltip title="Guardar quien recibió">
                                                                                <span>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="primary"
                                                                                        disabled={
                                                                                            isSaving ||
                                                                                            !(partida.recibio || '').trim()
                                                                                        }
                                                                                        onClick={() => handleGuardarRecibio(partida)}
                                                                                    >
                                                                                        <SaveIcon sx={{ fontSize: 18 }} />
                                                                                    </IconButton>
                                                                                </span>
                                                                            </Tooltip>
                                                                        }
                                                                    >
                                                                        <TextField
                                                                            label="Recibió"
                                                                            size="small"
                                                                            variant="standard"
                                                                            value={partida.recibio || ''}
                                                                            disabled={isSaving}
                                                                            onChange={(e) =>
                                                                                handleRecibioChange(partida.id, e.target.value)
                                                                            }
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleGuardarRecibio({
                                                                                        ...partida,
                                                                                        recibio: e.target.value,
                                                                                    });
                                                                                }
                                                                            }}
                                                                            sx={{ width: '50%', maxWidth: '50%' }}
                                                                            inputProps={{ style: { fontSize: 12 } }}
                                                                            InputLabelProps={{ style: { fontSize: 11 } }}
                                                                        />
                                                                    </ControlRow>
                                                                ) : null}

                                                                <StatusRow label="Docs" value={partida.recepcion_documentos} />
                                                                {partida.tipo_documento === 'COD' && (
                                                                    <StatusRow label="Pago" value={partida.recepcion_pago} />
                                                                )}
                                                            </Box>
                                                        }
                                                    />
                                                </Box>
                                                {!partida.arribo && (
                                                    <Tooltip title="Eliminar envío del embarque">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            disabled={isSaving}
                                                            onClick={() => handleBorrarEntrega(partida)}
                                                            sx={{ mt: 0.5, ml: 0.5 }}
                                                        >
                                                            <DeleteForeverIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </ListItem>
                                            {index < partidas.length - 1 && <Divider />}
                                        </React.Fragment>
                                    );
                                })}
                            </List>
                        )}
                    </Box>
                </Box>
            </Slide>
        </>
    );
};

export default EmbarqueTransitoDetalleLateral;

import React, { useState, useContext } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    FormControlLabel,
    Checkbox,
    Divider,
    Grid,
    IconButton,
    Paper,
    TextField,
    Tooltip,
    Typography,
    CircularProgress,
    Chip,
    Alert,
} from '@mui/material';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { formatDate } from '../../utils/dateUtils';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios';
import Swal from 'sweetalert2';

export const MANTENIMIENTO_ENTREGA_WIDTH = 420;
export const MANTENIMIENTO_ENTREGA_HEIGHT = 520;
const RESULT_SECTION_HEIGHT = 268;

const MantenimientoEntrega = ({ setOpenDialog, onSaved }) => {
    const [entrega, setEntrega] = useState(null);
    const [message, setMessage] = useState(null);
    const [documento, setDocumento] = useState('');
    const [embarque, setEmbarque] = useState('');
    const [cancelarArribo, setCancelarArribo] = useState(false);
    const [cancelarRecepcion, setCancelarRecepcion] = useState(false);
    const [buscando, setBuscando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const { auth, sucursal } = useContext(ContextEmbarques);

    const resetForm = () => {
        setEntrega(null);
        setMessage(null);
        setDocumento('');
        setEmbarque('');
        setCancelarArribo(false);
        setCancelarRecepcion(false);
    };

    const handleCheckBox = (e) => {
        if (e.target.name === 'checkRecepcion') {
            setCancelarRecepcion(e.target.checked);
            if (!e.target.checked && !cancelarArribo) {
                setCancelarArribo(false);
            }
        }
        if (e.target.name === 'checkArribo') {
            setCancelarArribo(e.target.checked);
            if (e.target.checked && entrega?.recepcion) {
                setCancelarRecepcion(true);
            }
        }
    };

    const handleSalir = () => {
        setOpenDialog(false);
        resetForm();
    };

    const handleSalvar = async () => {
        if (!entrega) return;
        setGuardando(true);
        try {
            const url = `${apiUrl.url}embarques/actualizar_bitacora_entrega/`;
            const data = {
                entrega_id: entrega.id,
                cancelar_arribo: cancelarArribo,
                cancelar_recepcion: cancelarRecepcion,
            };
            const resp = await axios.put(url, data, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            if (onSaved) {
                onSaved();
            }
            handleSalir();
            Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: resp.data.message,
            });
        } catch (error) {
            console.error('Error al guardar mantenimiento entrega:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el cambio',
            });
        } finally {
            setGuardando(false);
        }
    };

    const getData = async () => {
        if (!documento || !embarque) {
            setMessage('Indique documento y embarque');
            return;
        }
        setBuscando(true);
        setEntrega(null);
        setMessage(null);
        setCancelarArribo(false);
        setCancelarRecepcion(false);
        try {
            const url = `${apiUrl.url}embarques/search_entrega/`;
            const params = {
                documento,
                embarque,
                sucursal: sucursal.nombre,
            };
            const resp = await axios.get(url, {
                params,
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setMessage(resp.data.message);
            if (resp.data.message === 'Entrega encontrada') {
                setEntrega(resp.data.data);
            }
        } catch (error) {
            console.error('Error al buscar entrega:', error);
            setMessage('Error al buscar la entrega');
        } finally {
            setBuscando(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && documento && embarque && !buscando) {
            e.preventDefault();
            getData();
        }
    };

    const encontrada = message === 'Entrega encontrada';

    return (
        <Paper
            elevation={0}
            sx={{
                width: MANTENIMIENTO_ENTREGA_WIDTH,
                maxWidth: '100%',
                height: MANTENIMIENTO_ENTREGA_HEIGHT,
                minHeight: MANTENIMIENTO_ENTREGA_HEIGHT,
                maxHeight: MANTENIMIENTO_ENTREGA_HEIGHT,
                p: 2.5,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ManageHistoryIcon color="secondary" />
                    <Typography variant="h6" fontWeight="bold">
                        Mantenimiento de entrega
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleSalir} disabled={guardando} aria-label="Cerrar">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider />

            <Grid container spacing={1.5} alignItems="flex-end">
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Documento"
                        value={documento}
                        name="documento"
                        size="small"
                        fullWidth
                        onChange={(e) => setDocumento(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Grid>
                <Grid item xs={12} sm={5}>
                    <TextField
                        label="Embarque"
                        value={embarque}
                        name="embarque"
                        size="small"
                        fullWidth
                        onChange={(e) => setEmbarque(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Tooltip title="Buscar entrega">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={getData}
                                disabled={!documento || !embarque || buscando}
                                sx={{ width: 40, height: 40 }}
                            >
                                {buscando ? (
                                    <CircularProgress size={22} />
                                ) : (
                                    <SearchIcon />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                </Grid>
            </Grid>

            <Box
                sx={{
                    flex: 1,
                    minHeight: RESULT_SECTION_HEIGHT,
                    height: RESULT_SECTION_HEIGHT,
                    overflow: 'auto',
                    flexShrink: 0,
                }}
            >
                {message && !encontrada ? (
                    <Alert severity="error" sx={{ height: '100%', boxSizing: 'border-box', alignItems: 'flex-start' }}>
                        {message}
                    </Alert>
                ) : entrega ? (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', height: '100%', boxSizing: 'border-box' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {entrega.destinatario}
                        </Typography>
                        <Chip size="small" label={entrega.origen} color="primary" variant="outlined" />
                    </Box>
                    <Grid container spacing={1} sx={{ mb: 1.5 }}>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                                Documento
                            </Typography>
                            <Typography variant="body2">{entrega.documento}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                                Fecha
                            </Typography>
                            <Typography variant="body2">
                                {formatDate(entrega.fecha_documento)}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                                Operador
                            </Typography>
                            <Typography variant="body2">{entrega.operador || 'N/A'}</Typography>
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 1.5 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Arribo
                                </Typography>
                                <Typography variant="body2" noWrap>
                                    {entrega.arribo || 'Pendiente'}
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="checkArribo"
                                        checked={cancelarArribo}
                                        disabled={!entrega.arribo}
                                        onChange={handleCheckBox}
                                    />
                                }
                                label="Cancelar"
                            />
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                p: 1,
                                borderRadius: 1,
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Recepción
                                </Typography>
                                <Typography variant="body2" noWrap>
                                    {entrega.recepcion || 'Pendiente'}
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="checkRecepcion"
                                        checked={cancelarRecepcion}
                                        disabled={!entrega.recepcion}
                                        onChange={handleCheckBox}
                                    />
                                }
                                label="Cancelar"
                            />
                        </Box>
                    </Box>
                </Paper>
                ) : (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'grey.50',
                            px: 2,
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                            {buscando
                                ? 'Buscando entrega...'
                                : 'El detalle de la entrega aparecerá aquí'}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <Button
                    variant="contained"
                    onClick={handleSalvar}
                    disabled={!entrega || guardando || (!cancelarArribo && !cancelarRecepcion)}
                >
                    {guardando ? 'Guardando...' : 'Guardar'}
                </Button>
            </Box>
        </Paper>
    );
};

export default MantenimientoEntrega;

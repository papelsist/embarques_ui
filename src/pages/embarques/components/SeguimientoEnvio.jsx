import React, { useState, useContext } from 'react';
import {
    Typography,
    Divider,
    Box,
    Grid,
    TextField,
    IconButton,
    List,
    ListItem,
    ListSubheader,
    Paper,
    Alert,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';
import { changeDateFormat } from '../../../utils/dateUtils';
import { ContextEmbarques } from '../../../context/ContextEmbarques';

const columnHeaderSx = {
    fontSize: 12,
    fontWeight: 600,
    color: 'text.secondary',
    textTransform: 'uppercase',
};

const SeguimientoEnvio = ({ setOpenDialogSeguimiento, overlayZIndex = 1400 }) => {
    const [fechaDocumento, setFechaDocumento] = useState(dayjs());
    const [documento, setDocumento] = useState('');
    const [message, setMessage] = useState(null);
    const [entregas, setEntregas] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const { sucursal } = useContext(ContextEmbarques);

    const onCloseDialog = () => {
        setOpenDialogSeguimiento(false);
        setFechaDocumento(dayjs());
        setMessage(null);
        setDocumento('');
        setEntregas([]);
    };

    const getEntregas = async () => {
        if (!documento || !sucursal) {
            setMessage('Favor de llenar los campos');
            return;
        }
        setBuscando(true);
        setEntregas([]);
        setMessage(null);
        const url = `${apiUrl.url}embarques/seguimiento_envio?`;
        const params = {
            documento,
            fecha: fechaDocumento.format('YYYY-MM-DD'),
            sucursal: sucursal.nombre,
        };
        try {
            const response = await axios.get(url, { params });
            if (response.data?.length > 0) {
                setEntregas(response.data);
            } else {
                setMessage('No se encontró el envío');
            }
        } catch (error) {
            console.error('Error al buscar seguimiento:', error);
            setMessage('Error al buscar el envío');
        } finally {
            setBuscando(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && documento && !buscando) {
            e.preventDefault();
            getEntregas();
        }
    };

    const esEnvioCod = (entrega) => (entrega?.tipo_documento || '').toUpperCase() === 'COD';

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                minWidth: { xs: '100%', sm: 560 },
                maxWidth: 900,
                height: '100%',
                minHeight: 480,
                maxHeight: '85vh',
                p: 2.5,
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MonitorHeartIcon color="info" />
                        <Typography variant="h6" fontWeight="bold">
                            Seguimiento de envíos
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onCloseDialog} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                <Typography variant="body2" color="text.secondary">
                    Consulte el estatus de entregas por documento y fecha.
                </Typography>
                <Divider />

                <Grid container spacing={1.5} alignItems="flex-end">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            variant="outlined"
                            name="documento"
                            label="Documento"
                            size="small"
                            fullWidth
                            value={documento}
                            onChange={(e) => setDocumento(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DatePicker
                            label="Fecha documento"
                            value={fechaDocumento}
                            onChange={(fecha) => setFechaDocumento(fecha)}
                            slotProps={{
                                textField: { size: 'small', fullWidth: true },
                                popper: {
                                    sx: { zIndex: overlayZIndex },
                                    style: { zIndex: overlayZIndex },
                                },
                                desktopPaper: {
                                    sx: { zIndex: overlayZIndex },
                                },
                                mobilePaper: {
                                    sx: { zIndex: overlayZIndex },
                                },
                                dialog: {
                                    sx: { zIndex: overlayZIndex },
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                        <IconButton
                            color="primary"
                            onClick={getEntregas}
                            disabled={!documento || buscando}
                            sx={{ width: 40, height: 40 }}
                        >
                            {buscando ? <CircularProgress size={22} /> : <SearchIcon />}
                        </IconButton>
                    </Grid>
                </Grid>

                {message && (
                    <Alert severity="warning" sx={{ py: 0.5 }}>
                        {message}
                    </Alert>
                )}
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5 }}>
                {entregas.map((entrega) => {
                    const esCod = esEnvioCod(entrega);
                    return (
                    <Accordion
                        key={`${entrega.envio_id || entrega.id}-${entrega.embarque}`}
                        disableGutters
                        sx={{ mb: 1, '&:before': { display: 'none' } }}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ width: '100%', pr: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight="bold">
                                        {entrega.documento} — {entrega.destinatario || 'Sin destinatario'}
                                    </Typography>
                                    {entrega.tipo_documento && (
                                        <Typography
                                            variant="body2"
                                            color={esCod ? 'error.main' : 'text.secondary'}
                                        >
                                            {entrega.tipo_documento}
                                        </Typography>
                                    )}
                                </Box>
                                {entrega.direccion && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        display="block"
                                        sx={{ mb: 0.75, wordBreak: 'break-word' }}
                                    >
                                        {entrega.direccion}
                                    </Typography>
                                )}
                                <Grid container spacing={0.5} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" fontWeight="medium" color="primary" noWrap>
                                            Emb. {entrega.embarque}
                                            {entrega.sucursal_embarque && (
                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    fontWeight="normal"
                                                >
                                                    {' · '}{entrega.sucursal_embarque}
                                                </Typography>
                                            )}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            Op: {entrega.operador}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={3}>
                                        <Typography variant="caption" color="text.secondary">
                                            {changeDateFormat(entrega.embarque_fecha)}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                        mt: 0.5,
                                    }}
                                >
                                    {[
                                        { label: 'Salida', value: entrega.salida },
                                        { label: 'Arribo', value: entrega.arribo },
                                        { label: 'Recepción', value: entrega.recepcion },
                                        { label: 'Regreso', value: entrega.regreso },
                                        { label: 'Recibió', value: entrega.recibio },
                                    ].map(({ label, value }) => (
                                        <Box key={label} sx={{ minWidth: 80, flex: '1 1 80px' }}>
                                            <Typography sx={columnHeaderSx}>{label}</Typography>
                                            <Typography variant="caption" display="block" noWrap>
                                                {value || '—'}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0 }}>
                            <Divider sx={{ mb: 1 }} />
                            <List dense disablePadding>
                                <ListSubheader sx={{ bgcolor: 'grey.100', lineHeight: '32px' }}>
                                    <Grid container>
                                        <Grid item xs={3}>
                                            <Typography sx={columnHeaderSx}>Clave</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography sx={columnHeaderSx}>Descripción</Typography>
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Typography sx={columnHeaderSx}>Cantidad</Typography>
                                        </Grid>
                                    </Grid>
                                </ListSubheader>
                                {entrega.detalles?.map((detalle) => (
                                    <ListItem key={detalle.id} sx={{ py: 0.75, px: 1 }}>
                                        <Grid container width="100%">
                                            <Grid item xs={3}>
                                                <Typography variant="body2">{detalle.clave}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">{detalle.descripcion}</Typography>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Typography variant="body2">{detalle.cantidad}</Typography>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                    );
                })}
            </Box>
        </Paper>
    );
};

export default SeguimientoEnvio;

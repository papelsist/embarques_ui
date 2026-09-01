import React, { useContext, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import BuscadorOperador from '../components/BuscadorOperador';
import Paper from '@mui/material/Paper';
import { Box, Divider, TextField, Grid, Typography, Button, IconButton } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import { apiUrl } from '../../../../conf/axios_instance';

import './EmbarqueForm.css';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const InfoField = ({ label, value }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" display="block">
            {label}
        </Typography>
        <Typography variant="body2" noWrap title={value || '—'}>
            {value || '—'}
        </Typography>
    </Box>
);

const CreateEmbarqueForm = ({
    setOpenDialog,
    getData,
    variant = 'default',
    isFullscreen = false,
    overlayZIndex = 1400,
}) => {
    const { auth, sucursal } = useContext(ContextEmbarques);
    const [operador, setOperador] = useState();
    const [comentario, setComentario] = useState('');
    const isGeo = variant === 'geolocalizacion';

    const configureSwalZIndex = () => {
        if (!isFullscreen) return;
        const z = overlayZIndex;
        const applyZIndex = () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) swalContainer.style.zIndex = String(z);
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) swalPopup.style.zIndex = String(z + 1);
            const swalBackdrop =
                document.querySelector('.swal2-backdrop-show') ||
                document.querySelector('.swal2-backdrop');
            if (swalBackdrop) swalBackdrop.style.zIndex = String(z - 1);
        };
        applyZIndex();
        setTimeout(applyZIndex, 10);
        setTimeout(applyZIndex, 50);
    };

    const handleChangeComentario = (e) => {
        setComentario(e.target.value);
    };

    const handleSalir = () => {
        setOpenDialog(false);
    };

    const handleSalvar = async (e) => {
        e?.preventDefault?.();
        const url = `${apiUrl.url}embarques/crear_embarque`;
        const data = {
            operador: operador.id,
            facturista: operador.facturista,
            sucursal: sucursal.id,
            comentario: comentario,
        };
        try {
            const resp = await axios.post(url, data, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setOpenDialog(false);
            Swal.fire({
                icon: 'success',
                title: 'Embarque creado',
                text: `Se creó el embarque No. ${resp.data.documento} para ${resp.data.operador.nombre}`,
                didOpen: configureSwalZIndex,
            });
            getData();
        } catch (error) {
            console.error('Error al crear embarque:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el embarque',
                didOpen: configureSwalZIndex,
            });
        }
    };

    const urlChofer = `${apiUrl.url}embarques/search_operador`;
    const fechaHoy = new Date().toLocaleDateString('es-MX');

    if (isGeo) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: 420,
                    maxWidth: '100%',
                    p: 2.5,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalShippingIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Alta de embarque
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleSalir} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                            <InfoField label="Sucursal" value={sucursal?.nombre} />
                        </Grid>
                        <Grid item xs={6}>
                            <InfoField label="Fecha" value={fechaHoy} />
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <BuscadorOperador
                        label="Operador"
                        apiUrl={urlChofer}
                        searchField="term"
                        setFound={setOperador}
                        size="small"
                        variant="outlined"
                        fullWidth
                        overlayZIndex={overlayZIndex + 1}
                    />
                    <TextField
                        label="Comentario"
                        name="comentario"
                        size="small"
                        fullWidth
                        value={comentario}
                        onChange={handleChangeComentario}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="small" onClick={handleSalvar} disabled={!operador}>
                        Crear embarque
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <div className="create-embarque-form-container">
            <Paper
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                elevation={0}
            >
                <Box component="div">
                    <Typography fontSize={20}>Alta de Embarque</Typography>
                    <Divider />
                    <Grid
                        container
                        columnSpacing={2}
                        sx={{
                            display: 'flex',
                            '& .MuiTextField-root': { ml: 1 },
                        }}
                    >
                        <Grid item xs={6}>
                            <TextField variant="standard" value={sucursal.nombre} disabled fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField variant="standard" value={fechaHoy} disabled fullWidth />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        columnSpacing={2}
                        sx={{
                            marginBottom: 1,
                            display: 'flex',
                            '& .MuiTextField-root': { mr: 1 },
                        }}
                    >
                        <Grid item xs={12}>
                            <BuscadorOperador
                                label="Seleccione un Operador"
                                apiUrl={urlChofer}
                                searchField="term"
                                setFound={setOperador}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        columnSpacing={2}
                        sx={{
                            marginBottom: 1,
                            display: 'flex',
                            '& .MuiTextField-root': { mr: 1 },
                        }}
                    >
                        <Grid item xs={12}>
                            <TextField
                                label="Comentario"
                                name="comentario"
                                variant="standard"
                                fullWidth
                                onChange={handleChangeComentario}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <Box>
                    <Divider sx={{ mb: 1 }} />
                    <Button sx={{ mr: 8, ml: 5 }} onClick={handleSalvar} disabled={!operador}>
                        Salvar
                    </Button>
                    <Button onClick={handleSalir}>Salir</Button>
                </Box>
            </Paper>
        </div>
    );
};

export default CreateEmbarqueForm;

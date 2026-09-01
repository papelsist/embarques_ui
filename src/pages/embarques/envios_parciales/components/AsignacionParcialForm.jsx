import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
    Box,
    Divider,
    Grid,
    Button,
    Tooltip,
    CircularProgress,
    Backdrop,
    Paper,
    IconButton,
    Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CloseIcon from '@mui/icons-material/Close';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import { objectIsEmpty } from '../../../../utils/embarqueUtils';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import Swal from 'sweetalert2';

import '../EnviosParciales.css';

const FORM_WIDTH = '50rem';
const FORM_HEIGHT = '70vh';
const TABLE_HEIGHT = '22rem';
const TABLE_HEIGHT_GEO = '18rem';

const AsignacionParcialForm = ({
    rowSelected,
    onCloseDialog,
    getData,
    isFullscreen = false,
    variant = 'default',
    overlayZIndex = 1400,
}) => {
    const { auth, sucursal, loading, setLoading } = useContext(ContextEmbarques);
    const [transportes, setTransportes] = useState([]);
    const [envio, setEnvio] = useState(null);
    const [embarque, setEmbarque] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [loadingForm, setLoadingForm] = useState(true);
    const isGeo = variant === 'geolocalizacion';
    const tableHeight = isGeo ? TABLE_HEIGHT_GEO : TABLE_HEIGHT;
    const menuZIndex = isFullscreen ? overlayZIndex : undefined;

    const configureSwalZIndex = () => {
        if (!isFullscreen) return;
        const applyZIndex = () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) swalContainer.style.zIndex = String(overlayZIndex);
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) swalPopup.style.zIndex = String(overlayZIndex + 1);
            const swalBackdrop =
                document.querySelector('.swal2-backdrop-show') ||
                document.querySelector('.swal2-backdrop');
            if (swalBackdrop) swalBackdrop.style.zIndex = String(overlayZIndex - 1);
        };
        applyZIndex();
        setTimeout(applyZIndex, 10);
        setTimeout(applyZIndex, 50);
        setTimeout(applyZIndex, 100);
    };

    const getTransportesDisponibles = async () => {
        if (!objectIsEmpty(auth)) {
            console.log('No esta autenticado');
            return;
        }
        const url = `${apiUrl.url}embarques/pendientes_salida`;
        const resp = await axios.get(url, {
            params: { sucursal: sucursal.id },
            headers: { Authorization: `Bearer ${auth.access}` },
        });
        setTransportes(resp.data || []);
    };

    const getEnvio = async () => {
        const envioId = Object.keys(rowSelected)[0];
        const url = `${apiUrl.url}embarques/envios_parciales/${envioId}/`;
        const resp = await axios.get(url, {
            headers: { Authorization: `Bearer ${auth.access}` },
        });
        setEnvio(resp.data);
        if (resp.data?.detalles) {
            setDetalles(resp.data.detalles);
        }
    };

    const handleSaveCell = (cell, value) => {
        const detallesTemp = [...detalles];
        let valor = Number(value);
        const saldo = Number(detallesTemp[cell.row.index]['saldo']);
        if (valor > saldo) {
            valor = saldo;
        }
        detallesTemp[cell.row.index]['enviar'] = valor;
        detallesTemp[cell.row.index]['pendiente'] = saldo - valor;
        setDetalles(detallesTemp);
    };

    const handleChange = (event) => {
        setEmbarque(event.target.value);
    };

    const handleCopiarSaldoAEnviar = () => {
        const detallesTemp = detalles.map((detalle) => {
            const saldo = Number(detalle.saldo);
            return {
                ...detalle,
                enviar: saldo,
                pendiente: 0,
            };
        });
        setDetalles(detallesTemp);
    };

    const handleAgregar = async () => {
        setLoading(true);

        const partidas = detalles.filter((detalle) => detalle.enviar);
        const url = `${apiUrl.url}embarques/asignar_envios_parciales`;
        const data = {
            embarque_id: embarque.id,
            envio_id: envio.id,
            detalles: partidas,
        };

        onCloseDialog();
        setLoading(false);

        if (partidas.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No se ha seleccionado ninguna partida',
                didOpen: configureSwalZIndex,
            });
            return;
        }

        Swal.fire({
            title: 'Asignacion de envios parciales',
            text: '¿Desea asignar el envío parcial?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resp = await axios.post(url, data, {
                    headers: { Authorization: `Bearer ${auth.access}` },
                });

                if (resp.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Envio parcial asignado',
                        text: `Envio ${envio.documento} asignado correctamente a ${embarque.operador.nombre}`,
                        didOpen: configureSwalZIndex,
                    }).then(() => {
                        getData();
                    });
                }
            }
        });
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoadingForm(true);
            try {
                await Promise.all([getTransportesDisponibles(), getEnvio()]);
            } catch (error) {
                console.error('Error al cargar asignación parcial:', error);
                if (!cancelled) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar la información del envío',
                        didOpen: configureSwalZIndex,
                    });
                }
            } finally {
                if (!cancelled) setLoadingForm(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'clave',
                header: 'Clave',
                size: 80,
                enableEditing: () => false,
            },
            {
                accessorKey: 'me_descripcion',
                header: 'Descripcion',
                size: 200,
                enableEditing: () => false,
            },
            {
                accessorKey: 'me_cantidad',
                header: 'Cantidad',
                size: 80,
                enableEditing: () => false,
            },
            {
                accessorKey: 'saldo',
                header: 'Saldo',
                size: 80,
                enableEditing: () => false,
            },
            {
                accessorKey: 'enviar',
                header: 'Enviar',
                id: 'enviar',
                size: 80,
                enableEditing: (row) => row.original.saldo > 0,
            },
            {
                accessorKey: 'pendiente',
                header: 'Pendiente',
                size: 80,
                enableEditing: () => false,
            },
        ],
        []
    );

    const selectMenuProps = {
        disablePortal: false,
        PaperProps: {
            sx: { zIndex: menuZIndex },
            style: { zIndex: menuZIndex },
        },
        style: { zIndex: menuZIndex },
    };

    const tableSection = (
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, flexShrink: 0 }}>
                <Tooltip title="Asignar el saldo completo a enviar para todas las partidas">
                    <span>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopiarSaldoAEnviar}
                            disabled={loadingForm || detalles.length === 0}
                        >
                            Asignación total
                        </Button>
                    </span>
                </Tooltip>
            </Box>
            <Box
                sx={{
                    height: tableHeight,
                    minHeight: tableHeight,
                    maxHeight: tableHeight,
                    overflow: 'hidden',
                    ...(isGeo && {
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                    }),
                }}
            >
                <MaterialReactTable
                    columns={columns}
                    data={detalles}
                    getRowId={(originalRow) => originalRow.id}
                    initialState={{
                        density: 'compact',
                        size: 'small',
                    }}
                    enablePagination={false}
                    enableRowVirtualization
                    enableTopToolbar={false}
                    enableBottomToolbar={false}
                    editingMode="cell"
                    enableEditing={!loadingForm}
                    muiTableContainerProps={{
                        sx: {
                            height: tableHeight,
                            maxHeight: tableHeight,
                        },
                    }}
                    muiTableBodyCellEditTextFieldProps={({ cell }) => ({
                        onBlur: (event) => {
                            if (cell.column.id === 'enviar') {
                                handleSaveCell(cell, event.target.value);
                            }
                        },
                    })}
                    localization={MRT_Localization_ES}
                />
            </Box>
        </Box>
    );

    const actionButtons = isGeo ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexShrink: 0 }}>
            <Button variant="outlined" size="small" onClick={onCloseDialog}>
                Cancelar
            </Button>
            <Button
                variant="contained"
                size="small"
                onClick={handleAgregar}
                disabled={!embarque || loading || loadingForm}
            >
                Asignar
            </Button>
        </Box>
    ) : (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 1,
                flexShrink: 0,
            }}
        >
            <Button sx={{ mr: 8, ml: 5 }} onClick={handleAgregar} disabled={!embarque || loading || loadingForm}>
                Asignar
            </Button>
            <Button onClick={onCloseDialog}>Salir</Button>
        </Box>
    );

    if (isGeo) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 2.5,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <Backdrop
                    open={loadingForm}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        backgroundColor: 'rgba(255,255,255,0.75)',
                        borderRadius: 1,
                    }}
                >
                    <CircularProgress />
                </Backdrop>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChecklistRtlIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            Asignación parcial
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={onCloseDialog} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {envio && (
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', flexShrink: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight="medium">
                                {envio.documento}
                            </Typography>
                            {envio.tipo_documento && (
                                <Chip
                                    size="small"
                                    label={envio.tipo_documento}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                            )}
                        </Box>
                        {envio.destinatario && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                {envio.destinatario}
                            </Typography>
                        )}
                    </Paper>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mt: -1 }}>
                    Seleccione el embarque e indique las cantidades a enviar por partida.
                </Typography>

                <Divider sx={{ flexShrink: 0 }} />

                <FormControl fullWidth size="small" disabled={loadingForm} sx={{ flexShrink: 0 }}>
                    <InputLabel id="embarque-parcial-label">Embarque</InputLabel>
                    <Select
                        labelId="embarque-parcial-label"
                        id="embarque-parcial-select"
                        value={embarque}
                        label="Embarque"
                        onChange={handleChange}
                        MenuProps={selectMenuProps}
                    >
                        {transportes.map((transporte) => (
                            <MenuItem key={transporte.id} value={transporte}>
                                {`${transporte.documento} - ${transporte.operador.nombre}`}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                    {tableSection}
                </Box>

                {actionButtons}
            </Paper>
        );
    }

    return (
        <Box
            className="asignacion_parcial_container"
            sx={{
                width: FORM_WIDTH,
                maxWidth: '95vw',
                height: FORM_HEIGHT,
                minHeight: FORM_HEIGHT,
                maxHeight: FORM_HEIGHT,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                boxSizing: 'border-box',
            }}
        >
            <Backdrop
                open={loadingForm}
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                    backgroundColor: 'rgba(255,255,255,0.75)',
                    borderRadius: 1,
                }}
            >
                <CircularProgress />
            </Backdrop>

            <Box sx={{ p: 2, flexShrink: 0 }}>
                <Typography variant="h6" component="div">
                    Asignacion Parcial
                </Typography>
            </Box>
            <Divider />

            <Box sx={{ flexShrink: 0 }}>
                <Grid container spacing={2} padding={1}>
                    <Grid item xs={6}>
                        <FormControl fullWidth disabled={loadingForm}>
                            <InputLabel id="embarque-parcial-label-legacy">Embarque</InputLabel>
                            <Select
                                labelId="embarque-parcial-label-legacy"
                                id="embarque-parcial-select-legacy"
                                value={embarque}
                                label="Embarque"
                                onChange={handleChange}
                                variant="standard"
                                MenuProps={selectMenuProps}
                            >
                                {transportes.map((transporte) => (
                                    <MenuItem key={transporte.id} value={transporte}>
                                        {`${transporte.documento} - ${transporte.operador.nombre}`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>
            <Divider />

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    m: 1,
                }}
            >
                {tableSection}
                {actionButtons}
            </Box>
        </Box>
    );
};

export default AsignacionParcialForm;

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
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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

const AsignacionParcialForm = ({ rowSelected, onCloseDialog, getData, isFullscreen = false }) => {
    const { auth, sucursal, loading, setLoading } = useContext(ContextEmbarques);
    const [transportes, setTransportes] = useState([]);
    const [envio, setEnvio] = useState(null);
    const [embarque, setEmbarque] = useState('');
    const [detalles, setDetalles] = useState([]);
    const [loadingForm, setLoadingForm] = useState(true);

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
                            <InputLabel id="embarque-parcial-label">Embarque</InputLabel>
                            <Select
                                labelId="embarque-parcial-label"
                                id="embarque-parcial-select"
                                value={embarque}
                                label="Embarque"
                                onChange={handleChange}
                                variant="standard"
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            zIndex: isFullscreen ? 13000 : undefined,
                                        },
                                    },
                                    style: {
                                        zIndex: isFullscreen ? 13000 : undefined,
                                    },
                                }}
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
                            height: TABLE_HEIGHT,
                            minHeight: TABLE_HEIGHT,
                            maxHeight: TABLE_HEIGHT,
                            overflow: 'hidden',
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
                                    height: TABLE_HEIGHT,
                                    maxHeight: TABLE_HEIGHT,
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
                    <Button
                        sx={{ mr: 8, ml: 5 }}
                        onClick={handleAgregar}
                        disabled={!embarque || loading || loadingForm}
                    >
                        Asignar
                    </Button>
                    <Button onClick={onCloseDialog}>Salir</Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AsignacionParcialForm;

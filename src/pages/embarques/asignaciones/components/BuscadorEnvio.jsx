import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { useForm } from '../../../../hooks/useForm';
import { apiUrl } from '../../../../conf/axios_instance';
import {
    Paper,
    Box,
    Grid,
    FormControl,
    TextField,
    Typography,
    Divider,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    LinearProgress,
    Button,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import CloseIcon from '@mui/icons-material/Close';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import './BuscadorEnvio.css';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const initialParams = {
    tipo: 'VENTA',
    documento: '',
    fecha_documento: '',
};

const legacyColumns = [
    { name: 'Clave', selector: (row) => row.clave },
    { name: 'Descripcion', selector: (row) => row.me_descripcion },
    { name: 'Cantidad', selector: (row) => row.me_cantidad },
    { name: 'Saldo', selector: (row) => row.saldo },
];

const BuscadorEnvio = ({
    setOpenDialog,
    agregarEntregas,
    variant = 'default',
    overlayZIndex = 1400,
}) => {
    const { auth, sucursal } = useContext(ContextEmbarques);
    const [loading, setLoading] = useState(false);
    const [envio, setEnvio] = useState(null);
    const [values, handleInputChange] = useForm(initialParams);
    const [selecteds, setSelecteds] = useState([]);
    const [total, setTotal] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [message, setMessage] = useState(null);
    const isGeo = variant === 'geolocalizacion';

    const getData = async () => {
        if (!values.documento || !values.fecha_documento) {
            setMessage('Indique documento y fecha');
            return;
        }
        const url = `${apiUrl.url}embarques/search_envio_surtido`;
        setEnvio(null);
        setMessage(null);
        setRowSelection({});
        setSelecteds([]);
        setLoading(true);
        try {
            const datos = await axios.get(url, {
                params: { ...values, sucursal: sucursal.nombre },
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            if (datos.data) {
                setEnvio(datos.data);
            } else {
                setMessage('No se encontró el envío');
            }
        } catch (error) {
            console.error('Error al buscar envío:', error);
            setMessage('Error al buscar el envío');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && values.documento && values.fecha_documento && !loading) {
            e.preventDefault();
            getData();
        }
    };

    const handleSelectedRow = ({ selectedRows }) => {
        setSelecteds(selectedRows);
    };

    const selectedDetalles = useMemo(() => {
        if (!envio?.detalles) return [];
        return envio.detalles.filter((detalle) => {
            const rowId = String(detalle.id ?? detalle.clave);
            return rowSelection[rowId];
        });
    }, [envio, rowSelection]);

    const handleAgregar = () => {
        const rows = isGeo ? selectedDetalles : selecteds;
        if (rows.length === 0) return;
        const entregas = buildEntregas(rows);
        agregarEntregas(entregas);
        setOpenDialog(false);
    };

    const buildEntregas = (rows) => {
        const entregas = [];
        rows.forEach((selected) => {
            const entrega = {
                entregaId: null,
                entregaDetId: null,
                envioId: envio.id,
                entidad: values.tipo,
                documento: envio.documento,
                fechaDocumento: envio.fecha_documento,
                destinatario: envio.destinatario,
                sucursal: envio.sucursal,
                tipoDocumento: envio.tipo_documento,
                valor: envio.valor,
                kilos: envio._me_kilos,
                enviar: 0,
                ...selected,
            };
            if (total) {
                entrega.enviar = entrega.saldo;
                entrega.saldoEnvio = entrega.saldo;
            }
            entregas.push(entrega);
        });
        return entregas;
    };

    const handleTotal = (e) => {
        setTotal(e.target.checked);
    };

    const rowDisabledCriteria = (row) => row.saldo <= 0;

    const mrtColumns = useMemo(
        () => [
            { accessorKey: 'clave', header: 'Clave', size: 70, enableEditing: false },
            { accessorKey: 'me_descripcion', header: 'Descripción', size: 160, enableEditing: false },
            { accessorKey: 'me_cantidad', header: 'Cant.', size: 60, enableEditing: false },
            { accessorKey: 'saldo', header: 'Saldo', size: 60, enableEditing: false },
        ],
        []
    );

    const menuProps = {
        disablePortal: false,
        PaperProps: { sx: { zIndex: overlayZIndex }, style: { zIndex: overlayZIndex } },
        style: { zIndex: overlayZIndex },
    };

    const haySeleccion = isGeo ? selectedDetalles.length > 0 : selecteds.length > 0;

    if (isGeo) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: 560,
                    maxWidth: '100%',
                    height: 520,
                    maxHeight: '85vh',
                    p: 2.5,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TroubleshootIcon color="primary" fontSize="small" />
                        <Typography variant="h6" fontWeight="bold">
                            Buscar envío
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setOpenDialog(false)} aria-label="Cerrar">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Grid container spacing={1.5} alignItems="flex-end">
                        <Grid item xs={12} sm={3}>
                            <FormControl size="small" fullWidth>
                                <InputLabel id="buscador-tipo-label">Tipo</InputLabel>
                                <Select
                                    labelId="buscador-tipo-label"
                                    name="tipo"
                                    value={values.tipo}
                                    label="Tipo"
                                    onChange={handleInputChange}
                                    MenuProps={menuProps}
                                >
                                    <MenuItem value="VENTA">VENTA</MenuItem>
                                    <MenuItem value="TRASLADO">TRASLADO</MenuItem>
                                    <MenuItem value="DEVOLUCION">DEVOLUCION</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Documento"
                                name="documento"
                                size="small"
                                fullWidth
                                value={values.documento}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Fecha documento"
                                name="fecha_documento"
                                type="date"
                                size="small"
                                fullWidth
                                value={values.fecha_documento}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <IconButton
                                color="primary"
                                onClick={getData}
                                disabled={!values.documento || !values.fecha_documento || loading}
                                sx={{ width: 40, height: 40 }}
                            >
                                {loading ? <CircularProgress size={22} /> : <SearchIcon />}
                            </IconButton>
                        </Grid>
                    </Grid>
                    <FormControlLabel
                        control={<Checkbox size="small" onChange={handleTotal} checked={total} />}
                        label={
                            <Typography variant="body2" color="text.secondary">
                                Asignar saldo total de partidas seleccionadas
                            </Typography>
                        }
                    />
                    {message && (
                        <Alert severity="warning" sx={{ py: 0.5 }}>
                            {message}
                        </Alert>
                    )}
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'hidden' }}>
                    {envio && (
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', flexShrink: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography variant="body2" fontWeight="bold">
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
                            <Typography variant="caption" color="text.secondary" display="block">
                                {envio.de_destinatario || envio.destinatario || 'Sin destinatario'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                                {envio.fecha_documento} · {envio.sucursal}
                            </Typography>
                        </Paper>
                    )}

                    {envio?.detalles && (
                        <Box
                            sx={{
                                flex: 1,
                                minHeight: 0,
                                overflow: 'hidden',
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 1,
                            }}
                        >
                            <MaterialReactTable
                                columns={mrtColumns}
                                data={envio.detalles}
                                getRowId={(row) => String(row.id ?? row.clave)}
                                enableTopToolbar={false}
                                enableBottomToolbar={false}
                                enablePagination={false}
                                enableColumnActions={false}
                                enableColumnFilters={false}
                                enableSorting={false}
                                enableRowSelection={(row) => row.original.saldo > 0}
                                onRowSelectionChange={setRowSelection}
                                state={{ rowSelection, density: 'compact' }}
                                layoutMode="grid"
                                muiTablePaperProps={{ sx: { boxShadow: 'none', height: '100%' } }}
                                muiTableContainerProps={{ sx: { maxHeight: '100%' } }}
                                localization={MRT_Localization_ES}
                            />
                        </Box>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleAgregar}
                        disabled={!haySeleccion}
                    >
                        Agregar al embarque
                    </Button>
                </Box>
            </Paper>
        );
    }

    return (
        <div className="buscador-envio-container">
            <Paper sx={{ height: '100%', width: '100%', padding: 3 }}>
                <Box>
                    <Typography>Buscador Envio</Typography>
                    <Divider />
                </Box>
                <Box sx={{ mb: 1 }}>
                    <Grid container columnSpacing={2}>
                        <Grid item xs={3}>
                            <FormControl variant="standard" fullWidth>
                                <InputLabel>Tipo</InputLabel>
                                <Select name="tipo" defaultValue="VENTA" onChange={handleInputChange}>
                                    <MenuItem value="VENTA">VENTA</MenuItem>
                                    <MenuItem value="TRASLADO">TRASLADO</MenuItem>
                                    <MenuItem value="DEVOLUCION">DEVOLUCION</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Documento"
                                variant="standard"
                                name="documento"
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                id="date"
                                label="Select Date"
                                type="date"
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                variant="standard"
                                name="fecha_documento"
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton aria-label="search" onClick={getData}>
                                <SearchIcon sx={{ fontSize: 35 }} />
                            </IconButton>
                        </Grid>
                        <Grid item xs={1}>
                            <FormControlLabel control={<Checkbox onChange={handleTotal} />} label="Total" />
                        </Grid>
                    </Grid>
                </Box>
                <Divider />
                <Box>
                    {loading && <LinearProgress />}
                    {envio?.detalles && (
                        <Box
                            component="div"
                            sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        >
                            <Box component="div">
                                <Grid container columnSpacing={2}>
                                    <Grid item xs={3}>
                                        {envio.documento}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {envio.fecha_documento}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {envio.sucursal}
                                    </Grid>
                                    <Grid item xs={3}>
                                        {envio.tipo_documento}
                                    </Grid>
                                    <Grid item xs={12}>
                                        {envio.de_destinatario}
                                    </Grid>
                                </Grid>
                            </Box>
                            <Divider />
                            <Box component="div">
                                <DataTable
                                    columns={legacyColumns}
                                    data={envio.detalles}
                                    fixedHeaderScrollHeight="25rem"
                                    onSelectedRowsChange={handleSelectedRow}
                                    selectableRowsHighlight
                                    selectableRowDisabled={rowDisabledCriteria}
                                    dense
                                    fixedHeader
                                    highlightOnHover
                                    pointerOnHover
                                    responsive
                                    striped
                                    selectableRows
                                    headCell
                                />
                            </Box>
                            <Box component="div">
                                <Divider sx={{ mb: 2 }} />
                                <Button sx={{ mr: 8, ml: 5 }} onClick={handleAgregar}>
                                    Agregar
                                </Button>
                                <Button onClick={() => setOpenDialog(false)}>Salir</Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>
        </div>
    );
};

export default BuscadorEnvio;

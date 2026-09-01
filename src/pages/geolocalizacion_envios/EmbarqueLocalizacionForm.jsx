import React, { useState, useMemo, useEffect, useContext } from 'react';
import axios from 'axios';
import {
    Box,
    Grid,
    Typography,
    Button,
    Paper,
    IconButton,
    Tooltip,
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CloseIcon from '@mui/icons-material/Close';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { sortObjectsList, makeSublistByProperty, makeMasterDetailObject } from '../../utils/embarqueUtils';
import { apiUrl } from '../../conf/axios_instance';
import Swal from 'sweetalert2';
import { ContextEmbarques } from '../../context/ContextEmbarques';

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

const cellEllipsisSx = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const deleteActionButtonSx = {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    p: 1,
};

const EmbarqueLocalizacionForm = ({
    embarque,
    setOpenDialog,
    getData,
    isFullscreen = false,
    handleRefresh,
    overlayZIndex = 1400,
}) => {
    const { auth, setLoading, sucursal, sucursales } = useContext(ContextEmbarques);
    const [embarqueData, setEmbarqueData] = useState(embarque);
    const [entregas, setEntregas] = useState([]);
    const [cp, setCp] = useState(false);

    const nombreSucursal = useMemo(() => {
        const raw = embarqueData?.sucursal;
        if (raw && typeof raw === 'object' && raw.nombre) return raw.nombre;
        const id = typeof raw === 'number' ? raw : Number(raw);
        if (!Number.isNaN(id)) {
            const match = sucursales?.find((s) => s.id === id);
            if (match?.nombre) return match.nombre;
        }
        return sucursal?.nombre || (typeof raw === 'string' ? raw : null);
    }, [embarqueData?.sucursal, sucursales, sucursal]);

    const swalZIndex = isFullscreen ? overlayZIndex : 1400;

    const configureSwalZIndex = () => {
        const applyZIndex = () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) swalContainer.style.zIndex = String(swalZIndex);
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) swalPopup.style.zIndex = String(swalZIndex + 1);
            const swalBackdrop =
                document.querySelector('.swal2-backdrop-show') ||
                document.querySelector('.swal2-backdrop');
            if (swalBackdrop) swalBackdrop.style.zIndex = String(swalZIndex - 1);
        };
        applyZIndex();
        setTimeout(applyZIndex, 10);
        setTimeout(applyZIndex, 50);
        setTimeout(applyZIndex, 100);
    };

    const hadleBorrar = (row) => {
        Swal.fire({
            title: `¿Está seguro de borrar Clave:${row.clave} Cant:${row.enviar}?`,
            text: 'Esta acción no se puede revertir!',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const resp = await borrarPatida(row);
                if (resp >= 0) {
                    const entregasNew = entregas.filter((entrega) => entrega.id !== row.id);
                    setEntregas(entregasNew);
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado!',
                        text: 'El envío ha sido borrado!',
                        didOpen: configureSwalZIndex,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo eliminar!',
                        text: 'Hubo un error!',
                        didOpen: configureSwalZIndex,
                    });
                }
            }
        });
    };

    const borrarPatida = async (row) => {
        const url = `${apiUrl.url}embarques/eliminar_entrega_det`;
        const res = await axios.post(url, row, {
            headers: { Authorization: `Bearer ${auth.access}` },
        });
        return res.data.deleted;
    };

    const handleSalir = () => {
        setOpenDialog(false);
        handleRefresh();
    };

    const handleSalvar = async () => {
        setLoading(true);
        try {
            const url = `${apiUrl.url}embarques/actualizar_embarque`;
            const partidas = buildPartidas();
            const data = {
                embarqueId: embarqueData.id,
                cp: cp,
                comentario: embarqueData.comentario,
                operador: embarqueData.operador.id,
                partidas: partidas,
            };
            await axios.post(url, data, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            Swal.fire({
                icon: 'success',
                title: 'Embarque actualizado',
                text: 'El embarque se ha actualizado correctamente',
                didOpen: configureSwalZIndex,
            }).then(() => {
                if (getData) {
                    getData();
                }
                setOpenDialog(false);
            });
        } catch (error) {
            console.error('Error al actualizar embarque:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el embarque',
                didOpen: configureSwalZIndex,
            });
        } finally {
            setLoading(false);
        }
    };

    const buildPartidas = () => {
        const partidas = [];
        const entregasSort = sortObjectsList([...entregas], 'envioId');
        const entregasGroupedList = makeSublistByProperty(entregasSort, 'envioId');
        entregasGroupedList.forEach((sublista) => {
            const master = makeMasterDetailObject(
                sublista,
                'envioId',
                'documento',
                'destinatario',
                'fechaDocumento',
                'sucursal',
                'tipoDocumento',
                'entidad',
                'entregaId'
            );
            partidas.push(master);
        });
        return partidas;
    };

    const handleSaveCell = (cell, value) => {
        const entregasTemp = [...entregas];
        if (cell.row.original.entregaDetId) {
            entregasTemp[cell.row.index]['saldo'] =
                Number(cell.row.original.saldo) +
                Number(cell.row.original.enviar) -
                Number(value);
        }
        entregasTemp[cell.row.index][cell.column.id] = value;
        setEntregas(entregasTemp);
    };

    const getDataEmbarque = async () => {
        if (!embarque || !embarque.id) return;

        const url = `${apiUrl.url}embarques/crear_asignacion/${embarque.id}`;
        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setEmbarqueData(res.data);
            setCp(res.data.cp);

            if (res.data?.partidas && res.data.partidas.length !== 0) {
                const partidasEmbarque = res.data.partidas;
                const entregasEmbarque = [];
                for (const partida of partidasEmbarque) {
                    if (partida.detalles && partida.detalles.length !== 0) {
                        const detalles = partida.detalles;
                        for (const detalle of detalles) {
                            entregasEmbarque.push({
                                entregaId: partida.id,
                                documento: partida.documento,
                                entidad: partida.entidad,
                                destinatario: partida.destinatario,
                                envioId: partida.envio,
                                fechaDocumento: partida.fecha_documento,
                                sucursal: partida.sucursal,
                                tipoDocumento: partida.tipo_documento,
                                entregaDetId: detalle.id,
                                clave: detalle.clave,
                                me_descripcion: detalle.descripcion,
                                id: detalle.envio_det,
                                enviar: detalle.cantidad,
                                valor: detalle.valor,
                                me_cantidad: detalle.cantidad_envio,
                                saldoEnvio: detalle.saldo,
                                enviado: detalle.enviado,
                                saldo: detalle.saldo,
                            });
                        }
                    }
                }
                setEntregas(entregasEmbarque);
            }
        } catch (error) {
            console.error('Error al obtener datos del embarque:', error);
        }
    };

    useEffect(() => {
        getDataEmbarque();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [embarque]);

    const columns = useMemo(
        () => [
            {
                header: 'Doc.',
                accessorKey: 'documento',
                enableEditing: () => false,
                size: 58,
                grow: false,
                muiTableBodyCellProps: { sx: cellEllipsisSx },
            },
            {
                header: 'Destinatario',
                accessorKey: 'destinatario',
                enableEditing: () => false,
                size: 110,
                grow: true,
                muiTableBodyCellProps: { sx: cellEllipsisSx },
            },
            {
                header: 'Clave',
                accessorKey: 'clave',
                enableEditing: () => false,
                size: 54,
                grow: false,
                muiTableBodyCellProps: { sx: cellEllipsisSx },
            },
            {
                header: 'Descripción',
                accessorKey: 'me_descripcion',
                enableEditing: () => false,
                size: 110,
                grow: true,
                muiTableBodyCellProps: { sx: cellEllipsisSx },
            },
            {
                header: 'Cant.',
                accessorKey: 'me_cantidad',
                enableEditing: () => false,
                size: 48,
                grow: false,
                muiTableHeadCellProps: { align: 'right' },
                muiTableBodyCellProps: { align: 'right', sx: cellEllipsisSx },
            },
            {
                header: 'Saldo',
                accessorKey: 'saldo',
                enableEditing: () => false,
                Cell: ({ row }) =>
                    row.original.entregaDetId
                        ? row.original.saldo
                        : row.original.saldo - row.original.enviar,
                size: 48,
                grow: false,
                muiTableHeadCellProps: { align: 'right' },
                muiTableBodyCellProps: { align: 'right', sx: cellEllipsisSx },
            },
            {
                header: 'Enviar',
                accessorKey: 'enviar',
                size: 48,
                grow: false,
                muiTableHeadCellProps: { align: 'right' },
                muiTableBodyCellProps: { align: 'right' },
            },
        ],
        []
    );

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
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <LocalShippingIcon color="primary" />
                    <Typography variant="h6" fontWeight="bold" noWrap>
                        Asignación embarque
                        {embarqueData?.documento ? ` — ${embarqueData.documento}` : ''}
                    </Typography>
                </Box>
                <IconButton size="small" onClick={handleSalir} aria-label="Cerrar">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', flexShrink: 0 }}>
                <Grid container spacing={1.5}>
                    <Grid item xs={6} sm={3}>
                        <InfoField label="Sucursal" value={nombreSucursal} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <InfoField label="Fecha" value={embarqueData?.fecha} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <InfoField label="Operador" value={embarqueData?.operador?.nombre} />
                    </Grid>
                    {embarqueData?.comentario && (
                        <Grid item xs={12}>
                            <InfoField label="Comentario" value={embarqueData.comentario} />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <MaterialReactTable
                    columns={columns}
                    data={entregas}
                    layoutMode="grid"
                    enableTopToolbar={false}
                    enableColumnOrdering={false}
                    enableGlobalFilter={false}
                    enableColumnResizing={false}
                    initialState={{
                        density: 'compact',
                    }}
                    defaultColumn={{
                        minSize: 40,
                        maxSize: 200,
                    }}
                    displayColumnDefOptions={{
                        'mrt-row-numbers': { size: 32, grow: false },
                        'mrt-row-actions': {
                            size: 52,
                            grow: false,
                            muiTableHeadCellProps: { sx: { px: 0.25 } },
                            muiTableBodyCellProps: { sx: { px: 0.25 } },
                        },
                    }}
                    enablePagination={false}
                    enableRowVirtualization
                    enableBottomToolbar={false}
                    editingMode="cell"
                    enableEditing
                    muiTableBodyCellEditTextFieldProps={({ cell }) => ({
                        onBlur: (event) => {
                            if (cell.column.id === 'enviar') {
                                handleSaveCell(cell, event.target.value);
                            }
                        },
                    })}
                    muiTablePaperProps={{ sx: { boxShadow: 'none', width: '100%' } }}
                    muiTableContainerProps={{
                        sx: { flex: 1, maxHeight: '100%', overflowX: 'hidden' },
                    }}
                    muiTableProps={{ sx: { tableLayout: 'fixed', width: '100%' } }}
                    enableColumnActions={false}
                    enableColumnFilters={false}
                    enableSorting={false}
                    enableColumnDragging={false}
                    enableRowNumbers
                    rowNumberMode="original"
                    localization={MRT_Localization_ES}
                    enableRowActions
                    positionActionsColumn="last"
                    renderRowActions={({ row }) => (
                        <Tooltip title="Eliminar partida">
                            <IconButton
                                size="medium"
                                color="error"
                                onClick={() => hadleBorrar(row.original)}
                                sx={deleteActionButtonSx}
                            >
                                <DeleteForeverIcon fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                    )}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                <Button variant="contained" size="small" onClick={handleSalvar} disabled={entregas.length === 0}>
                    Guardar
                </Button>
            </Box>
        </Paper>
    );
};

export default EmbarqueLocalizacionForm;

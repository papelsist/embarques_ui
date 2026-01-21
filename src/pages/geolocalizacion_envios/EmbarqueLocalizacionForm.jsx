import React, { useState, useMemo, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Divider, TextField, Grid, Typography, Button, Fab, Dialog, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import BuscadorEnvio from '../embarques/asignaciones/components/BuscadorEnvio';
import { sortObjectsList, makeSublistByProperty, makeMasterDetailObject } from '../../utils/embarqueUtils';
import { apiUrl } from '../../conf/axios_instance';
import Swal from 'sweetalert2';
import { ContextEmbarques } from '../../context/ContextEmbarques';

const EmbarqueLocalizacionForm = ({ embarque, setOpenDialog, getData, isFullscreen = false , handleRefresh }) => {
    const { auth, setLoading } = useContext(ContextEmbarques);
    const [embarqueData, setEmbarqueData] = useState(embarque);
    const [openDialogBuscador, setOpenDialogBuscador] = useState(false);
    const [entregas, setEntregas] = useState([]);
    const [cp, setCp] = useState(false);

    // Función para configurar z-index de SweetAlert2 cuando se abre
    const configureSwalZIndex = () => {
        // Aplicar siempre, no solo en fullscreen, porque el Dialog padre también tiene z-index alto
        const applyZIndex = () => {
            const swalContainer = document.querySelector('.swal2-container');
            if (swalContainer) {
                swalContainer.style.zIndex = '14000';
            }
            const swalPopup = document.querySelector('.swal2-popup');
            if (swalPopup) {
                swalPopup.style.zIndex = '14001';
            }
            const swalBackdrop = document.querySelector('.swal2-backdrop-show') || 
                               document.querySelector('.swal2-backdrop');
            if (swalBackdrop) {
                swalBackdrop.style.zIndex = '13999';
            }
        };
        
        // Aplicar inmediatamente
        applyZIndex();
        
        // Aplicar después de delays para asegurar que el DOM esté listo
        setTimeout(applyZIndex, 10);
        setTimeout(applyZIndex, 50);
        setTimeout(applyZIndex, 100);
        setTimeout(applyZIndex, 200);
        setTimeout(applyZIndex, 500);
    };

    const hadleBorrar = (row) => {
        Swal.fire({
            title: `¿Está seguro de borrar Clave:${row.clave} Cant:${row.enviar}?`,
            text: "Esta acción no se puede revertir!",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex
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
                        didOpen: configureSwalZIndex
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se pudo eliminar!',
                        text: 'Hubo un error!',
                        didOpen: configureSwalZIndex
                    });
                }
            }
        });
    };

    const borrarPatida = async (row) => {
        const url = `${apiUrl.url}embarques/eliminar_entrega_det`;
        const res = await axios.post(url, row, {
            headers: { Authorization: `Bearer ${auth.access}` }
        });
        return res.data.deleted;
    };

    const handleSalir = () => {
        setOpenDialog(false);
        handleRefresh();
    };

    const handleSalvar = async (e) => {
        setLoading(true);
        try {
            const url = `${apiUrl.url}embarques/actualizar_embarque`;
            const partidas = buildPartidas();
            const data = {
                embarqueId: embarqueData.id,
                cp: cp,
                comentario: embarqueData.comentario,
                operador: embarqueData.operador.id,
                partidas: partidas
            };
            await axios.post(url, data, {
                headers: { Authorization: `Bearer ${auth.access}` }
            });
            Swal.fire({
                icon: 'success',
                title: 'Embarque actualizado',
                text: 'El embarque se ha actualizado correctamente',
                didOpen: configureSwalZIndex
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
                didOpen: configureSwalZIndex
            });
        } finally {
            setLoading(false);
        }
    };

    const buildPartidas = () => {
        let partidas = [];
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

    const agregarEntregas = (nuevas) => {
        setEntregas([...entregas, ...nuevas]);
    };

    const handleSaveCell = (cell, value) => {
        let entregasTemp = entregas;
        if (cell.row.original.entregaDetId) {
            entregasTemp[cell.row.index]['saldo'] =
                Number(cell.row.original.saldo) +
                Number(cell.row.original.enviar) -
                Number(value);
        }
        entregasTemp[cell.row.index][cell.column.id] = value;
        setEntregas([...entregasTemp]);
    };

    const getDataEmbarque = async () => {
        if (!embarque || !embarque.id) return;
        
        const url = `${apiUrl.url}embarques/crear_asignacion/${embarque.id}`;
        try {
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${auth.access}` }
            });
            setEmbarqueData(res.data);
            setCp(res.data.cp);
            
            if (res.data?.partidas && res.data.partidas.length !== 0) {
                const partidasEmbarque = res.data.partidas;
                let entregasEmbarque = [];
                for (let partida of partidasEmbarque) {
                    if (partida.detalles && partida.detalles.length !== 0) {
                        const detalles = partida.detalles;
                        for (let detalle of detalles) {
                            let entregaEmbarque = {};
                            entregaEmbarque.entregaId = partida.id;
                            entregaEmbarque.documento = partida.documento;
                            entregaEmbarque.entidad = partida.entidad;
                            entregaEmbarque.destinatario = partida.destinatario;
                            entregaEmbarque.envioId = partida.envio;
                            entregaEmbarque.fechaDocumento = partida.fecha_documento;
                            entregaEmbarque.sucursal = partida.sucursal;
                            entregaEmbarque.tipoDocumento = partida.tipo_documento;
                            entregaEmbarque.entregaDetId = detalle.id;
                            entregaEmbarque.clave = detalle.clave;
                            entregaEmbarque.me_descripcion = detalle.descripcion;
                            entregaEmbarque.id = detalle.envio_det;
                            entregaEmbarque.enviar = detalle.cantidad;
                            entregaEmbarque.valor = detalle.valor;
                            entregaEmbarque.me_cantidad = detalle.cantidad_envio;
                            entregaEmbarque.saldoEnvio = detalle.saldo;
                            entregaEmbarque.enviado = detalle.enviado;
                            entregaEmbarque.saldo = detalle.saldo;
                            entregasEmbarque.push(entregaEmbarque);
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
    }, [embarque]);

    // Definición de columnas para partidas
    const columns = useMemo(
        () => [
            {
                header: 'Documento',
                accessorKey: 'documento',
                enableEditing: (row) => false,
                size: 70,
                muiTableBodyCellProps: {
                    align: 'center'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Destinatario',
                accessorKey: 'destinatario',
                enableEditing: (row) => false,
                size: 250,
                muiTableBodyCellProps: {
                    align: 'left'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Clave',
                accessorKey: 'clave',
                enableEditing: (row) => false,
                size: 100,
                muiTableBodyCellProps: {
                    align: 'left'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Descripcion',
                accessorKey: 'me_descripcion',
                enableEditing: (row) => false,
                size: 180,
                muiTableBodyCellProps: {
                    align: 'left'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Cantidad',
                accessorKey: 'me_cantidad',
                enableEditing: (row) => false,
                size: 80,
                muiTableBodyCellProps: {
                    align: 'right'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Saldo',
                accessorKey: 'saldo',
                enableEditing: (row) => false,
                Cell: ({ row }) =>
                    row.original.entregaDetId
                        ? row.original.saldo
                        : row.original.saldo - row.original.enviar,
                size: 80,
                muiTableBodyCellProps: {
                    align: 'right'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            },
            {
                header: 'Enviar',
                accessorKey: 'enviar',
                size: 80,
                muiTableBodyCellProps: {
                    align: 'right'
                },
                muiTableHeadCellProps: {
                    align: 'center'
                }
            }
        ],
        []
    );

    return (
        <div style={{ padding: '1rem', width: '100%', minHeight: '500px' }}>
            <Paper
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}
                elevation={0}
            >
                <Box component={'div'}>
                    <Typography fontSize={20}>Asignación Embarque</Typography>
                    <Divider />
                    <Grid
                        container
                        columnSpacing={2}
                        sx={{
                            display: 'flex',
                            '& .MuiTextField-root': { ml: 1 }
                        }}
                    >
                        <Grid item xs={2}>
                            <TextField
                                variant="standard"
                                name="documento"
                                value={embarqueData ? embarqueData.documento : ''}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                variant="standard"
                                name="sucursal"
                                value={embarqueData ? embarqueData.sucursal : ''}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                variant="standard"
                                value={embarqueData ? embarqueData.fecha : ''}
                                name="fecha"
                                disabled
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        container
                        columnSpacing={2}
                        sx={{
                            marginBottom: 1,
                            display: 'flex',
                            '& .MuiTextField-root': { mr: 1 }
                        }}
                    >
                        <Grid item xs={5}>
                            <TextField
                                name="operador"
                                variant="standard"
                                value={embarqueData ? embarqueData.operador?.nombre : ''}
                                disabled
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={7}>
                            <TextField
                                variant="standard"
                                name="comentario"
                                value={
                                    embarqueData && embarqueData.comentario
                                        ? embarqueData.comentario
                                        : ''
                                }
                                disabled
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Divider />
                </Box>
                <Box component={'div'} sx={{ height: '100%' }}>
                    <MaterialReactTable
                        columns={columns}
                        data={entregas}
                        enableTopToolbar={false}
                        enableColumnOrdering
                        enableGlobalFilter={false}
                        initialState={{
                            columnVisibility: { subdimension: false },
                            columnPinning: { left: ['descripcion'] },
                            density: 'compact',
                            size: 'small'
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
                            }
                        })}
                        muiTableContainerProps={{ sx: { maxHeight: 600, minHeight: 500 } }}
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
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    gap: '0.5rem',
                                    color: 'red'
                                }}
                            >
                                <IconButton
                                    aria-label="delete"
                                    size="large"
                                    color="error"
                                    onClick={() => {
                                        hadleBorrar(row.original);
                                    }}
                                >
                                    <DeleteForeverIcon />
                                </IconButton>
                            </div>
                        )}
                    />
                </Box>
                <Box component={'div'} sx={{ height: '4rem' }}>
                    <Divider sx={{ mb: 2 }} />
                    <Button
                        sx={{ mr: 8, ml: 5 }}
                        onClick={handleSalvar}
                        disabled={!entregas.length > 0}
                    >
                        Salvar
                    </Button>
                    <Button onClick={handleSalir}>Salir</Button>
                </Box>
            </Paper>

            <Dialog
                open={openDialogBuscador}
                onClose={() => {
                    setOpenDialogBuscador(false);
                }}
                maxWidth={'md'}
                disablePortal={false}
                container={isFullscreen ? document.body : undefined}
                sx={{
                    zIndex: isFullscreen ? 13001 : 1301,
                    '& .MuiBackdrop-root': { zIndex: isFullscreen ? 13000 : 1301 },
                    '& .MuiDialog-container': { zIndex: isFullscreen ? 13001 : 1301 },
                    '& .MuiDialog-paper': { zIndex: isFullscreen ? 13001 : 1301 }
                }}
            >
                <BuscadorEnvio
                    setOpenDialog={setOpenDialogBuscador}
                    agregarEntregas={agregarEntregas}
                />
            </Dialog>
        </div>
    );
};

export default EmbarqueLocalizacionForm;

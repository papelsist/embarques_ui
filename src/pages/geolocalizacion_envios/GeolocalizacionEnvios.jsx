import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GeolocalizacionEnviosMap from './GeolocalizacionEnviosMap';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress, Dialog, IconButton, Tooltip } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PrintIcon from '@mui/icons-material/Print';
import RouteIcon from '@mui/icons-material/Route';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import Swal from 'sweetalert2';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import { objectIsEmpty } from '../../utils/embarqueUtils';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios';
import AsignacionParcialForm from '../embarques/envios_parciales/components/AsignacionParcialForm';
import PeriodoLabel from '../../components/periodo_date_picker/PeriodoLabel';
import RutaEmbarqueForm from '../embarques/asignaciones/components/ruta_embarque_form/RutaEmbarqueForm';
import EmbarqueLocalizacionForm from './EmbarqueLocalizacionForm';
import CreateEmbarqueForm from '../embarques/asignaciones/asignaciones_form/CreateEmbarqueForm';

const GeolocalizacionEnvios = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const {sucursal, setLoading, auth, periodo, loading} = useContext(ContextEmbarques);
    const [envios, setEnvios] = useState([]);
    const [envioSeleccionado, setEnvioSeleccionado] = useState(null);
    const [openDialogAsignacion, setOpenDialogAsignacion] = useState(false);
    const [envioParaAsignar, setEnvioParaAsignar] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [embarques, setEmbarques] = useState([]);
    const [loadingEmbarques, setLoadingEmbarques] = useState(false);
    const [showRuta, setShowRuta] = useState(false);
    const [ruta, setRuta] = useState([]);
    const [openDialogEmbarque, setOpenDialogEmbarque] = useState(false);
    const [embarqueSeleccionado, setEmbarqueSeleccionado] = useState(null);
    const [openDialogCreateEmbarque, setOpenDialogCreateEmbarque] = useState(false);

    const getData = async () => {
        setLoading(true)
        if(objectIsEmpty(auth)){
           try{
                const url = `${apiUrl.url}embarques/envios_pendientes` 
                   
                const resp = await axios.get(url, 
                    {params:{fecha_inicial:periodo.fecha_inicial, fecha_final: periodo.fecha_final,sucursal: sucursal.nombre },
                     headers: { Authorization: `Bearer ${auth.access}` }
                    })
                setEnvios(resp.data)
                console.log(resp.data)
                setLoading(false)
               
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                    setLoading(false)
            }
            console.log(error);
        }
            setLoading(false)
        }else{
            console.log('No esta autenticado')
            navigate(`../../login`)
            setLoading(false)
            
        } 

    }

    const getEmbarquesPendientes = async () => {
        if(objectIsEmpty(auth)){
            setLoadingEmbarques(true);
            try{
                const url = `${apiUrl.url}embarques/pendientes_salida`
                const resp = await axios.get(url,{
                    params: {sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                })
                setEmbarques(resp.data || [])
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                }
                console.error('Error al obtener embarques:', error);
            }finally{
                setLoadingEmbarques(false);
            }
        }
    }

    useEffect(() => {
        getData()
        getEmbarquesPendientes()
    }, [periodo])

    const handleRefresh = () => {
        getData();
        getEmbarquesPendientes();
    }

    const handleAbrirDialogAsignacion = (envio) => {
        setEnvioParaAsignar(envio);
        setOpenDialogAsignacion(true);
    }

    const handleCerrarDialogAsignacion = () => {
        setOpenDialogAsignacion(false);
        setEnvioParaAsignar(null);
    }

    const handleToggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    }

    // Función para configurar z-index de SweetAlert2 cuando se abre
    const configureSwalZIndex = () => {
        if (isFullscreen) {
            const applyZIndex = () => {
                const swalContainer = document.querySelector('.swal2-container');
                if (swalContainer) {
                    swalContainer.style.zIndex = '13000';
                }
                const swalPopup = document.querySelector('.swal2-popup');
                if (swalPopup) {
                    swalPopup.style.zIndex = '13001';
                }
                const swalBackdrop = document.querySelector('.swal2-backdrop-show') || 
                                   document.querySelector('.swal2-backdrop');
                if (swalBackdrop) {
                    swalBackdrop.style.zIndex = '12999';
                }
            };
            
            applyZIndex();
            setTimeout(applyZIndex, 10);
            setTimeout(applyZIndex, 50);
            setTimeout(applyZIndex, 100);
        }
    };

    const registrarSalida = async (embarque) => {
        let enCero = 0;
        if (embarque.partidas) {
            for (let partida of embarque.partidas) {
                if (partida.detalles) {
                    for (let detalle of partida.detalles) {
                        const cantidad = Number(detalle.cantidad);
                        if (cantidad === 0) {
                            enCero += 1;
                        }
                    }
                }
            }
        }

        if (enCero > 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hay partidas con cantidad en cero!',
                didOpen: configureSwalZIndex
            });
            return;
        }

        const url = `${apiUrl.url}embarques/registrar_salida`;
        Swal.fire({
            title: `Salida de Embarque: ${embarque.documento} de ${embarque.operador?.nombre || 'N/A'}`,
            text: "Registrar salida",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.post(url, embarque, {
                        headers: { Authorization: `Bearer ${auth.access}` }
                    });
                    getEmbarquesPendientes();
                    Swal.fire({
                        icon: 'success',
                        title: 'Salida registrada',
                        text: 'La salida se ha registrado correctamente',
                        didOpen: configureSwalZIndex
                    });
                } catch (error) {
                    console.error('Error al registrar salida:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo registrar la salida',
                        didOpen: configureSwalZIndex
                    });
                }
            }
        });
    }

    const imprimirAsignacion = async (embarque) => {
        const url = `${apiUrl.url}embarques/reporte_asignacion`;
        const data = { embarqueId: embarque.id };
        try {
            const response = await axios.get(url, {
                params: data,
                headers: { Authorization: `Bearer ${auth.access}` },
                responseType: 'blob'
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (error) {
            console.error('Error al imprimir:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte',
            });
        }
    }

    const verRuta = async (embarque) => {
        const url = `${apiUrl.url}embarques/ruta_embarque/${embarque.id}`;
        try {
            const res = await axios.get(url, {
                params: { embarqueId: embarque.id },
                headers: { Authorization: `Bearer ${auth.access}` }
            });

            const ruta_list = [];
            if (res.data.partidas) {
                for (let entrega of res.data.partidas) {
                    if (entrega.envio) {
                        ruta_list.push(entrega.envio);
                    }
                }
            }
            setRuta(ruta_list);
            setShowRuta(true);
        } catch (error) {
            console.error('Error al obtener ruta:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo obtener la ruta',
            });
        }
    }

    const borrarEmbarque = async (embarque) => {
        Swal.fire({
            title: `¿Está seguro de borrar Embarque: ${embarque.documento} Op: ${embarque.operador.nombre}?`,
            text: "Esta acción no se puede revertir!",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const url = `${apiUrl.url}embarques/borrar_embarque`;
                    const resp = await axios.post(url, embarque, {
                        headers: { Authorization: `Bearer ${auth.access}` }
                    });
                    
                    if (resp.data.deleted >= 0) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado!',
                            text: 'El embarque ha sido borrado!',
                            didOpen: configureSwalZIndex
                        }).then(() => {
                            handleRefresh();
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'No se pudo eliminar!',
                            text: 'Hubo un error!',
                            didOpen: configureSwalZIndex
                        });
                    }
                } catch (error) {
                    console.error('Error al borrar embarque:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo borrar el embarque',
                        didOpen: configureSwalZIndex
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    }

    return (
    <Box 
        ref={containerRef}
        sx={{ 
            width: '100%', 
            height: isFullscreen ? 'calc(100vh - 64px)' : '90vh', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: isFullscreen ? 'background.default' : 'transparent',
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? '64px' : 'auto',
            left: isFullscreen ? 0 : 'auto',
            right: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 1200 : 'auto',
            overflow: isFullscreen ? 'hidden' : 'visible'
        }}
    >
        <Paper sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
            <Typography variant="h4" component="h1">
                Asignación por ubicación
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeriodoLabel isFullscreen={isFullscreen} />
                <Tooltip title="Refrescar">
                    <span>
                        <IconButton onClick={handleRefresh} disabled={loading || loadingEmbarques}>
                            <RefreshIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                    <IconButton onClick={handleToggleFullscreen}>
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
        <Box sx={{ width: '100%', height: isFullscreen ? 'calc(100vh - 128px)' : '85vh', display: 'flex', flexDirection: 'row' }}>
                <Box sx={{ width: isFullscreen ? '15vw' : '15vw', height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" component="h2">
                                Envíos ({envios.length})
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : envios.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay envíos disponibles
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {envios.map((envio, index) => {
                                        const isSelected = envioSeleccionado?.id === envio.id;
                                        const tieneCoordenadas = envio.instruccion?.direccion_latitud && envio.instruccion?.direccion_longitud;
                                        const direccion = envio.instruccion?.direccion_calle || 'Sin dirección';
                                        
                                        return (
                                            <React.Fragment key={envio.id || index}>
                                                <ListItem 
                                                    button
                                                    onClick={() => {
                                                        if (tieneCoordenadas) {
                                                            setEnvioSeleccionado(envio);
                                                        }
                                                    }}
                                                    sx={{ 
                                                        flexDirection: 'row',
                                                        alignItems: 'flex-start',
                                                        py: 1.5,
                                                        px: 2,
                                                        backgroundColor: isSelected ? 'action.selected' : 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover',
                                                            cursor: tieneCoordenadas ? 'pointer' : 'default'
                                                        },
                                                        opacity: tieneCoordenadas ? 1 : 0.6
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="subtitle2" fontWeight="bold">
                                                                    {envio.documento || 'Sin documento'}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        {envio.destinatario || 'Sin destinatario'}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                        {direccion}
                                                                    </Typography>
                                                                </>
                                                            }
                                                        />
                                                    </Box>
                                                    <Tooltip title="Asignar envío">
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAbrirDialogAsignacion(envio);
                                                            }}
                                                            sx={{ 
                                                                ml: 1,
                                                                color: 'primary.main',
                                                                '&:hover': {
                                                                    backgroundColor: 'action.hover'
                                                                }
                                                            }}
                                                        >
                                                            <LocalShippingIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItem>
                                                {index < envios.length - 1 && <Divider />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ width: isFullscreen ? '70vw' : '52vw', height: '100%', display: 'flex', flexDirection: 'column', p:1 }}>
                    <GeolocalizacionEnviosMap 
                        sucursal={sucursal} 
                        envios={envios} 
                        envioSeleccionado={envioSeleccionado}
                        onCentrarSucursal={() => setEnvioSeleccionado(null)}
                        onAsignarEnvio={handleAbrirDialogAsignacion}
                        isFullscreen={isFullscreen}
                    />
                </Box>
                <Box sx={{ width: isFullscreen ? '15vw' : '15vw', height: '100%', display: 'flex', flexDirection: 'column', p: 1 }}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" component="h2">
                                Embarques ({embarques.length})
                            </Typography>
                            <Tooltip title="Crear nuevo embarque">
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => setOpenDialogCreateEmbarque(true)}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: 'action.hover'
                                        }
                                    }}
                                >
                                    <AddIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                            {loadingEmbarques ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : embarques.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay embarques disponibles
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {embarques.map((embarque, index) => (
                                        <React.Fragment key={embarque.id || index}>
                                            <ListItem 
                                                onClick={() => {
                                                    setEmbarqueSeleccionado(embarque);
                                                    setOpenDialogEmbarque(true);
                                                }}
                                                sx={{ 
                                                    flexDirection: 'row',
                                                    alignItems: 'flex-start',
                                                    py: 1.5,
                                                    px: 2,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {embarque.documento || 'Sin documento'}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Operador: {embarque.operador?.nombre || 'N/A'}
                                                                </Typography>
                                                                {embarque.operador?.telefono && (
                                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                        Tel: {embarque.operador.telefono}
                                                                    </Typography>
                                                                )}
                                                            </>
                                                        }
                                                    />
                                                </Box>
                                                <Box 
                                                    sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {embarque.partidas && embarque.partidas.length > 0 ? (
                                                        <>
                                                            <Tooltip title="Dar salida">
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => registrarSalida(embarque)}
                                                                    sx={{ 
                                                                        '&:hover': {
                                                                            backgroundColor: 'action.hover'
                                                                        }
                                                                    }}
                                                                >
                                                                    <FlightTakeoffIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Imprimir">
                                                                <IconButton
                                                                    size="small"
                                                                    color="secondary"
                                                                    onClick={() => imprimirAsignacion(embarque)}
                                                                    sx={{ 
                                                                        '&:hover': {
                                                                            backgroundColor: 'action.hover'
                                                                        }
                                                                    }}
                                                                >
                                                                    <PrintIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Ver ruta">
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    onClick={() => verRuta(embarque)}
                                                                    sx={{ 
                                                                        '&:hover': {
                                                                            backgroundColor: 'action.hover'
                                                                        }
                                                                    }}
                                                                >
                                                                    <RouteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <Tooltip title="Eliminar embarque">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => borrarEmbarque(embarque)}
                                                                sx={{ 
                                                                    '&:hover': {
                                                                        backgroundColor: 'action.hover'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteForeverIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </ListItem>
                                            {index < embarques.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Box>
        </Box>
        <Dialog 
            open={openDialogAsignacion} 
            onClose={handleCerrarDialogAsignacion}
            fullWidth={true}
            maxWidth={'md'}
            maxHeight={'md'}
            sx={{
                display:'flex', 
                flexDirection:'column', 
                justifyContent:'center', 
                alignItems:'center', 
                height:'100vh',
                zIndex: isFullscreen ? 13000 : 1300
            }}
        >
            {envioParaAsignar && (
                <AsignacionParcialForm 
                    rowSelected={{[envioParaAsignar.id]: true}} 
                    onCloseDialog={handleCerrarDialogAsignacion} 
                    getData={handleRefresh}
                    isFullscreen={isFullscreen}
                />
            )}
        </Dialog>
        <Dialog 
            open={showRuta} 
            onClose={() => {setShowRuta(false)}}
            fullWidth={true}
            maxWidth={'xl'}
            PaperProps={{
                sx: {
                    width: "90%",
                    maxWidth: "1300px",
                    height: "60vh",
                    maxHeight: "900px",
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                },
            }}
            sx={{
                zIndex: isFullscreen ? 13000 : 1300,
                '& .MuiBackdrop-root': { zIndex: isFullscreen ? 12999 : 1300 },
                '& .MuiDialog-paper': { 
                    zIndex: isFullscreen ? 13000 : 1300,
                    margin: '32px'
                }
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <RutaEmbarqueForm ruta={ruta} setShowRuta={setShowRuta} />
            </Box>
        </Dialog>
        <Dialog 
            open={openDialogEmbarque} 
            onClose={() => {
                setOpenDialogEmbarque(false);
                setEmbarqueSeleccionado(null);
                handleRefresh();
            }}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            fullWidth={true}
            maxWidth={'lg'}
            PaperProps={{
                sx: {
                    width: "100%",
                    maxWidth: "90rem",
                    height: "90%",
                    maxHeight: "80rem"
                }
            }}
            sx={{
                zIndex: isFullscreen ? 13000 : 1300,
                '& .MuiBackdrop-root': { zIndex: isFullscreen ? 12999 : 1300 },
                '& .MuiDialog-container': { zIndex: isFullscreen ? 13000 : 1300 },
                '& .MuiDialog-paper': { zIndex: isFullscreen ? 13000 : 1300 }
            }}
        >
            {embarqueSeleccionado && (
                <EmbarqueLocalizacionForm 
                    embarque={embarqueSeleccionado}
                    setOpenDialog={setOpenDialogEmbarque} 
                    getData={handleRefresh}
                    isFullscreen={isFullscreen}
                    handleRefresh={handleRefresh}
                />
            )}
        </Dialog>
        <Dialog 
            open={openDialogCreateEmbarque} 
            onClose={() => {setOpenDialogCreateEmbarque(false)}}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={'md'}
            sx={{
                zIndex: isFullscreen ? 13000 : 1300,
                '& .MuiBackdrop-root': { zIndex: isFullscreen ? 12999 : 1300 },
                '& .MuiDialog-container': { zIndex: isFullscreen ? 13000 : 1300 },
                '& .MuiDialog-paper': { zIndex: isFullscreen ? 13000 : 1300 }
            }}
        >
            <CreateEmbarqueForm 
                setOpenDialog={setOpenDialogCreateEmbarque} 
                getData={handleRefresh}
            />
        </Dialog>
    </Box>
    );
}

export default GeolocalizacionEnvios;

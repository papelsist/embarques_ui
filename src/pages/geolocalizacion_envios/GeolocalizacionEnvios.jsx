import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GeolocalizacionEnviosMap from './GeolocalizacionEnviosMap';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress, Dialog, IconButton, Tooltip, TextField, Checkbox, InputAdornment, Grid } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PrintIcon from '@mui/icons-material/Print';
import RouteIcon from '@mui/icons-material/Route';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlightLandIcon from '@mui/icons-material/FlightLand';
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
import PeriodoLabelMUI from '../../components/periodo_label/PeriodoLabelMUI';
import EnvioDetalleLateral from './EnvioDetalleLateral';
import EmbarqueTransitoDetalleLateral from './EmbarqueTransitoDetalleLateral';
import TransportesEnviosPendientes from '../embarques/envios_pendientes/components/TransportesEnviosPendientes';

const PANEL_EMBARQUES = 0;
const PANEL_TRANSITO = 1;
const PANEL_REGRESOS = 2;
const PANEL_GAP = 1;

const panelPaperSx = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 2,
    border: '4px solid #fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    flexShrink: 0,
};

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
    const [embarquesTransito, setEmbarquesTransito] = useState([]);
    const [loadingTransito, setLoadingTransito] = useState(false);
    const [embarquesRegresos, setEmbarquesRegresos] = useState([]);
    const [loadingRegresos, setLoadingRegresos] = useState(false);
    const [panelDerecho, setPanelDerecho] = useState(PANEL_EMBARQUES);
    const [showRuta, setShowRuta] = useState(false);
    const [ruta, setRuta] = useState([]);
    const [openDialogEmbarque, setOpenDialogEmbarque] = useState(false);
    const [embarqueSeleccionado, setEmbarqueSeleccionado] = useState(null);
    const [openDialogCreateEmbarque, setOpenDialogCreateEmbarque] = useState(false);
    const [filtroEnvios, setFiltroEnvios] = useState('');
    const [enviosSeleccionados, setEnviosSeleccionados] = useState({});
    const [openDetalleEnvio, setOpenDetalleEnvio] = useState(false);
    const [envioDetalle, setEnvioDetalle] = useState(null);
    const [loadingEnvioDetalle, setLoadingEnvioDetalle] = useState(false);
    const [openDialogAsignacionTotal, setOpenDialogAsignacionTotal] = useState(false);
    const [openDetalleTransito, setOpenDetalleTransito] = useState(false);
    const [embarqueDetalleTransito, setEmbarqueDetalleTransito] = useState(null);

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
                setEnviosSeleccionados((prev) => {
                    const idsActuales = new Set((resp.data || []).map((e) => e.id));
                    return Object.fromEntries(
                        Object.entries(prev).filter(([id]) => idsActuales.has(Number(id)) || idsActuales.has(id))
                    );
                });
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

    const getEmbarquesTransito = async () => {
        if (!objectIsEmpty(auth)) return;
        setLoadingTransito(true);
        try {
            const url = `${apiUrl.url}embarques/transito`;
            const resp = await axios.get(url, {
                params: { sucursal: sucursal.id },
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setEmbarquesTransito(resp.data || []);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('../../login');
            }
            console.error('Error al obtener tránsito:', error);
        } finally {
            setLoadingTransito(false);
        }
    };

    const getEmbarquesRegresos = async () => {
        if (!objectIsEmpty(auth)) return;
        setLoadingRegresos(true);
        try {
            const url = `${apiUrl.url}embarques/regresos`;
            const resp = await axios.get(url, {
                params: {
                    fecha_inicial: periodo.fecha_inicial,
                    fecha_final: periodo.fecha_final,
                    sucursal: sucursal.id,
                },
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setEmbarquesRegresos(resp.data || []);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('../../login');
            }
            console.error('Error al obtener regresos:', error);
        } finally {
            setLoadingRegresos(false);
        }
    };

    useEffect(() => {
        getData()
        getEmbarquesPendientes()
        getEmbarquesTransito()
        getEmbarquesRegresos()
    }, [periodo])

    const enviosFiltrados = useMemo(() => {
        const q = filtroEnvios.trim().toLowerCase();
        if (!q) return envios;
        return envios.filter((envio) => {
            const destinatario = (envio.destinatario || '').toLowerCase();
            const deDestinatario = (envio.de_destinatario || '').toLowerCase();
            const contacto = (envio.instruccion?.contacto || '').toLowerCase();
            return destinatario.includes(q) || deDestinatario.includes(q) || contacto.includes(q);
        });
    }, [envios, filtroEnvios]);

    const cantidadSeleccionados = Object.keys(enviosSeleccionados).length;
    const todosFiltradosSeleccionados = enviosFiltrados.length > 0 &&
        enviosFiltrados.every((envio) => enviosSeleccionados[envio.id]);
    const algunosFiltradosSeleccionados = enviosFiltrados.some((envio) => enviosSeleccionados[envio.id]);

    const handleToggleEnvioSeleccionado = (envioId) => {
        setEnviosSeleccionados((prev) => {
            const next = { ...prev };
            if (next[envioId]) {
                delete next[envioId];
            } else {
                next[envioId] = true;
            }
            return next;
        });
    };

    const handleToggleTodosFiltrados = () => {
        setEnviosSeleccionados((prev) => {
            const next = { ...prev };
            if (todosFiltradosSeleccionados) {
                enviosFiltrados.forEach((envio) => {
                    delete next[envio.id];
                });
            } else {
                enviosFiltrados.forEach((envio) => {
                    next[envio.id] = true;
                });
            }
            return next;
        });
    };

    const handleRefresh = () => {
        getData();
        getEmbarquesPendientes();
        getEmbarquesTransito();
        getEmbarquesRegresos();
    }

    const irPanelDerecho = (siguiente) => {
        setPanelDerecho(siguiente);
    };

    const validarRegresoEmbarque = (embarque) => {
        const partidas = embarque?.partidas || [];
        const recepcionesPendientes = partidas.filter((p) => !p.recepcion);
        if (recepcionesPendientes.length > 0) {
            return { ok: false, mensaje: 'Faltan recepciones' };
        }
        const documentosPendientes = partidas.filter((p) => !p.recepcion_documentos);
        if (documentosPendientes.length > 0) {
            return { ok: false, mensaje: 'Faltan recepción de documentos' };
        }
        const pagosPendientes = partidas.filter(
            (p) => p.tipo_documento === 'COD' && !p.recepcion_pago
        );
        if (pagosPendientes.length > 0) {
            return { ok: false, mensaje: 'Faltan recepción de pagos' };
        }
        return { ok: true, mensaje: '' };
    };

    const registrarRegreso = (embarque) => {
        const validacion = validarRegresoEmbarque(embarque);
        if (!validacion.ok) {
            Swal.fire({
                icon: 'error',
                title: 'No se puede marcar regreso',
                text: validacion.mensaje,
                didOpen: configureSwalZIndex,
            });
            return;
        }

        Swal.fire({
            title: `Regreso de Embarque: ${embarque.documento} de ${embarque.operador?.nombre || 'N/A'}`,
            text: 'Registrar regreso',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            try {
                setLoading(true);
                const url = `${apiUrl.url}embarques/registrar_regreso`;
                const res = await axios.post(url, embarque, {
                    headers: { Authorization: `Bearer ${auth.access}` },
                });
                if (res.data.actualizado) {
                    getEmbarquesTransito();
                    getEmbarquesRegresos();
                    Swal.fire({
                        icon: 'success',
                        title: 'Regreso registrado',
                        text: res.data.mensaje || 'El embarque se marcó como regreso',
                        didOpen: configureSwalZIndex,
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Faltan envíos por recibir',
                        text: res.data.mensaje || 'No se puede marcar regreso',
                        didOpen: configureSwalZIndex,
                    });
                }
            } catch (error) {
                console.error('Error al registrar regreso:', error);
                if (error.response?.status === 401) {
                    navigate('../../login');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo registrar el regreso',
                        didOpen: configureSwalZIndex,
                    });
                }
            } finally {
                setLoading(false);
            }
        });
    };

    const handleAbrirDetalleTransito = (embarque) => {
        setEmbarqueDetalleTransito(embarque);
        setOpenDetalleTransito(true);
    };

    const handleCerrarDetalleTransito = () => {
        setOpenDetalleTransito(false);
        setEmbarqueDetalleTransito(null);
    };

    const handleEntregaEliminadaTransito = (entregaId) => {
        setEmbarqueDetalleTransito((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                partidas: (prev.partidas || []).filter((p) => p.id !== entregaId),
            };
        });
        setEmbarquesTransito((prev) =>
            prev.map((emb) => {
                if (emb.id !== embarqueDetalleTransito?.id) return emb;
                return {
                    ...emb,
                    partidas: (emb.partidas || []).filter((p) => p.id !== entregaId),
                };
            })
        );
        getEmbarquesTransito();
        getData();
    };

    const handleEntregaActualizadaTransito = (partidaActualizada) => {
        setEmbarqueDetalleTransito((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                partidas: (prev.partidas || []).map((p) =>
                    p.id === partidaActualizada.id ? { ...p, ...partidaActualizada } : p
                ),
            };
        });
        setEmbarquesTransito((prev) =>
            prev.map((emb) => {
                if (emb.id !== embarqueDetalleTransito?.id) return emb;
                return {
                    ...emb,
                    partidas: (emb.partidas || []).map((p) =>
                        p.id === partidaActualizada.id ? { ...p, ...partidaActualizada } : p
                    ),
                };
            })
        );
    };

    const handleAbrirDialogAsignacion = (envio) => {
        setEnvioParaAsignar(envio);
        setOpenDialogAsignacion(true);
    }

    const handleAbrirDetalleEnvio = async (envio) => {
        setOpenDetalleEnvio(true);
        setEnvioDetalle(envio);
        setLoadingEnvioDetalle(true);
        if (objectIsEmpty(auth)) {
            try {
                const url = `${apiUrl.url}embarques/envios_parciales/${envio.id}/`;
                const resp = await axios.get(url, {
                    headers: { Authorization: `Bearer ${auth.access}` },
                });
                setEnvioDetalle(resp.data || envio);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('../../login');
                }
                console.error('Error al obtener detalle del envío:', error);
                setEnvioDetalle(envio);
            } finally {
                setLoadingEnvioDetalle(false);
            }
        } else {
            navigate('../../login');
            setLoadingEnvioDetalle(false);
        }
    };

    const handleCerrarDetalleEnvio = () => {
        setOpenDetalleEnvio(false);
        setEnvioDetalle(null);
        setLoadingEnvioDetalle(false);
    };

    const handleCerrarDialogAsignacion = () => {
        setOpenDialogAsignacion(false);
        setEnvioParaAsignar(null);
    }

    const handleAbrirAsignacionTotal = () => {
        if (Object.keys(enviosSeleccionados).length === 0) {
            return;
        }
        setOpenDialogAsignacionTotal(true);
    };

    const handleAsignacionTotal = (transporte) => {
        setOpenDialogAsignacionTotal(false);
        const enviosIds = Object.keys(enviosSeleccionados);
        Swal.fire({
            title: 'Asignación total',
            text: `¿Asignar ${enviosIds.length} envío(s) al embarque ${transporte.documento} - ${transporte.operador?.nombre || ''}?`,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const url = `${apiUrl.url}embarques/asignar_envios_pendientes`;
                    await axios.post(
                        url,
                        {
                            embarque_id: transporte.id,
                            envios: enviosIds,
                        },
                        { headers: { Authorization: `Bearer ${auth.access}` } }
                    );
                    setEnviosSeleccionados({});
                    handleRefresh();
                    Swal.fire({
                        icon: 'success',
                        title: 'Asignación realizada',
                        text: 'Los envíos se asignaron correctamente',
                        didOpen: configureSwalZIndex,
                    });
                } catch (error) {
                    console.error('Error en asignación total:', error);
                    if (error.response?.status === 401) {
                        navigate('../../login');
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo completar la asignación',
                            didOpen: configureSwalZIndex,
                        });
                    }
                } finally {
                    setLoading(false);
                }
            }
        });
    };

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

    const imprimirRegreso = async (embarque) => {
        try {
            const url = `${apiUrl.url}embarques/reporte_asignacion_embarque`;
            const response = await axios.get(url, {
                params: { embarqueId: embarque.id },
                headers: { Authorization: `Bearer ${auth.access}` },
                responseType: 'blob',
            });
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
        } catch (error) {
            console.error('Error al imprimir regreso:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar el reporte',
                didOpen: configureSwalZIndex,
            });
        }
    };

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
    <>
    <Box 
        ref={containerRef}
        sx={{ 
            width: '100%',
            maxWidth: '100%',
            height: isFullscreen ? 'calc(100vh - 64px)' : '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: '#E0E0E0',
            position: isFullscreen ? 'fixed' : 'relative',
            top: isFullscreen ? '64px' : 'auto',
            left: isFullscreen ? 0 : 'auto',
            right: isFullscreen ? 0 : 'auto',
            zIndex: isFullscreen ? 1200 : 'auto',
            overflow: 'hidden',
            // En modo normal el layout ya aporta padding; en fullscreen lo aplicamos aquí.
            p: isFullscreen ? PANEL_GAP : 0,
            gap: PANEL_GAP,
            boxSizing: 'border-box'
        }}
    >
        <Paper sx={{ 
            p: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            flexShrink: 0
        }}>
            <Grid container spacing={2}>
                <Grid item xs={4} md={4}>  
                    
                </Grid>
                <Grid item xs={4} md={4}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <PeriodoLabelMUI 
                        isFullscreen={isFullscreen} 
                        fontSize={isFullscreen ? '1.3rem' : '1.05rem'}
                        />
                    </Box>
                </Grid>
                <Grid item xs={2} md={2}>
                   
                </Grid>
                <Grid item xs={2} md={2}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        
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
                </Grid>
            </Grid>
          
            
        </Paper>
        <Box sx={{ width: '100%', flex: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'row', gap: PANEL_GAP, overflow: 'hidden' }}>
                <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper 
                        elevation={0} 
                        sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderRadius: 2,
                            border: '4px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                            <Typography variant="h6" component="h2">
                                Envíos ({filtroEnvios ? `${enviosFiltrados.length}/${envios.length}` : envios.length})
                            </Typography>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Cliente"
                                value={filtroEnvios}
                                onChange={(e) => setFiltroEnvios(e.target.value)}
                                sx={{ mt: 1.5 }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: filtroEnvios ? (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                aria-label="Limpiar filtro"
                                                onClick={() => setFiltroEnvios('')}
                                                edge="end"
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    ) : null,
                                }}
                            />
                            {envios.length > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, ml: -1, mr: -0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Checkbox
                                            size="small"
                                            checked={todosFiltradosSeleccionados}
                                            indeterminate={!todosFiltradosSeleccionados && algunosFiltradosSeleccionados}
                                            onChange={handleToggleTodosFiltrados}
                                            disabled={enviosFiltrados.length === 0}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            Seleccionar todos
                                        </Typography>
                                    </Box>
                                    <Tooltip title="Asignación total">
                                        <span>
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={handleAbrirAsignacionTotal}
                                                disabled={cantidadSeleccionados === 0}
                                            >
                                                <LocalShippingIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </Box>
                            )}
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
                            ) : enviosFiltrados.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay envíos que coincidan con el filtro
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {enviosFiltrados.map((envio, index) => {
                                        const isSelected = envioSeleccionado?.id === envio.id;
                                        const isChecked = Boolean(enviosSeleccionados[envio.id]);
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
                                                        px: 1,
                                                        backgroundColor: isSelected ? 'action.selected' : 'transparent',
                                                        '&:hover': {
                                                            backgroundColor: 'action.hover',
                                                            cursor: tieneCoordenadas ? 'pointer' : 'default'
                                                        },
                                                        opacity: tieneCoordenadas ? 1 : 0.6
                                                    }}
                                                >
                                                    <Checkbox
                                                        size="small"
                                                        checked={isChecked}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={() => handleToggleEnvioSeleccionado(envio.id)}
                                                        sx={{ mt: 0.25, p: 0.5 }}
                                                    />
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <ListItemText
                                                            primary={
                                                                <Box>
                                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                                        {envio.documento || 'Sin documento'}
                                                                    </Typography>
                                                                </Box>
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
                                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', ml: 0.5 }}>
                                                        <Tooltip title="Ver detalle">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAbrirDetalleEnvio(envio);
                                                                }}
                                                                sx={{
                                                                    color: 'info.main',
                                                                    '&:hover': {
                                                                        backgroundColor: 'action.hover'
                                                                    }
                                                                }}
                                                            >
                                                                <InfoOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Asignar envío">
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAbrirDialogAsignacion(envio);
                                                                }}
                                                                sx={{ 
                                                                    color: 'primary.main',
                                                                    '&:hover': {
                                                                        backgroundColor: 'action.hover'
                                                                    }
                                                                }}
                                                            >
                                                                <LocalShippingIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </ListItem>
                                                {index < enviosFiltrados.length - 1 && <Divider />}
                                            </React.Fragment>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Box>
                <Box
                    sx={{
                        flex: 2,
                        minWidth: 0,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: PANEL_GAP,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            height: 'calc(85% - 4px)',
                            minHeight: 0,
                            flexShrink: 0,
                            borderRadius: 2,
                            border: '4px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                        }}
                    >
                        <GeolocalizacionEnviosMap 
                            sucursal={sucursal} 
                            envios={envios} 
                            envioSeleccionado={envioSeleccionado}
                            onCentrarSucursal={() => setEnvioSeleccionado(null)}
                            onAsignarEnvio={handleAbrirDialogAsignacion}
                            isFullscreen={isFullscreen}
                        />
                    </Box>
                    <Paper
                        elevation={0}
                        sx={{
                            ...panelPaperSx,
                            height: 'calc(15% - 4px)',
                            minHeight: 0,
                            flexShrink: 0,
                        }}
                    >
                        <Box sx={{ p: 1.5, height: '100%', boxSizing: 'border-box' }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Panel inferior
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            width: '300%',
                            height: '100%',
                            transform: `translateX(-${(panelDerecho * 100) / 3}%)`,
                            transition: 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
                            willChange: 'transform',
                        }}
                    >
                        <Box sx={{ width: `${100 / 3}%`, height: '100%', flexShrink: 0, px: 0, boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" component="h2">
                                    Embarques ({embarques.length})
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title="Crear nuevo embarque">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => setOpenDialogCreateEmbarque(true)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Ver tránsito">
                                        <IconButton
                                            size="small"
                                            onClick={() => irPanelDerecho(PANEL_TRANSITO)}
                                        >
                                            <ArrowForwardIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
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
                                                                    >
                                                                        <FlightTakeoffIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Imprimir">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="secondary"
                                                                        onClick={() => imprimirAsignacion(embarque)}
                                                                    >
                                                                        <PrintIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Ver ruta">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => verRuta(embarque)}
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

                        <Box sx={{ width: `${100 / 3}%`, height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tooltip title="Ver embarques">
                                    <IconButton size="small" onClick={() => irPanelDerecho(PANEL_EMBARQUES)}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="h6" component="h2">
                                    Tránsito ({embarquesTransito.length})
                                </Typography>
                                <Tooltip title="Ver regresos">
                                    <IconButton size="small" onClick={() => irPanelDerecho(PANEL_REGRESOS)}>
                                        <ArrowForwardIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                {loadingTransito ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : embarquesTransito.length === 0 ? (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay embarques en tránsito
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {embarquesTransito.map((embarque, index) => (
                                            <React.Fragment key={embarque.id || index}>
                                                <ListItem
                                                    sx={{
                                                        flexDirection: 'row',
                                                        alignItems: 'flex-start',
                                                        py: 1.5,
                                                        px: 2,
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
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                                                        {!(embarque.partidas?.length > 0) ? (
                                                            <Tooltip title="Eliminar embarque">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => {
                                                                        if (embarqueDetalleTransito?.id === embarque.id) {
                                                                            handleCerrarDetalleTransito();
                                                                        }
                                                                        borrarEmbarque(embarque);
                                                                    }}
                                                                >
                                                                    <DeleteForeverIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <>
                                                                <Tooltip title="Registrar regreso">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="success"
                                                                        onClick={() => registrarRegreso(embarque)}
                                                                    >
                                                                        <FlightLandIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Ver envíos">
                                                                    <IconButton
                                                                        size="small"
                                                                        color="info"
                                                                        onClick={() => handleAbrirDetalleTransito(embarque)}
                                                                    >
                                                                        <InfoOutlinedIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                    </Box>
                                                </ListItem>
                                                {index < embarquesTransito.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Paper>
                        </Box>

                        <Box sx={{ width: `${100 / 3}%`, height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Tooltip title="Ver tránsito">
                                    <IconButton size="small" onClick={() => irPanelDerecho(PANEL_TRANSITO)}>
                                        <ArrowBackIcon />
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="h6" component="h2" sx={{ flex: 1, textAlign: 'center' }}>
                                    Regresos ({embarquesRegresos.length})
                                </Typography>
                                <Box sx={{ width: 34 }} />
                            </Box>
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                {loadingRegresos ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <CircularProgress />
                                    </Box>
                                ) : embarquesRegresos.length === 0 ? (
                                    <Box sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No hay regresos disponibles
                                        </Typography>
                                    </Box>
                                ) : (
                                    <List sx={{ p: 0 }}>
                                        {embarquesRegresos.map((embarque, index) => (
                                            <React.Fragment key={embarque.id || index}>
                                                <ListItem
                                                    sx={{
                                                        flexDirection: 'row',
                                                        alignItems: 'flex-start',
                                                        py: 1.5,
                                                        px: 2,
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
                                                    <Tooltip title="Imprimir asignación">
                                                        <IconButton
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => imprimirRegreso(embarque)}
                                                            sx={{ ml: 1 }}
                                                        >
                                                            <PrintIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </ListItem>
                                                {index < embarquesRegresos.length - 1 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Box>
                        </Paper>
                        </Box>
                    </Box>
                </Box>
        </Box>
        <EnvioDetalleLateral
            open={openDetalleEnvio}
            onClose={handleCerrarDetalleEnvio}
            envio={envioDetalle}
            loading={loadingEnvioDetalle}
        />
        <EmbarqueTransitoDetalleLateral
            open={openDetalleTransito}
            onClose={handleCerrarDetalleTransito}
            embarque={embarqueDetalleTransito}
            onEntregaEliminada={handleEntregaEliminadaTransito}
            onEntregaActualizada={handleEntregaActualizadaTransito}
            isFullscreen={isFullscreen}
        />
    </Box>
        <Dialog 
            open={openDialogAsignacion} 
            onClose={handleCerrarDialogAsignacion}
            fullWidth={false}
            maxWidth={false}
            disablePortal={false}
            container={document.body}
            PaperProps={{
                sx: {
                    width: '50rem',
                    maxWidth: '95vw',
                    height: '70vh',
                    minHeight: '70vh',
                    maxHeight: '70vh',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                zIndex: isFullscreen ? 13000 : 1300,
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
            open={openDialogAsignacionTotal}
            onClose={() => setOpenDialogAsignacionTotal(false)}
            disablePortal={false}
            container={document.body}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '50rem',
                    height: '50vh',
                    minHeight: '20rem',
                    maxHeight: '40rem',
                },
            }}
            sx={{
                zIndex: isFullscreen ? 13000 : 1300,
            }}
        >
            <TransportesEnviosPendientes asignar={handleAsignacionTotal} />
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
    </>
    );
}

export default GeolocalizacionEnvios;

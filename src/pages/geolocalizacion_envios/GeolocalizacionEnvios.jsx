import React, { useContext, useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GeolocalizacionEnviosMap from './GeolocalizacionEnviosMap';
import { Box, Typography, List, ListItem, ListItemText, Paper, Divider, CircularProgress, Dialog, IconButton, Tooltip, TextField, Checkbox, InputAdornment, Grid, Button, FormControl, InputLabel, Select, MenuItem, Chip, Badge } from '@mui/material';
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
import LocationOffIcon from '@mui/icons-material/LocationOff';
import InboxIcon from '@mui/icons-material/Inbox';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import UndoIcon from '@mui/icons-material/Undo';
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
import BuscadorEnvioGeolocalizacionPanel from './BuscadorEnvioGeolocalizacionPanel';
import MantenimientoEntrega from '../../components/mantenimiento_entrega/MantenimientoEntrega';
import SeguimientoEnvio from '../embarques/components/SeguimientoEnvio';
import { changeDateFormat, formatDate } from '../../utils/dateUtils';

const PANEL_EMBARQUES = 0;
const PANEL_TRANSITO = 1;
const PANEL_REGRESOS = 2;
const PANEL_ENVIOS = 0;
const PANEL_ENVIOS_REASIGNADOS = 1;
const PANEL_ENVIOS_HIJOS_REASIGNADOS = 2;
const PANEL_IZQUIERDO_TOTAL = 3;
const PANEL_DERECHO_TOTAL = 3;
const PANEL_GAP = 1;

const PANEL_TRANSITION_MS = 620;
const PANEL_TRANSITION_EASING = 'cubic-bezier(0.33, 0.72, 0.42, 1)';

const panelViewportSx = {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    height: '100%',
    overflow: 'hidden',
};

const getPanelSlotSx = (index, activeIndex) => {
    const isActive = index === activeIndex;
    const offset = isActive ? 0 : index < activeIndex ? -18 : 18;
    return {
        position: 'absolute',
        inset: 0,
        opacity: isActive ? 1 : 0,
        transform: `translate3d(${offset}px, 0, 0)`,
        transition: `opacity ${PANEL_TRANSITION_MS}ms ${PANEL_TRANSITION_EASING}, transform ${PANEL_TRANSITION_MS}ms ${PANEL_TRANSITION_EASING}`,
        pointerEvents: isActive ? 'auto' : 'none',
        zIndex: isActive ? 2 : 1,
        willChange: isActive ? 'opacity, transform' : 'auto',
        '@media (prefers-reduced-motion: reduce)': {
            transform: 'none',
            transition: `opacity ${PANEL_TRANSITION_MS * 0.6}ms ease`,
        },
    };
};

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

const panelIconButtonSx = {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    p: 1,
};

const panelNavIconButtonSx = (isActive) => ({
    ...panelIconButtonSx,
    transition: 'background-color 0.28s ease, color 0.28s ease, transform 0.22s cubic-bezier(0.33, 0.72, 0.42, 1), box-shadow 0.28s ease',
    ...(isActive && {
        bgcolor: 'action.selected',
        boxShadow: 'inset 0 0 0 1px rgba(25, 118, 210, 0.18)',
    }),
    '&:hover': {
        transform: 'scale(1.06)',
    },
    '&:active': {
        transform: 'scale(0.94)',
    },
    '@media (prefers-reduced-motion: reduce)': {
        transform: 'none',
        '&:hover, &:active': { transform: 'none' },
    },
});

const panelIconFontSize = 'medium';

const PANELES_DERECHO_NAV = [
    { id: PANEL_EMBARQUES, title: 'Embarques', Icon: AssignmentIcon },
    { id: PANEL_TRANSITO, title: 'Tránsito', Icon: LocalShippingIcon },
    { id: PANEL_REGRESOS, title: 'Regresos', Icon: FlightLandIcon },
];

const PanelDerechoNav = ({ panelActivo, onCambiarPanel }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {PANELES_DERECHO_NAV.map(({ id, title, Icon }) => (
            <Tooltip key={id} title={title}>
                <IconButton
                    size="medium"
                    color={panelActivo === id ? 'primary' : 'default'}
                    sx={panelNavIconButtonSx(panelActivo === id)}
                    onClick={() => onCambiarPanel(id)}
                    aria-label={title}
                    aria-current={panelActivo === id ? 'page' : undefined}
                >
                    <Icon fontSize={panelIconFontSize} />
                </IconButton>
            </Tooltip>
        ))}
    </Box>
);

const PANELES_IZQUIERDO_NAV = [
    { id: PANEL_ENVIOS, title: 'Envíos', Icon: InboxIcon },
    { id: PANEL_ENVIOS_REASIGNADOS, title: 'Reasignados', Icon: SwapHorizIcon },
    { id: PANEL_ENVIOS_HIJOS_REASIGNADOS, title: 'Enviados a otra sucursal', Icon: CallSplitIcon },
];

const PanelIzquierdoNav = ({ panelActivo, onCambiarPanel }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        {PANELES_IZQUIERDO_NAV.map(({ id, title, Icon }) => (
            <Tooltip key={id} title={title}>
                <IconButton
                    size="medium"
                    color={panelActivo === id ? 'primary' : 'default'}
                    sx={panelNavIconButtonSx(panelActivo === id)}
                    onClick={() => onCambiarPanel(id)}
                    aria-label={title}
                    aria-current={panelActivo === id ? 'page' : undefined}
                >
                    <Icon fontSize={panelIconFontSize} />
                </IconButton>
            </Tooltip>
        ))}
    </Box>
);

const formatDireccionEnvio = (instruccion) => {
    if (!instruccion) return 'Sin dirección';
    const partes = [
        instruccion.direccion_calle,
        instruccion.direccion_numero_exterior,
        instruccion.direccion_colonia,
        instruccion.direccion_codigo_postal ? `C.P. ${instruccion.direccion_codigo_postal}` : null,
        instruccion.direccion_municipio,
        instruccion.direccion_estado,
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : 'Sin dirección';
};

const formatFechaEnvio = (fecha) => {
    if (!fecha) return null;
    const datePart = String(fecha).split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return changeDateFormat(datePart);
    }
    return formatDate(fecha);
};

const esCoordenadaValida = (valor) => {
    if (valor === null || valor === undefined || valor === '') return false;
    const numero = Number(valor);
    return Number.isFinite(numero) && numero !== 0;
};

const instruccionTieneCoordenadas = (instruccion) => (
    esCoordenadaValida(instruccion?.direccion_latitud) && esCoordenadaValida(instruccion?.direccion_longitud)
);

const GeolocalizacionEnvios = () => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const {sucursal, sucursales, setLoading, auth, periodo, loading} = useContext(ContextEmbarques);
    const [envios, setEnvios] = useState([]);
    const [enviosReasignados, setEnviosReasignados] = useState([]);
    const [loadingReasignados, setLoadingReasignados] = useState(false);
    const [enviosHijosReasignados, setEnviosHijosReasignados] = useState([]);
    const [loadingHijosReasignados, setLoadingHijosReasignados] = useState(false);
    const [filtroEnviosHijosReasignados, setFiltroEnviosHijosReasignados] = useState('');
    const [enviosHijosReasignadosSeleccionados, setEnviosHijosReasignadosSeleccionados] = useState({});
    const [openDialogReasignarHijo, setOpenDialogReasignarHijo] = useState(false);
    const [envioHijoReasignar, setEnvioHijoReasignar] = useState(null);
    const [sucursalDestinoHijo, setSucursalDestinoHijo] = useState('');
    const [guardandoDestinoHijo, setGuardandoDestinoHijo] = useState(false);
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
    const [panelIzquierdo, setPanelIzquierdo] = useState(PANEL_ENVIOS);
    const [showRuta, setShowRuta] = useState(false);
    const [ruta, setRuta] = useState([]);
    const [openDialogEmbarque, setOpenDialogEmbarque] = useState(false);
    const [embarqueSeleccionado, setEmbarqueSeleccionado] = useState(null);
    const [openDialogCreateEmbarque, setOpenDialogCreateEmbarque] = useState(false);
    const [filtroEnvios, setFiltroEnvios] = useState('');
    const [filtroEnviosReasignados, setFiltroEnviosReasignados] = useState('');
    const [enviosSeleccionados, setEnviosSeleccionados] = useState({});
    const [enviosReasignadosSeleccionados, setEnviosReasignadosSeleccionados] = useState({});
    const [origenAsignacionTotal, setOrigenAsignacionTotal] = useState(PANEL_ENVIOS);
    const [openDetalleEnvio, setOpenDetalleEnvio] = useState(false);
    const [envioDetalle, setEnvioDetalle] = useState(null);
    const [loadingEnvioDetalle, setLoadingEnvioDetalle] = useState(false);
    const [openDialogAsignacionTotal, setOpenDialogAsignacionTotal] = useState(false);
    const [openDetalleTransito, setOpenDetalleTransito] = useState(false);
    const [embarqueDetalleTransito, setEmbarqueDetalleTransito] = useState(null);
    const [openDialogSucursalEntrega, setOpenDialogSucursalEntrega] = useState(false);
    const [envioSucursalEntrega, setEnvioSucursalEntrega] = useState(null);
    const [sucursalEntregaSeleccionada, setSucursalEntregaSeleccionada] = useState('');
    const [guardandoSucursalEntrega, setGuardandoSucursalEntrega] = useState(false);
    const [partidasReasignacion, setPartidasReasignacion] = useState([]);
    const [partidasReasignacionSeleccionadas, setPartidasReasignacionSeleccionadas] = useState({});
    const [loadingPartidasReasignacion, setLoadingPartidasReasignacion] = useState(false);
    const [openDialogBuscador, setOpenDialogBuscador] = useState(false);
    const [openDialogMantenimientoEntrega, setOpenDialogMantenimientoEntrega] = useState(false);
    const [openDialogSeguimientoEnvio, setOpenDialogSeguimientoEnvio] = useState(false);
    const [buscadorAsignacionSeleccion, setBuscadorAsignacionSeleccion] = useState({});
    const [geocodificandoEnvioId, setGeocodificandoEnvioId] = useState(null);

    const dialogZIndexSx = {
        zIndex: isFullscreen ? 13000 : 1300,
        '& .MuiBackdrop-root': { zIndex: isFullscreen ? 12999 : 1300 },
        '& .MuiDialog-container': { zIndex: isFullscreen ? 13000 : 1300 },
        '& .MuiDialog-paper': { zIndex: isFullscreen ? 13000 : 1300 },
    };

    const overlayZIndex = isFullscreen ? 14000 : 1400;

    const getData = async () => {
        setLoading(true)
        if(objectIsEmpty(auth)){
           try{
                const url = `${apiUrl.url}embarques/envios_tablero_pendientes` 
                   
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

    const getEnviosReasignados = async () => {
        if (!objectIsEmpty(auth)) return;
        setLoadingReasignados(true);
        try {
            const url = `${apiUrl.url}embarques/envios_reasignados_pendientes`;
            const resp = await axios.get(url, {
                params: {
                    fecha_inicial: periodo.fecha_inicial,
                    fecha_final: periodo.fecha_final,
                    sucursal_entrega: sucursal.nombre,
                },
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            const data = resp.data || [];
            setEnviosReasignados(data);
            setEnviosReasignadosSeleccionados((prev) => {
                const idsActuales = new Set(data.map((e) => e.id));
                return Object.fromEntries(
                    Object.entries(prev).filter(([id]) => idsActuales.has(Number(id)) || idsActuales.has(id))
                );
            });
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('../../login');
            }
            console.error('Error al obtener envíos reasignados:', error);
        } finally {
            setLoadingReasignados(false);
        }
    };

    const getEnviosHijosReasignados = async () => {
        if (!objectIsEmpty(auth)) return;
        setLoadingHijosReasignados(true);
        try {
            const url = `${apiUrl.url}embarques/envios_hijos_reasignados_salida`;
            const resp = await axios.get(url, {
                params: {
                    fecha_inicial: periodo.fecha_inicial,
                    fecha_final: periodo.fecha_final,
                    sucursal: sucursal.nombre,
                },
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setEnviosHijosReasignados(resp.data || []);
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('../../login');
            }
            console.error('Error al obtener envíos hijos reasignados:', error);
        } finally {
            setLoadingHijosReasignados(false);
        }
    };

    useEffect(() => {
        getData()
        getEnviosReasignados()
        getEnviosHijosReasignados()
        getEmbarquesPendientes()
        getEmbarquesTransito()
        getEmbarquesRegresos()
    }, [periodo])

    const filtrarEnviosPorCliente = (lista, filtro) => {
        const q = filtro.trim().toLowerCase();
        if (!q) return lista;
        return lista.filter((envio) => {
            const destinatario = (envio.destinatario || '').toLowerCase();
            const deDestinatario = (envio.de_destinatario || '').toLowerCase();
            const contacto = (envio.instruccion?.contacto || '').toLowerCase();
            return destinatario.includes(q) || deDestinatario.includes(q) || contacto.includes(q);
        });
    };

    const enviosFiltrados = useMemo(
        () => filtrarEnviosPorCliente(envios, filtroEnvios),
        [envios, filtroEnvios]
    );

    const enviosReasignadosFiltrados = useMemo(
        () => filtrarEnviosPorCliente(enviosReasignados, filtroEnviosReasignados),
        [enviosReasignados, filtroEnviosReasignados]
    );

    const enviosHijosReasignadosFiltrados = useMemo(
        () => filtrarEnviosPorCliente(enviosHijosReasignados, filtroEnviosHijosReasignados),
        [enviosHijosReasignados, filtroEnviosHijosReasignados]
    );

    const cantidadHijosReasignadosSeleccionados = Object.keys(enviosHijosReasignadosSeleccionados).length;
    const enviosHijosGestionablesFiltrados = useMemo(
        () => enviosHijosReasignadosFiltrados.filter((envio) => !envio.tiene_asignaciones),
        [enviosHijosReasignadosFiltrados]
    );
    const todosHijosFiltradosSeleccionados = enviosHijosGestionablesFiltrados.length > 0 &&
        enviosHijosGestionablesFiltrados.every((envio) => enviosHijosReasignadosSeleccionados[envio.id]);
    const algunosHijosFiltradosSeleccionados = enviosHijosGestionablesFiltrados.some(
        (envio) => enviosHijosReasignadosSeleccionados[envio.id]
    );

    const handleToggleEnvioHijoReasignadoSeleccionado = (envioId) => {
        setEnviosHijosReasignadosSeleccionados((prev) => {
            const next = { ...prev };
            if (next[envioId]) {
                delete next[envioId];
            } else {
                next[envioId] = true;
            }
            return next;
        });
    };

    const handleToggleTodosHijosFiltrados = () => {
        setEnviosHijosReasignadosSeleccionados((prev) => {
            const next = { ...prev };
            if (todosHijosFiltradosSeleccionados) {
                enviosHijosGestionablesFiltrados.forEach((envio) => {
                    delete next[envio.id];
                });
            } else {
                enviosHijosGestionablesFiltrados.forEach((envio) => {
                    next[envio.id] = true;
                });
            }
            return next;
        });
    };

    const handleAbrirDialogReasignarHijo = (envio) => {
        if (envio.tiene_asignaciones) {
            Swal.fire({
                icon: 'warning',
                title: 'Envío asignado',
                text: 'No se puede cambiar el destino porque el envío ya tiene asignaciones',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        setEnvioHijoReasignar(envio);
        setSucursalDestinoHijo(envio.sucursal_entrega || '');
        setOpenDialogReasignarHijo(true);
    };

    const handleCerrarDialogReasignarHijo = () => {
        setOpenDialogReasignarHijo(false);
        setEnvioHijoReasignar(null);
        setSucursalDestinoHijo('');
        setGuardandoDestinoHijo(false);
    };

    const handleGuardarDestinoHijo = async () => {
        if (!envioHijoReasignar || !sucursalDestinoHijo) {
            return;
        }
        if (sucursalDestinoHijo === envioHijoReasignar.sucursal_entrega) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin cambios',
                text: 'Seleccione una sucursal distinta al destino actual',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        if (!objectIsEmpty(auth)) {
            navigate('../../login');
            return;
        }
        setGuardandoDestinoHijo(true);
        try {
            const url = `${apiUrl.url}embarques/reasignar_destino_envio_hijo/${envioHijoReasignar.id}/`;
            await axios.put(
                url,
                { sucursal_entrega: sucursalDestinoHijo },
                { headers: { Authorization: `Bearer ${auth.access}` } }
            );
            handleCerrarDialogReasignarHijo();
            getEnviosHijosReasignados();
            Swal.fire({
                icon: 'success',
                title: 'Destino actualizado',
                text: 'El envío derivado fue reasignado a la nueva sucursal',
                didOpen: configureSwalZIndex,
            });
        } catch (error) {
            console.error('Error al reasignar destino del envío hijo:', error);
            if (error.response?.status === 401) {
                navigate('../../login');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'No se pudo actualizar el destino',
                    didOpen: configureSwalZIndex,
                });
            }
        } finally {
            setGuardandoDestinoHijo(false);
        }
    };

    const handleCancelarReasignacionHijo = (envio) => {
        if (envio.tiene_asignaciones) {
            Swal.fire({
                icon: 'warning',
                title: 'Envío asignado',
                text: 'No se puede cancelar porque el envío ya tiene asignaciones',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        Swal.fire({
            title: 'Cancelar reasignación',
            html: `¿Regresar las partidas al envío origen y eliminar el envío derivado <strong>${envio.documento || ''}</strong>?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No',
            didOpen: configureSwalZIndex,
        }).then(async (result) => {
            if (!result.isConfirmed) return;
            if (!objectIsEmpty(auth)) {
                navigate('../../login');
                return;
            }
            setLoadingHijosReasignados(true);
            try {
                const url = `${apiUrl.url}embarques/cancelar_envio_hijo_reasignacion/${envio.id}/`;
                await axios.delete(url, {
                    headers: { Authorization: `Bearer ${auth.access}` },
                });
                setEnviosHijosReasignadosSeleccionados((prev) => {
                    const next = { ...prev };
                    delete next[envio.id];
                    return next;
                });
                getData();
                getEnviosHijosReasignados();
                Swal.fire({
                    icon: 'success',
                    title: 'Reasignación cancelada',
                    text: 'Las partidas regresaron al envío origen y ya pueden embarcarse aquí',
                    didOpen: configureSwalZIndex,
                });
            } catch (error) {
                console.error('Error al cancelar reasignación:', error);
                if (error.response?.status === 401) {
                    navigate('../../login');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'No se pudo cancelar la reasignación',
                        didOpen: configureSwalZIndex,
                    });
                }
            } finally {
                setLoadingHijosReasignados(false);
            }
        });
    };

    const cantidadSeleccionados = Object.keys(enviosSeleccionados).length;
    const cantidadReasignadosSeleccionados = Object.keys(enviosReasignadosSeleccionados).length;
    const todosFiltradosSeleccionados = enviosFiltrados.length > 0 &&
        enviosFiltrados.every((envio) => enviosSeleccionados[envio.id]);
    const algunosFiltradosSeleccionados = enviosFiltrados.some((envio) => enviosSeleccionados[envio.id]);
    const todosReasignadosFiltradosSeleccionados = enviosReasignadosFiltrados.length > 0 &&
        enviosReasignadosFiltrados.every((envio) => enviosReasignadosSeleccionados[envio.id]);
    const algunosReasignadosFiltradosSeleccionados = enviosReasignadosFiltrados.some(
        (envio) => enviosReasignadosSeleccionados[envio.id]
    );

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

    const handleToggleEnvioReasignadoSeleccionado = (envioId) => {
        setEnviosReasignadosSeleccionados((prev) => {
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

    const handleToggleTodosReasignadosFiltrados = () => {
        setEnviosReasignadosSeleccionados((prev) => {
            const next = { ...prev };
            if (todosReasignadosFiltradosSeleccionados) {
                enviosReasignadosFiltrados.forEach((envio) => {
                    delete next[envio.id];
                });
            } else {
                enviosReasignadosFiltrados.forEach((envio) => {
                    next[envio.id] = true;
                });
            }
            return next;
        });
    };

    const handleRefresh = () => {
        getData();
        getEnviosReasignados();
        getEnviosHijosReasignados();
        getEmbarquesPendientes();
        getEmbarquesTransito();
        getEmbarquesRegresos();
    }

    const aplicarCoordenadasEnvio = (envioId, latitud, longitud) => {
        const patchLista = (lista) => (lista || []).map((envio) => (
            envio.id === envioId
                ? {
                    ...envio,
                    instruccion: {
                        ...(envio.instruccion || {}),
                        direccion_latitud: latitud,
                        direccion_longitud: longitud,
                    },
                }
                : envio
        ));
        setEnvios((prev) => patchLista(prev));
        setEnviosReasignados((prev) => patchLista(prev));
        setEnviosHijosReasignados((prev) => patchLista(prev));
        setEnvioSeleccionado((prev) => (
            prev?.id === envioId
                ? {
                    ...prev,
                    instruccion: {
                        ...(prev.instruccion || {}),
                        direccion_latitud: latitud,
                        direccion_longitud: longitud,
                    },
                }
                : prev
        ));
    };

    const handleGeocodificarEnvio = async (envio) => {
        if (!envio?.id || geocodificandoEnvioId) return;
        setGeocodificandoEnvioId(envio.id);
        try {
            const url = `${apiUrl.url}embarques/geocodificar_instruccion_envio/${envio.id}/`;
            const resp = await axios.post(url, {}, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            const { latitud, longitud, cliente_actualizado, rfc, clientes_omitidos } = resp.data || {};
            if (!latitud || !longitud) {
                throw new Error('No se obtuvieron coordenadas');
            }
            aplicarCoordenadasEnvio(envio.id, latitud, longitud);
            setEnvioSeleccionado((prev) => {
                const base = prev?.id === envio.id ? prev : envio;
                return {
                    ...base,
                    instruccion: {
                        ...(base.instruccion || {}),
                        direccion_latitud: latitud,
                        direccion_longitud: longitud,
                    },
                };
            });
            let mensajeCliente = 'Se actualizó la instrucción. El envío no tiene RFC de destinatario.';
            if (cliente_actualizado) {
                mensajeCliente = 'Se actualizaron las coordenadas de la instrucción y del cliente.';
            } else if (clientes_omitidos) {
                mensajeCliente = 'Se actualizó la instrucción. La calle o el código postal no coinciden con el cliente, por eso se respetó su dirección.';
            } else if (rfc) {
                mensajeCliente = `Se actualizó la instrucción. No se encontró cliente con RFC ${rfc}.`;
            }
            Swal.fire({
                icon: 'success',
                title: 'Geolocalización encontrada',
                text: mensajeCliente,
                didOpen: configureSwalZIndex,
            });
        } catch (error) {
            const mensaje = error?.response?.data?.message || error.message || 'No se pudo geolocalizar la dirección';
            Swal.fire({
                icon: 'error',
                title: 'Sin geolocalización',
                text: mensaje,
                didOpen: configureSwalZIndex,
            });
        } finally {
            setGeocodificandoEnvioId(null);
        }
    };

    const irPanelDerecho = (siguiente) => {
        setPanelDerecho(siguiente);
    };

    const irPanelIzquierdo = (siguiente) => {
        setPanelIzquierdo(siguiente);
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

    const esEnvioCod = (envio) => (envio?.tipo_documento || '').toUpperCase() === 'COD';

    const esEnvioReasignadoCompleto = (envio) => Boolean(
        envio?.sucursal_entrega &&
        envio.sucursal_entrega !== envio.sucursal
    );

    const esEnvioDerivadoReasignacion = (envio) => Boolean(envio?.envio_origen);

    const cargarPartidasReasignacion = async (envioId) => {
        setLoadingPartidasReasignacion(true);
        try {
            const url = `${apiUrl.url}embarques/partidas_reasignacion/${envioId}/`;
            const resp = await axios.get(url, {
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            const partidas = resp.data || [];
            setPartidasReasignacion(partidas);
            const seleccionInicial = {};
            partidas.forEach((partida) => {
                if (partida.elegible) {
                    seleccionInicial[partida.id] = true;
                }
            });
            setPartidasReasignacionSeleccionadas(seleccionInicial);
        } catch (error) {
            console.error('Error al cargar partidas para reasignación:', error);
            setPartidasReasignacion([]);
            setPartidasReasignacionSeleccionadas({});
            if (error.response?.status === 401) {
                navigate('../../login');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'No se pudieron cargar las partidas',
                    didOpen: configureSwalZIndex,
                });
            }
        } finally {
            setLoadingPartidasReasignacion(false);
        }
    };

    const handleAbrirDialogSucursalEntrega = async (envio) => {
        if (esEnvioCod(envio)) {
            Swal.fire({
                icon: 'warning',
                title: 'Envío COD',
                text: 'No se puede reasignar un envío COD; solo CON o CRE',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        if (esEnvioDerivadoReasignacion(envio)) {
            Swal.fire({
                icon: 'warning',
                title: 'Envío derivado',
                text: 'No se puede reasignar un envío generado por reasignación',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        if (esEnvioReasignadoCompleto(envio)) {
            Swal.fire({
                icon: 'warning',
                title: 'Envío reasignado',
                text: 'Este envío ya está reasignado completamente',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        if (!objectIsEmpty(auth)) {
            navigate('../../login');
            return;
        }
        setEnvioSucursalEntrega(envio);
        setSucursalEntregaSeleccionada('');
        setPartidasReasignacion([]);
        setPartidasReasignacionSeleccionadas({});
        setOpenDialogSucursalEntrega(true);
        await cargarPartidasReasignacion(envio.id);
    };

    const handleCerrarDialogSucursalEntrega = () => {
        setOpenDialogSucursalEntrega(false);
        setEnvioSucursalEntrega(null);
        setSucursalEntregaSeleccionada('');
        setPartidasReasignacion([]);
        setPartidasReasignacionSeleccionadas({});
        setGuardandoSucursalEntrega(false);
        setLoadingPartidasReasignacion(false);
    };

    const handleTogglePartidaReasignacion = (partidaId) => {
        setPartidasReasignacionSeleccionadas((prev) => ({
            ...prev,
            [partidaId]: !prev[partidaId],
        }));
    };

    const cantidadPartidasReasignacionSeleccionadas = useMemo(
        () => Object.values(partidasReasignacionSeleccionadas).filter(Boolean).length,
        [partidasReasignacionSeleccionadas]
    );

    const handleGuardarSucursalEntrega = async () => {
        if (!envioSucursalEntrega || !sucursalEntregaSeleccionada) {
            return;
        }
        const detalleIds = Object.entries(partidasReasignacionSeleccionadas)
            .filter(([, selected]) => selected)
            .map(([id]) => Number(id));
        if (detalleIds.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin partidas',
                text: 'Seleccione al menos una partida para reasignar',
                didOpen: configureSwalZIndex,
            });
            return;
        }
        if (!objectIsEmpty(auth)) {
            navigate('../../login');
            return;
        }
        setGuardandoSucursalEntrega(true);
        try {
            const url = `${apiUrl.url}embarques/actualizar_sucursal_entrega/`;
            await axios.put(
                url,
                {
                    envio_id: envioSucursalEntrega.id,
                    sucursal_entrega: sucursalEntregaSeleccionada,
                    detalle_ids: detalleIds,
                },
                { headers: { Authorization: `Bearer ${auth.access}` } }
            );
            handleCerrarDialogSucursalEntrega();
            getData();
            getEnviosReasignados();
            getEnviosHijosReasignados();
            Swal.fire({
                icon: 'success',
                title: 'Reasignación registrada',
                text: 'Se creó el envío derivado con las partidas seleccionadas',
                didOpen: configureSwalZIndex,
            });
        } catch (error) {
            console.error('Error al actualizar sucursal entrega:', error);
            if (error.response?.status === 401) {
                navigate('../../login');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'No se pudo registrar la reasignación',
                    didOpen: configureSwalZIndex,
                });
            }
        } finally {
            setGuardandoSucursalEntrega(false);
        }
    };

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

    const handleBuscadorEnvioSeleccionadoMapa = (envio) => {
        setEnvioSeleccionado(envio);
        setPanelIzquierdo(PANEL_ENVIOS);
    };

    const handleBuscadorAsignacionParcial = (seleccion) => {
        setOpenDialogBuscador(false);
        setBuscadorAsignacionSeleccion(seleccion);
        setOpenDialogAsignacion(true);
    };

    const handleBuscadorAsignacionTotal = (seleccion) => {
        setOpenDialogBuscador(false);
        setEnviosSeleccionados(seleccion);
        setOrigenAsignacionTotal(PANEL_ENVIOS);
        setOpenDialogAsignacionTotal(true);
    };

    const handleCerrarDialogAsignacion = () => {
        setOpenDialogAsignacion(false);
        setEnvioParaAsignar(null);
        setBuscadorAsignacionSeleccion({});
    }

    const handleAbrirAsignacionTotal = (origen = PANEL_ENVIOS) => {
        const seleccion =
            origen === PANEL_ENVIOS_REASIGNADOS
                ? enviosReasignadosSeleccionados
                : origen === PANEL_ENVIOS_HIJOS_REASIGNADOS
                    ? enviosHijosReasignadosSeleccionados
                    : enviosSeleccionados;
        if (Object.keys(seleccion).length === 0) {
            return;
        }
        setOrigenAsignacionTotal(origen);
        setOpenDialogAsignacionTotal(true);
    };

    const handleAsignacionTotal = (transporte) => {
        setOpenDialogAsignacionTotal(false);
        const seleccion =
            origenAsignacionTotal === PANEL_ENVIOS_REASIGNADOS
                ? enviosReasignadosSeleccionados
                : origenAsignacionTotal === PANEL_ENVIOS_HIJOS_REASIGNADOS
                    ? enviosHijosReasignadosSeleccionados
                    : enviosSeleccionados;
        const enviosIds = Object.keys(seleccion);
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
                    if (origenAsignacionTotal === PANEL_ENVIOS_REASIGNADOS) {
                        setEnviosReasignadosSeleccionados({});
                    } else if (origenAsignacionTotal === PANEL_ENVIOS_HIJOS_REASIGNADOS) {
                        setEnviosHijosReasignadosSeleccionados({});
                    } else {
                        setEnviosSeleccionados({});
                    }
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

    const renderListaEnvios = ({
        lista,
        seleccionados,
        onToggleSeleccionado,
        permitirSeleccionMapa = true,
        mostrarOrigen = false,
        variante = 'default',
    }) => (
        <List sx={{ p: 0 }}>
            {lista.map((envio, index) => {
                const esHijoSalida = variante === 'hijos_salida';
                const isSelected = permitirSeleccionMapa && envioSeleccionado?.id === envio.id;
                const isChecked = Boolean(seleccionados?.[envio.id]);
                const tieneCoordenadas = instruccionTieneCoordenadas(envio.instruccion);
                const direccion = formatDireccionEnvio(envio.instruccion);
                const fechaEnvio = formatFechaEnvio(envio.fecha_documento);
                const sucursalQueEntrega = envio.sucursal_entrega || envio.sucursal;
                const esReasignado = esEnvioReasignadoCompleto(envio);
                const esDerivado = esEnvioDerivadoReasignacion(envio);
                const esCod = esEnvioCod(envio);
                const hijoConAsignaciones = esHijoSalida && Boolean(envio.tiene_asignaciones);
                const puedeGestionarHijo = esHijoSalida && !hijoConAsignaciones;
                const puedeReasignar = !mostrarOrigen && !esHijoSalida && !esReasignado && !esDerivado && !esCod;
                const mostrarCheckbox = esHijoSalida ? puedeGestionarHijo : true;
                const mostrarAccionesAsignacion = !esHijoSalida || puedeGestionarHijo;

                return (
                    <React.Fragment key={envio.id || index}>
                        <ListItem
                            button
                            onClick={() => {
                                if (permitirSeleccionMapa && tieneCoordenadas) {
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
                                    cursor: permitirSeleccionMapa && tieneCoordenadas ? 'pointer' : 'default',
                                },
                                opacity: permitirSeleccionMapa ? (tieneCoordenadas ? 1 : 0.6) : 1,
                            }}
                        >
                            {mostrarCheckbox && (
                                <Checkbox
                                    size="small"
                                    checked={isChecked}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => onToggleSeleccionado(envio.id)}
                                    sx={{ mt: 0.25, p: 0.5 }}
                                />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <ListItemText
                                    primaryTypographyProps={{ component: 'div' }}
                                    secondaryTypographyProps={{ component: 'div' }}
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {envio.documento || 'Sin documento'}
                                            </Typography>
                                            {envio.tipo_documento && (
                                                <Typography
                                                    variant="subtitle2"
                                                    color={esCod ? 'error.main' : 'text.secondary'}
                                                >
                                                    {envio.tipo_documento}
                                                </Typography>
                                            )}
                                            {fechaEnvio && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {fechaEnvio}
                                                </Typography>
                                            )}
                                            {!tieneCoordenadas && (
                                                <Tooltip title="Sin latitud y longitud. Clic para buscar geolocalización">
                                                    <Chip
                                                        size="small"
                                                        icon={geocodificandoEnvioId === envio.id ? undefined : <LocationOffIcon sx={{ fontSize: '14px !important' }} />}
                                                        label={geocodificandoEnvioId === envio.id ? 'Buscando...' : 'Sin GPS'}
                                                        color="warning"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleGeocodificarEnvio(envio);
                                                        }}
                                                        sx={{
                                                            height: 22,
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            cursor: geocodificandoEnvioId === envio.id ? 'wait' : 'pointer',
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="text.secondary">
                                                {envio.destinatario || 'Sin destinatario'}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: 'block', mt: 0.5, wordBreak: 'break-word' }}
                                            >
                                                {direccion}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
                                                {esHijoSalida ? (
                                                    <>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Destino: {sucursalQueEntrega || 'Sin sucursal'}
                                                        </Typography>
                                                        <Chip
                                                            size="small"
                                                            label="Envío derivado"
                                                            color="info"
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                                        />
                                                        {envio.envio_origen_documento && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Doc. origen: {envio.envio_origen_documento}
                                                            </Typography>
                                                        )}
                                                        {hijoConAsignaciones && (
                                                            <Chip
                                                                size="small"
                                                                label="Asignado"
                                                                color="success"
                                                                variant="outlined"
                                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                                            />
                                                        )}
                                                    </>
                                                ) : mostrarOrigen ? (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Origen: {envio.sucursal || 'N/A'}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Entrega: {sucursalQueEntrega || 'Sin sucursal'}
                                                    </Typography>
                                                )}
                                                {!esHijoSalida && esReasignado && (
                                                    <Chip
                                                        size="small"
                                                        label={esDerivado ? 'Reasignado' : 'Reasignado'}
                                                        color="warning"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                )}
                                                {esDerivado && envio.envio_origen && !esHijoSalida && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Origen envío #{envio.envio_origen}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </>
                                    }
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 0.5, gap: 0.25 }}>
                                <Tooltip title="Ver detalle">
                                    <IconButton
                                        size="medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAbrirDetalleEnvio(envio);
                                        }}
                                        sx={{ ...panelIconButtonSx, color: 'info.main', '&:hover': { backgroundColor: 'action.hover' } }}
                                    >
                                        <InfoOutlinedIcon fontSize={panelIconFontSize} />
                                    </IconButton>
                                </Tooltip>
                                {puedeGestionarHijo && (
                                    <Tooltip title="Cambiar sucursal destino">
                                        <IconButton
                                            size="medium"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAbrirDialogReasignarHijo(envio);
                                            }}
                                            sx={{
                                                ...panelIconButtonSx,
                                                color: 'text.secondary',
                                                '&:hover': { backgroundColor: 'action.hover' },
                                            }}
                                        >
                                            <SwapHorizIcon fontSize={panelIconFontSize} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {puedeGestionarHijo && (
                                    <Tooltip title="Cancelar reasignación (regresar al envío origen)">
                                        <IconButton
                                            size="medium"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelarReasignacionHijo(envio);
                                            }}
                                            sx={{
                                                ...panelIconButtonSx,
                                                color: 'warning.main',
                                                '&:hover': { backgroundColor: 'action.hover' },
                                            }}
                                        >
                                            <UndoIcon fontSize={panelIconFontSize} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {mostrarAccionesAsignacion && puedeReasignar && (
                                    <Tooltip title="Reasignar partidas">
                                        <IconButton
                                            size="medium"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAbrirDialogSucursalEntrega(envio);
                                            }}
                                            sx={{
                                                ...panelIconButtonSx,
                                                color: 'text.secondary',
                                                '&:hover': { backgroundColor: 'action.hover' },
                                            }}
                                        >
                                            <SwapHorizIcon fontSize={panelIconFontSize} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {mostrarAccionesAsignacion && (
                                    <Tooltip title="Asignar envío">
                                    <IconButton
                                        size="medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAbrirDialogAsignacion(envio);
                                        }}
                                        sx={{ ...panelIconButtonSx, color: 'primary.main', '&:hover': { backgroundColor: 'action.hover' } }}
                                    >
                                        <LocalShippingIcon fontSize={panelIconFontSize} />
                                    </IconButton>
                                    </Tooltip>
                                )}
                            </Box>
                        </ListItem>
                        {index < lista.length - 1 && <Divider />}
                    </React.Fragment>
                );
            })}
        </List>
    );

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
                    <Box sx={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {enviosReasignados.length > 0 && (
                            <Tooltip title="Ver envíos reasignados">
                                <Badge
                                    badgeContent={enviosReasignados.length}
                                    color="warning"
                                    max={99}
                                >
                                    <Chip
                                        size="small"
                                        label="Reasignados"
                                        color="warning"
                                        variant="outlined"
                                        icon={<SwapHorizIcon />}
                                        onClick={() => irPanelIzquierdo(PANEL_ENVIOS_REASIGNADOS)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Badge>
                            </Tooltip>
                        )}
                        {enviosHijosReasignados.length > 0 && (
                            <Tooltip title="Ver envíos enviados a otra sucursal">
                                <Badge
                                    badgeContent={enviosHijosReasignados.length}
                                    color="info"
                                    max={99}
                                >
                                    <Chip
                                        size="small"
                                        label="Enviados"
                                        color="info"
                                        variant="outlined"
                                        icon={<CallSplitIcon />}
                                        onClick={() => irPanelIzquierdo(PANEL_ENVIOS_HIJOS_REASIGNADOS)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Badge>
                            </Tooltip>
                        )}
                    </Box>
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
                <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={panelViewportSx}>
                        <Box sx={getPanelSlotSx(PANEL_ENVIOS, panelIzquierdo)} aria-hidden={panelIzquierdo !== PANEL_ENVIOS}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                            <Paper elevation={0} sx={panelPaperSx}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" component="h2">
                                            Envíos ({filtroEnvios ? `${enviosFiltrados.length}/${envios.length}` : envios.length})
                                        </Typography>
                                        <PanelIzquierdoNav panelActivo={panelIzquierdo} onCambiarPanel={irPanelIzquierdo} />
                                    </Box>
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
                                                        size="medium"
                                                        aria-label="Limpiar filtro"
                                                        onClick={() => setFiltroEnvios('')}
                                                        edge="end"
                                                        sx={panelIconButtonSx}
                                                    >
                                                        <ClearIcon fontSize={panelIconFontSize} />
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
                                                        size="medium"
                                                        color="primary"
                                                        sx={panelIconButtonSx}
                                                        onClick={() => handleAbrirAsignacionTotal(PANEL_ENVIOS)}
                                                        disabled={cantidadSeleccionados === 0}
                                                    >
                                                        <LocalShippingIcon fontSize={panelIconFontSize} />
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
                                        renderListaEnvios({
                                            lista: enviosFiltrados,
                                            seleccionados: enviosSeleccionados,
                                            onToggleSeleccionado: handleToggleEnvioSeleccionado,
                                            permitirSeleccionMapa: true,
                                            mostrarOrigen: false,
                                        })
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                        </Box>
                        <Box sx={getPanelSlotSx(PANEL_ENVIOS_REASIGNADOS, panelIzquierdo)} aria-hidden={panelIzquierdo !== PANEL_ENVIOS_REASIGNADOS}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                            <Paper elevation={0} sx={panelPaperSx}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" component="h2">
                                            Reasignados ({filtroEnviosReasignados ? `${enviosReasignadosFiltrados.length}/${enviosReasignados.length}` : enviosReasignados.length})
                                        </Typography>
                                        <PanelIzquierdoNav panelActivo={panelIzquierdo} onCambiarPanel={irPanelIzquierdo} />
                                    </Box>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Cliente"
                                        value={filtroEnviosReasignados}
                                        onChange={(e) => setFiltroEnviosReasignados(e.target.value)}
                                        sx={{ mt: 1.5 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: filtroEnviosReasignados ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="medium"
                                                        aria-label="Limpiar filtro"
                                                        onClick={() => setFiltroEnviosReasignados('')}
                                                        edge="end"
                                                        sx={panelIconButtonSx}
                                                    >
                                                        <ClearIcon fontSize={panelIconFontSize} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null,
                                        }}
                                    />
                                    {enviosReasignados.length > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, ml: -1, mr: -0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={todosReasignadosFiltradosSeleccionados}
                                                    indeterminate={!todosReasignadosFiltradosSeleccionados && algunosReasignadosFiltradosSeleccionados}
                                                    onChange={handleToggleTodosReasignadosFiltrados}
                                                    disabled={enviosReasignadosFiltrados.length === 0}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Seleccionar todos
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Asignación total">
                                                <span>
                                                    <IconButton
                                                        size="medium"
                                                        color="primary"
                                                        sx={panelIconButtonSx}
                                                        onClick={() => handleAbrirAsignacionTotal(PANEL_ENVIOS_REASIGNADOS)}
                                                        disabled={cantidadReasignadosSeleccionados === 0}
                                                    >
                                                        <LocalShippingIcon fontSize={panelIconFontSize} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1, overflow: 'auto' }}>
                                    {loadingReasignados ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : enviosReasignados.length === 0 ? (
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay envíos reasignados a esta sucursal
                                            </Typography>
                                        </Box>
                                    ) : enviosReasignadosFiltrados.length === 0 ? (
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay envíos que coincidan con el filtro
                                            </Typography>
                                        </Box>
                                    ) : (
                                        renderListaEnvios({
                                            lista: enviosReasignadosFiltrados,
                                            seleccionados: enviosReasignadosSeleccionados,
                                            onToggleSeleccionado: handleToggleEnvioReasignadoSeleccionado,
                                            permitirSeleccionMapa: false,
                                            mostrarOrigen: true,
                                        })
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                        </Box>
                        <Box sx={getPanelSlotSx(PANEL_ENVIOS_HIJOS_REASIGNADOS, panelIzquierdo)} aria-hidden={panelIzquierdo !== PANEL_ENVIOS_HIJOS_REASIGNADOS}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                            <Paper elevation={0} sx={panelPaperSx}>
                                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" component="h2">
                                            Enviados ({filtroEnviosHijosReasignados ? `${enviosHijosReasignadosFiltrados.length}/${enviosHijosReasignados.length}` : enviosHijosReasignados.length})
                                        </Typography>
                                        <PanelIzquierdoNav panelActivo={panelIzquierdo} onCambiarPanel={irPanelIzquierdo} />
                                    </Box>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Cliente"
                                        value={filtroEnviosHijosReasignados}
                                        onChange={(e) => setFiltroEnviosHijosReasignados(e.target.value)}
                                        sx={{ mt: 1.5 }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                            endAdornment: filtroEnviosHijosReasignados ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="medium"
                                                        aria-label="Limpiar filtro"
                                                        onClick={() => setFiltroEnviosHijosReasignados('')}
                                                        edge="end"
                                                        sx={panelIconButtonSx}
                                                    >
                                                        <ClearIcon fontSize={panelIconFontSize} />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null,
                                        }}
                                    />
                                    {enviosHijosGestionablesFiltrados.length > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5, ml: -1, mr: -0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={todosHijosFiltradosSeleccionados}
                                                    indeterminate={!todosHijosFiltradosSeleccionados && algunosHijosFiltradosSeleccionados}
                                                    onChange={handleToggleTodosHijosFiltrados}
                                                    disabled={enviosHijosGestionablesFiltrados.length === 0}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Seleccionar sin asignar
                                                </Typography>
                                            </Box>
                                            <Tooltip title="Asignar a embarque desde sucursal origen">
                                                <span>
                                                    <IconButton
                                                        size="medium"
                                                        color="primary"
                                                        sx={panelIconButtonSx}
                                                        onClick={() => handleAbrirAsignacionTotal(PANEL_ENVIOS_HIJOS_REASIGNADOS)}
                                                        disabled={cantidadHijosReasignadosSeleccionados === 0}
                                                    >
                                                        <LocalShippingIcon fontSize={panelIconFontSize} />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1, overflow: 'auto' }}>
                                    {loadingHijosReasignados ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : enviosHijosReasignados.length === 0 ? (
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay envíos derivados enviados a otra sucursal
                                            </Typography>
                                        </Box>
                                    ) : enviosHijosReasignadosFiltrados.length === 0 ? (
                                        <Box sx={{ p: 2, textAlign: 'center' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay envíos que coincidan con el filtro
                                            </Typography>
                                        </Box>
                                    ) : (
                                        renderListaEnvios({
                                            lista: enviosHijosReasignadosFiltrados,
                                            seleccionados: enviosHijosReasignadosSeleccionados,
                                            onToggleSeleccionado: handleToggleEnvioHijoReasignadoSeleccionado,
                                            permitirSeleccionMapa: true,
                                            variante: 'hijos_salida',
                                        })
                                    )}
                                </Box>
                            </Paper>
                        </Box>
                        </Box>
                    </Box>
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
                        <Box
                            sx={{
                                p: 1,
                                height: '100%',
                                boxSizing: 'border-box',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: { xs: 2, md: 4 },
                            }}
                        >
                            <Tooltip title="Buscador de envío">
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                    <IconButton
                                        size="medium"
                                        color="primary"
                                        sx={panelIconButtonSx}
                                        onClick={() => setOpenDialogBuscador(true)}
                                        aria-label="Buscador de envío"
                                    >
                                        <TroubleshootIcon fontSize={panelIconFontSize} />
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        Buscador
                                    </Typography>
                                </Box>
                            </Tooltip>
                            <Tooltip title="Mantenimiento de entrega">
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                    <IconButton
                                        size="medium"
                                        color="secondary"
                                        sx={panelIconButtonSx}
                                        onClick={() => setOpenDialogMantenimientoEntrega(true)}
                                        aria-label="Mantenimiento de entrega"
                                    >
                                        <ManageHistoryIcon fontSize={panelIconFontSize} />
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        Mant. entrega
                                    </Typography>
                                </Box>
                            </Tooltip>
                            <Tooltip title="Seguimiento de envío">
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
                                    <IconButton
                                        size="medium"
                                        color="info"
                                        sx={panelIconButtonSx}
                                        onClick={() => setOpenDialogSeguimientoEnvio(true)}
                                        aria-label="Seguimiento de envío"
                                    >
                                        <MonitorHeartIcon fontSize={panelIconFontSize} />
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        Seguimiento
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                    </Paper>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={panelViewportSx}>
                        <Box sx={getPanelSlotSx(PANEL_EMBARQUES, panelDerecho)} aria-hidden={panelDerecho !== PANEL_EMBARQUES}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" component="h2">
                                    Embarques ({embarques.length})
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Tooltip title="Crear nuevo embarque">
                                        <IconButton
                                            size="medium"
                                            color="primary"
                                            sx={panelIconButtonSx}
                                            onClick={() => setOpenDialogCreateEmbarque(true)}
                                        >
                                            <AddIcon fontSize={panelIconFontSize} />
                                        </IconButton>
                                    </Tooltip>
                                    <PanelDerechoNav panelActivo={panelDerecho} onCambiarPanel={irPanelDerecho} />
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
                                                        sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, ml: 1 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {embarque.partidas && embarque.partidas.length > 0 ? (
                                                            <>
                                                                <Tooltip title="Dar salida">
                                                                    <IconButton
                                                                        size="medium"
                                                                        color="success"
                                                                        sx={panelIconButtonSx}
                                                                        onClick={() => registrarSalida(embarque)}
                                                                    >
                                                                        <FlightTakeoffIcon fontSize={panelIconFontSize} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Imprimir">
                                                                    <IconButton
                                                                        size="medium"
                                                                        color="secondary"
                                                                        sx={panelIconButtonSx}
                                                                        onClick={() => imprimirAsignacion(embarque)}
                                                                    >
                                                                        <PrintIcon fontSize={panelIconFontSize} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Ver ruta">
                                                                    <IconButton
                                                                        size="medium"
                                                                        color="success"
                                                                        sx={panelIconButtonSx}
                                                                        onClick={() => verRuta(embarque)}
                                                                    >
                                                                        <RouteIcon fontSize={panelIconFontSize} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <Tooltip title="Eliminar embarque">
                                                                <IconButton
                                                                    size="medium"
                                                                    color="error"
                                                                    sx={panelIconButtonSx}
                                                                    onClick={() => borrarEmbarque(embarque)}
                                                                >
                                                                    <DeleteForeverIcon fontSize={panelIconFontSize} />
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

                        <Box sx={getPanelSlotSx(PANEL_TRANSITO, panelDerecho)} aria-hidden={panelDerecho !== PANEL_TRANSITO}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" component="h2">
                                    Tránsito ({embarquesTransito.length})
                                </Typography>
                                <PanelDerechoNav panelActivo={panelDerecho} onCambiarPanel={irPanelDerecho} />
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
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, ml: 1 }}>
                                                        {!(embarque.partidas?.length > 0) ? (
                                                            <Tooltip title="Eliminar embarque">
                                                                <IconButton
                                                                    size="medium"
                                                                    color="error"
                                                                    sx={panelIconButtonSx}
                                                                    onClick={() => {
                                                                        if (embarqueDetalleTransito?.id === embarque.id) {
                                                                            handleCerrarDetalleTransito();
                                                                        }
                                                                        borrarEmbarque(embarque);
                                                                    }}
                                                                >
                                                                    <DeleteForeverIcon fontSize={panelIconFontSize} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        ) : (
                                                            <>
                                                                <Tooltip title="Registrar regreso">
                                                                    <IconButton
                                                                        size="medium"
                                                                        color="success"
                                                                        sx={panelIconButtonSx}
                                                                        onClick={() => registrarRegreso(embarque)}
                                                                    >
                                                                        <FlightLandIcon fontSize={panelIconFontSize} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Ver envíos">
                                                                    <IconButton
                                                                        size="medium"
                                                                        color="info"
                                                                        sx={panelIconButtonSx}
                                                                        onClick={() => handleAbrirDetalleTransito(embarque)}
                                                                    >
                                                                        <InfoOutlinedIcon fontSize={panelIconFontSize} />
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
                        </Box>

                        <Box sx={getPanelSlotSx(PANEL_REGRESOS, panelDerecho)} aria-hidden={panelDerecho !== PANEL_REGRESOS}>
                        <Box sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}>
                        <Paper elevation={0} sx={panelPaperSx}>
                            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" component="h2">
                                    Regresos ({embarquesRegresos.length})
                                </Typography>
                                <PanelDerechoNav panelActivo={panelDerecho} onCambiarPanel={irPanelDerecho} />
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
                                                            size="medium"
                                                            color="secondary"
                                                            onClick={() => imprimirRegreso(embarque)}
                                                            sx={{ ...panelIconButtonSx, ml: 1 }}
                                                        >
                                                            <PrintIcon fontSize={panelIconFontSize} />
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
        {openDialogSucursalEntrega && (
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 13000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    p: 2,
                }}
                onClick={handleCerrarDialogSucursalEntrega}
            >
                <Paper
                    elevation={8}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        width: '100%',
                        maxWidth: 520,
                        maxHeight: '85vh',
                        overflow: 'auto',
                        p: 2.5,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Reasignar partidas
                    </Typography>
                    {envioSucursalEntrega?.documento && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Documento: {envioSucursalEntrega.documento}
                        </Typography>
                    )}
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id="sucursal-entrega-label">Sucursal destino</InputLabel>
                        <Select
                            labelId="sucursal-entrega-label"
                            label="Sucursal destino"
                            value={sucursalEntregaSeleccionada}
                            onChange={(e) => setSucursalEntregaSeleccionada(e.target.value)}
                            MenuProps={{
                                disablePortal: false,
                                sx: { zIndex: 14000 },
                                style: { zIndex: 14000 },
                            }}
                        >
                            {(sucursales || [])
                                .filter((suc) => suc.nombre !== envioSucursalEntrega?.sucursal)
                                .map((suc) => (
                                <MenuItem key={suc.nombre} value={suc.nombre}>
                                    {suc.nombre}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    {envioSucursalEntrega?.sucursal && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            Sucursal origen: {envioSucursalEntrega.sucursal}
                        </Typography>
                    )}
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Partidas a reasignar
                    </Typography>
                    {loadingPartidasReasignacion ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress size={28} />
                        </Box>
                    ) : partidasReasignacion.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            No hay partidas disponibles para reasignar
                        </Typography>
                    ) : (
                        <List dense disablePadding sx={{ mb: 2, maxHeight: 240, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                            {partidasReasignacion.map((partida) => (
                                <ListItem
                                    key={partida.id}
                                    dense
                                    sx={{
                                        py: 0.5,
                                        opacity: partida.elegible ? 1 : 0.55,
                                    }}
                                >
                                    <Checkbox
                                        size="small"
                                        checked={Boolean(partidasReasignacionSeleccionadas[partida.id])}
                                        disabled={!partida.elegible}
                                        onChange={() => handleTogglePartidaReasignacion(partida.id)}
                                        sx={{ p: 0.5, mr: 1 }}
                                    />
                                    <ListItemText
                                        primary={`${partida.clave} — ${partida.me_descripcion}`}
                                        secondary={
                                            partida.elegible
                                                ? `Cantidad: ${partida.me_cantidad}`
                                                : partida.sucursal_reasignacion
                                                    ? `Reasignada a ${partida.sucursal_reasignacion}`
                                                    : partida.motivo_no_elegible || 'No disponible'
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2.5 }}>
                        <Button onClick={handleCerrarDialogSucursalEntrega} disabled={guardandoSucursalEntrega}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGuardarSucursalEntrega}
                            disabled={
                                !sucursalEntregaSeleccionada ||
                                guardandoSucursalEntrega ||
                                loadingPartidasReasignacion ||
                                cantidadPartidasReasignacionSeleccionadas === 0
                            }
                        >
                            {guardandoSucursalEntrega ? 'Guardando...' : 'Reasignar'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        )}
    </Box>
        {openDialogReasignarHijo && (
            <Box
                sx={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: overlayZIndex,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    p: 2,
                }}
                onClick={handleCerrarDialogReasignarHijo}
            >
                <Paper
                    elevation={8}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        width: '100%',
                        maxWidth: 480,
                        p: 2.5,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                        Cambiar sucursal destino
                    </Typography>
                    {envioHijoReasignar?.documento && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Envío derivado: {envioHijoReasignar.documento}
                            {envioHijoReasignar.envio_origen_documento
                                ? ` · Origen: ${envioHijoReasignar.envio_origen_documento}`
                                : ''}
                        </Typography>
                    )}
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id="sucursal-destino-hijo-label">Nueva sucursal destino</InputLabel>
                        <Select
                            labelId="sucursal-destino-hijo-label"
                            label="Nueva sucursal destino"
                            value={sucursalDestinoHijo}
                            onChange={(e) => setSucursalDestinoHijo(e.target.value)}
                            MenuProps={{
                                disablePortal: false,
                                sx: { zIndex: overlayZIndex + 1 },
                                style: { zIndex: overlayZIndex + 1 },
                            }}
                        >
                            {(sucursales || [])
                                .filter((suc) => suc.nombre !== envioHijoReasignar?.sucursal)
                                .map((suc) => (
                                    <MenuItem key={suc.nombre} value={suc.nombre}>
                                        {suc.nombre}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>
                    {envioHijoReasignar?.sucursal_entrega && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            Destino actual: {envioHijoReasignar.sucursal_entrega}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={handleCerrarDialogReasignarHijo} disabled={guardandoDestinoHijo}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGuardarDestinoHijo}
                            disabled={
                                !sucursalDestinoHijo ||
                                guardandoDestinoHijo ||
                                sucursalDestinoHijo === envioHijoReasignar?.sucursal_entrega
                            }
                        >
                            {guardandoDestinoHijo ? 'Guardando...' : 'Actualizar destino'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        )}
        <Dialog 
            open={openDialogAsignacion} 
            onClose={handleCerrarDialogAsignacion}
            fullWidth={false}
            maxWidth={false}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            PaperProps={{
                sx: {
                    width: '50rem',
                    maxWidth: '95vw',
                    height: '75vh',
                    minHeight: 480,
                    maxHeight: '85vh',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            {(envioParaAsignar || Object.keys(buscadorAsignacionSeleccion).length > 0) && (
                <AsignacionParcialForm 
                    rowSelected={
                        Object.keys(buscadorAsignacionSeleccion).length > 0
                            ? buscadorAsignacionSeleccion
                            : { [envioParaAsignar.id]: true }
                    }
                    onCloseDialog={handleCerrarDialogAsignacion} 
                    getData={handleRefresh}
                    isFullscreen={isFullscreen}
                    variant="geolocalizacion"
                    overlayZIndex={overlayZIndex}
                />
            )}
        </Dialog>
        <Dialog
            open={openDialogAsignacionTotal}
            onClose={() => setOpenDialogAsignacionTotal(false)}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: 480,
                    maxWidth: '95vw',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <TransportesEnviosPendientes
                variant="geolocalizacion"
                asignar={handleAsignacionTotal}
                onClose={() => setOpenDialogAsignacionTotal(false)}
            />
        </Dialog>
        <Dialog 
            open={showRuta} 
            onClose={() => {setShowRuta(false)}}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            fullWidth
            maxWidth="xl"
            PaperProps={{
                sx: {
                    width: '92%',
                    maxWidth: '1200px',
                    height: '72vh',
                    minHeight: 480,
                    maxHeight: '85vh',
                    m: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <RutaEmbarqueForm ruta={ruta} setShowRuta={setShowRuta} variant="geolocalizacion" />
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
            fullWidth
            maxWidth="lg"
            PaperProps={{
                sx: {
                    width: '100%',
                    maxWidth: '56rem',
                    height: '80vh',
                    minHeight: 520,
                    maxHeight: '90vh',
                    m: 2,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            sx={dialogZIndexSx}
        >
            {embarqueSeleccionado && (
                <EmbarqueLocalizacionForm 
                    embarque={embarqueSeleccionado}
                    setOpenDialog={setOpenDialogEmbarque} 
                    getData={handleRefresh}
                    isFullscreen={isFullscreen}
                    handleRefresh={handleRefresh}
                    overlayZIndex={overlayZIndex}
                />
            )}
        </Dialog>
        <Dialog 
            open={openDialogCreateEmbarque} 
            onClose={() => {setOpenDialogCreateEmbarque(false)}}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: 420,
                    maxWidth: '95vw',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <CreateEmbarqueForm 
                setOpenDialog={setOpenDialogCreateEmbarque} 
                getData={handleRefresh}
                variant="geolocalizacion"
                isFullscreen={isFullscreen}
                overlayZIndex={overlayZIndex}
            />
        </Dialog>
        <Dialog
            open={openDialogBuscador}
            onClose={() => setOpenDialogBuscador(false)}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: 420,
                    maxWidth: '95vw',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <BuscadorEnvioGeolocalizacionPanel
                overlayZIndex={overlayZIndex}
                onClose={() => setOpenDialogBuscador(false)}
                onEnvioSeleccionadoMapa={handleBuscadorEnvioSeleccionadoMapa}
                onAsignacionParcial={handleBuscadorAsignacionParcial}
                onAsignacionTotal={handleBuscadorAsignacionTotal}
            />
        </Dialog>
        <Dialog
            open={openDialogMantenimientoEntrega}
            onClose={() => setOpenDialogMantenimientoEntrega(false)}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: 420,
                    maxWidth: '95vw',
                    height: 520,
                    minHeight: 520,
                    maxHeight: 520,
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <MantenimientoEntrega
                setOpenDialog={setOpenDialogMantenimientoEntrega}
                onSaved={handleRefresh}
            />
        </Dialog>
        <Dialog
            open={openDialogSeguimientoEnvio}
            onClose={() => setOpenDialogSeguimientoEnvio(false)}
            disablePortal={false}
            container={isFullscreen ? document.body : undefined}
            maxWidth={false}
            PaperProps={{
                sx: {
                    width: 600,
                    maxWidth: '95vw',
                    height: 520,
                    maxHeight: '85vh',
                    m: 2,
                    overflow: 'hidden',
                },
            }}
            sx={dialogZIndexSx}
        >
            <SeguimientoEnvio
                setOpenDialogSeguimiento={setOpenDialogSeguimientoEnvio}
                overlayZIndex={overlayZIndex}
            />
        </Dialog>
    </>
    );
}

export default GeolocalizacionEnvios;

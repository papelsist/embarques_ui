import React, {useContext, useEffect, useState, useMemo} from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, Divider, Grid,Button, Tooltip, IconButton, TextField, Dialog } from '@mui/material';
import DirectionsIcon from '@mui/icons-material/Directions';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import { objectIsEmpty } from '../../../../utils/embarqueUtils';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { formatDate } from '../../../../utils/dateUtils';
import Swal from 'sweetalert2';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';


import '../EnviosParciales.css';
import DireccionesEntrega from './DireccionesEntrega';
import DireccionInstruccionClave from './DireccionInstruccionClave';
import DireccionForm from '../../../../components/direccion_form/DireccionForm';
import DireccionClave from './DireccionClave';

const InstruccionEntregaParcial = ({rowSelected, onCloseDialog, getData}) => {


    const {auth,sucursal} = useContext(ContextEmbarques);
    const [envio, setEnvio] = useState(null);
    const [detalles, setDetalles] = useState([])
    const [comentario, setComentario] = useState('');
    const [openDialogDireccion, setOpenDialogDireccion] = useState(false);
    const [direccion, setDireccion] = useState(null);
    const [openDialogClave, setOpenDialogClave] = useState(false);
    const [openDialogDir, setOpenDialogDir] = useState(false);
    const [openDialogDirec, setOpenDialogDirec] = useState(false);
    const [dir, setDir] = useState(null);
    const [fechaEntrega, setFechaEntrega] = useState(dayjs());
    const [message, setMessage] = useState(null);
 


    const getEnvio = async ()=>{
        
        const envioId = Object.keys(rowSelected)[0]
        const url = `${apiUrl.url}embarques/envios_parciales/${envioId}/`
        const resp = await axios.get(url,{
            headers: { Authorization: `Bearer ${auth.access}` }
        })
        setEnvio(resp.data)
        if(resp.data.detalles){
            setDetalles(resp.data.detalles)
        }
       
    
    }


    const handleSaveCell = (cell, value) => {
        let detallesTemp = detalles
        let valor = Number(value)
        const saldo = Number(detallesTemp[cell.row.index]['saldo'])
        if (valor > saldo){
            valor = saldo
        }
        detallesTemp[cell.row.index]['cantidad'] = valor
        detallesTemp[cell.row.index]['pendiente'] = saldo - valor
        setDetalles([...detallesTemp])  
    };


      const handleComentario = (e)=>{
        setComentario(e.target.value);
    }

    const handleMessage = (mensaje) => {
        setMessage(mensaje);
        setTimeout(() => {
            setMessage(null);
        }, 3000);

    }

    const handleSalvar = async() =>{
        const partidas = detalles.filter((detalle)=> detalle.cantidad )
        const url = `${apiUrl.url}embarques/crear_preentrega/`
        
        if(partidas.length === 0){
            handleMessage("No se ha seleccionado ninguna partida");
            return;
        }

        if(!direccion){
            handleMessage("No se ha seleccionado ninguna direccion");
            return;

        }
        const data = {
            envio_id: envio.id,
            comentario: comentario,
            detalles: partidas,
            direccion_entrega_id: direccion.id,
            fecha_entrega: fechaEntrega.format('YYYY-MM-DD')

        }

        console.log(data);
        const resp = await axios.post(
                url,
                data,
                {
                    headers: { Authorization: `Bearer ${auth.access}` }
                }
            )
        if(resp.status === 200){
            onCloseDialog();
            Swal.fire(`Se ha salvado la instruccion correctamente`);
        } 
    }

    const agregarDireccionDestinatario = (direc) => {
        console.log(direc);
        setOpenDialogDir(false);
        setDir(direc);
        setOpenDialogDirec(true);
    }

    useEffect(() => {
        getEnvio()
    }, []);

    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'clave', 
            header: 'Clave',
            size:80,
            enableEditing: row => false
        },
        {
            accessorKey: 'me_descripcion',
            header: 'Descripcion',
            size:200,
            enableEditing: row => false
        },
        {
            accessorKey: 'me_cantidad',
            header: 'Cantidad',
            size:80,
            enableEditing: row => false
        },
        {
            accessorKey: 'saldo',
            header: 'Saldo',
            size:80,
            enableEditing: row => false
            
        },
        {
            
            accessorKey: 'cantidad',
            header: 'Enviar',
            id: 'cantidad',
            size:80,
            enableEditing: row => row.original.saldo > 0
          },
        {
            accessorKey: 'pendiente',
            header: 'Pendiente',
            size:80,
            enableEditing: row => false
        }
          

    ]);

    return (
        <div className='asignacion_parcial_container'>
            <Box padding={2}>
                <Typography variant="h6" component="div">
                    Asignacion Parcial
                </Typography>
            </Box>
            <Divider />
            <Box sx={{width:800, height:650, padding:1}}>
                <Box>
                    <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>    
                        {
                                envio &&
                                (
                                <>
                                    <Grid item xs={12}>
                                        <Typography  align='center'  >{envio.destinatario}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography  align='center' > Docto: {envio.documento}</Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography  align='center' > Fecha: {formatDate(envio.fecha_documento)}</Typography>
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Typography  align='center' > Tipo: {envio.tipo_documento}</Typography>
                                    </Grid>
                                    <Grid  item xs={2} >
                                            <Tooltip title="Direccion">
                                            <IconButton color='primary' onClick={()=>{setOpenDialogDireccion(true)}}>
                                                <DirectionsIcon />
                                            </IconButton>
                                        </Tooltip>   
                                    </Grid>
                                    <Grid  item xs={12} display="flex" justifyContent="center" alignItems="center"  >
                                        {
                                            direccion &&(
                                                <Typography >
                                                    Enviar a: {direccion.calle} Ext. {direccion.numero_exterior} {direccion.numero_interior ? `Int. ${direccion.numero_interior}` :''} Col. {direccion.colonia} Mun. {direccion.municipio} Edo. {direccion.estado} C.P.{direccion.codigo_postal}
                                                </Typography>
                                            )
                                        }
                                    </Grid>
                                    
                                </>
                                )
                        }
                    </Grid>
                    <Divider sx={{marginTop:1}} />
                    <Box sx={{height:'80%'}}>
                        {envio?.detalles &&
                            <Box component={"div"} sx={{display:'flex', flexDirection:"column",justifyContent:"space-between", margin:1}}>
                                    <Box component={"div"}>
                                    <MaterialReactTable
                                        columns={columns}   
                                        data = {detalles}
                                        getRowId={(originalRow) => originalRow.id}
                                        initialState={{ 
                                            density: 'compact',
                                            size:'small',
                                            
                                            }}
                                    
                                        enablePagination={false}
                                        enableRowVirtualization 
                                        enableTopToolbar={false}
                                        enableBottomToolbar={false}
                                        editingMode="cell"  
                                        enableEditing
                                        muiTableBodyCellEditTextFieldProps={({
                                            cell
                                        }) => ({
                                            onBlur: event => {
                                                if(cell.column.id === 'cantidad'){
                                                    handleSaveCell(cell, event.target.value);
                                                }
                                            }
                                        })}
                                        muiTableContainerProps={{ sx: { maxHeight: 420 , minHeight:420 } }}
                                        localization={MRT_Localization_ES}
                                    />
                                        
                                    </Box>
                            </Box>
                        }
                    </Box>
                    {
                        envio &&
                        (
                            <>
                                <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                                    {
                                        envio &&
                                        (   
                                            <>
                                                <Grid  item xs={6}  >
                                                    <TextField  variant="standard" name = "comentario" label = "Comentario" fullWidth onChange={handleComentario} />
                                                </Grid>
                                                <Grid  item xs={6}  display={'flex'} justifyContent={'center'}>
                                                <DatePicker   
                                                    label="Fecha Entrega"
                                                    value={fechaEntrega} 
                                                    onChange={(fecha)=>{setFechaEntrega(fecha)}} 
                                                    slotProps={{ textField: { variant: 'standard' } }}
                                                />
                                                </Grid>
                                            </>
                                        )
                                    }
                                </Grid>
                                </>
                        )
                    }
                </Box>
                <Box sx={{margin:2, display:'flex' ,alignItems:'center', justifyContent:'center'}}>
                    <Grid container spacing={1} display="flex" width={'100%'}  height={'100%'}>
                        <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                            <Button onClick={onCloseDialog}> Salir</Button>
                        </Grid>
                        <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                        <   Button  sx={{mr:8, ml:5 }}   onClick={handleSalvar}>Salvar</Button> 
                        </Grid> 
                        <Grid  item xs={4} display="flex" justifyContent="center" alignItems="center"  >
                                <Typography variant="h6" component="div" color='error' sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                                    {message ? message : ''}
                                </Typography>
                        </Grid> 
                    </Grid>
                </Box>
            </Box>
            <Dialog
                open={openDialogDireccion} onClose={()=>{setOpenDialogDireccion(false)}}  fullWidth={true}
                maxWidth={'md'}
                sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}
            >
                <DireccionesEntrega 
                    destinatario={envio?.destinatario} 
                    setOpenDialog={setOpenDialogDireccion} 
                    setDireccion={setDireccion} 
                    instruccion={envio?.instruccion} 
                    setOpenDialogClave={setOpenDialogClave}
                    setOpenDialogDir={setOpenDialogDir}
                />
            </Dialog>
            <Dialog
                open={openDialogClave} onClose={()=>{setOpenDialogClave(false)}}  fullWidth={true}
                maxWidth={'md'}
                sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}
            >
         
                <DireccionInstruccionClave 
                    destinatario={envio?.destinatario} 
                    setOpenDialog={setOpenDialogDireccion} 
                    setDireccion={setDireccion} 
                    instruccion={envio?.instruccion} 
                    setOpenDialogClave={setOpenDialogClave}
                    envio_id={envio?.id}
                /> 
            </Dialog>
            <Dialog
                open={openDialogDir} onClose={()=>{setOpenDialogDir(false)}}  fullWidth={true}
                maxWidth={'md'}
                sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}
            >
                <DireccionForm setDir={agregarDireccionDestinatario} setOpenDialog={setOpenDialogDir} /> 
            </Dialog>
            <Dialog
                open={openDialogDirec} onClose={()=>{setOpenDialogDirec(false)}}  fullWidth={true}
                maxWidth={'md'}
                sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}
            >
               
                <DireccionClave destinatario={envio?.destinatario} setOpenDialog={setOpenDialogDirec} direcc={dir} setDireccion={setDireccion} /> 
            </Dialog>
            
        </div>
    );
}

export default InstruccionEntregaParcial;

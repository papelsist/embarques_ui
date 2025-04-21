import React, {useState, useMemo, useRef, useContext } from 'react';
import { Box,IconButton,Tooltip} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import Dialog from '@mui/material/Dialog';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeriodoLabel from '../../../../components/periodo_date_picker/PeriodoLabel';
import AsignacionParcialForm from './AsignacionParcialForm';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PieChartIcon from '@mui/icons-material/PieChart';
import AnotacionesForm from '../../envios_pendientes/components/AnotacionesForm';
import InstruccionEntregaParcial from './InstruccionEntregaParcial';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import BuscadorEnvioParcial from '../../components/BuscadorEnvioParcial';

const EnviosParcialesTable = ({datos, getData,setDatos}) => {
    const [rowSelection, setRowSelection] = useState({});
    const [showDialog, setShowDialog] = useState(false);
    const tableInstanceRef = useRef(); 
    const [envio, setEnvio] = useState(null)
    const [showDialogTransporte, setShowDialogTransporte] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [showBuscador, setShowBuscador] = useState(false)

    const refrescar = ()=>{
        setDatos([])
        getData()
    }

    const onCloseDialog = ()=>{
        setShowDialog(false)
        setRowSelection({})
    }

const mostrarDialog =()=>{
    const rowSelection = tableInstanceRef.current.getState().rowSelection;
    setRowSelection(rowSelection)
    if (Object.keys(rowSelection).length !== 0)
        setShowDialog(true)
}

const verAnotaciones = (row)=>{
    setEnvio(row)
    setShowDialogTransporte(true)
}

const closeDialogTransporte = ()=>{
    setEnvio(null)
    setShowDialogTransporte(false)
}

const onOpenDialogInstruccion = ()=>{
    const rowSelection = tableInstanceRef.current.getState().rowSelection;
    setRowSelection(rowSelection)
    if (Object.keys(rowSelection).length !== 0)
        setOpenDialog(true)
}

const onCloseDialogInstruccion = ()=>{
    setEnvio(null)
    setOpenDialog(false)
    setRowSelection({})
}

const onOpenBuscador = () => {  
    setShowBuscador(true);
}

const onCloseBuscador = () => {
    setShowBuscador(false);
}

const columns=useMemo(()=>[
    { 
        accessorKey: 'documento', 
        header: 'Documento',
        size:80,
    },
    {   accessorKey:'fecha_documento',
        header:'Fecha',
        size:90,
        Cell:({cell})=>(new Date(cell.getValue()).toLocaleDateString())
    },
    {   accessorKey:'instruccion.fecha_de_entrega',
        header:'Entrega',
        size:90,
        Cell:({cell})=>(new Date(cell.getValue()).toLocaleDateString())
    },
    { 
        accessorKey: 'destinatario', 
        header: 'Destinatario', 
        size:200,
    },
    { 
        accessorKey: 'kilos', 
        header: 'Kilos',
        size:80,
    },
    { 
        accessorKey: 'instruccion.direccion_codigo_postal',
        header: 'Direccion',
        Cell: ({ row }) => {

            let direccion = ''
                let instruccion = row.original.instruccion;
                if (row.original.instruccion.sx_transporte){
                    instruccion = row.original.instruccion.sx_transporte
                    direccion = `${row.original.instruccion.sx_transporte.nombre} - `
                }
                direccion +=  `${instruccion.direccion_calle} ${ instruccion.direccion_numero_exterior} C.P. ${instruccion.direccion_codigo_postal} Mun.${instruccion.direccion_municipio}`;
                return   <Box
                component="span"
                sx={(theme) => ({
                  color:
                  row.original.instruccion.sx_transporte
                      && theme.palette.error.dark,
                })}
              >
                {direccion}
              </Box>;
                
        },
        size:300,
    },
    { 
        accessorKey: 'instruccion.sector', 
        header: 'Sector',
        size:80,
    },
    { 
        accessorKey: 'instruccion.distancia', 
        header: 'Distancia',
        size:80,
    },

])

    return (
        <div className='contenedor-pendientes-table '>
        <MaterialReactTable
            columns={columns}   
            data = {datos}
            enableMultiRowSelection = {false}
            enableRowSelection
            onRowSelectionChange={setRowSelection}
            positionToolbarAlertBanner="none"
            state={{ rowSelection }}
            getRowId={(originalRow) => originalRow.id}
            muiTableContainerProps={{ sx: { maxHeight: '80vh' , minHeight: '80vh'} }}
            initialState={{ 
                density: 'compact',
                size:'small',
                
                }}
            enableColumnOrdering
            enablePagination={false}
            enableRowVirtualization 
            enableBottomToolbar={false}
            localization={MRT_Localization_ES}
            renderTopToolbarCustomActions={({ table }) => (
                <div className='pendientes-header-container'>
                    <Box>
                        Envios Parciales
                    </Box>
                    <PeriodoLabel getData={refrescar}/>
                    <Box>
                        <Tooltip title="Refrescar">
                            <IconButton onClick={refrescar}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Asignar">
                            <IconButton onClick={mostrarDialog}>
                                <LocalShippingIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Instruccion">
                            <IconButton onClick={onOpenDialogInstruccion}>
                                <PieChartIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Busqueda ">
                            <IconButton onClick={onOpenBuscador}>
                                <TroubleshootIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </div>
                
            )} 
            enableRowActions 
            enableColumnResizing
            positionActionsColumn="last"
            renderRowActions={({
                row
            }) => <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '0.5rem',
            
            }}>
                {row.original.anotaciones.length >0 && 
                    <>
                       <Tooltip title="Ver Anotaciones">
                        <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{verAnotaciones(row.original)}} >
                                <EditNoteIcon />
                            </IconButton>
                       </Tooltip>
                       
                    </>
                    
                        
                    } 
                </div>}  
            tableInstanceRef={tableInstanceRef}
        />
        <Dialog 
        open={showDialog} 
        onClose={onCloseDialog}
        fullWidth={true}
        maxWidth={'md'}
        maxHeight={'md'}
        sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh'}}
        >
           <AsignacionParcialForm rowSelected={rowSelection} onCloseDialog={onCloseDialog} getData={getData} />
        </Dialog>
        <Dialog
                open={showDialogTransporte} 
                onClose={closeDialogTransporte}
                
                maxWidth={'md'}
             >
                {
                    envio && 
                    <AnotacionesForm row={envio} setOpenDialog={setShowDialogTransporte}/>
                }
        </Dialog>
        <Dialog 
        open={openDialog} 
        onClose={onCloseDialogInstruccion}
        fullWidth={true}
        maxWidth={'md'}
        maxHeight={'md'}
        sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh'}}
        >
            <InstruccionEntregaParcial rowSelected={rowSelection} onCloseDialog={onCloseDialogInstruccion} getData={getData} />
        </Dialog>
        <Dialog 
            open={showBuscador} 
            onClose={onCloseBuscador}
            fullWidth={true}
            maxWidth={'md'}
            maxHeight={'md'}
            sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh'}}
        >
            {/* <BuscadorEnvioParcial  onCloseDialog={onCloseBuscador} onOpenDialog={onOpenDialog} setRowSelection={setRowSelection} setShowDialog={setShowDialog}  /> */}
            <BuscadorEnvioParcial onCloseDialog={onCloseBuscador} setRowSelection={setRowSelection} mostrarDialog={mostrarDialog} onOpenDialogInstruccion={onOpenDialogInstruccion}   />
            
        </Dialog>
        </div>
    );
}

export default EnviosParcialesTable;

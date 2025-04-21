import React, {useState, useMemo, useRef, useContext } from 'react';
import { Box, Button,IconButton,Tooltip} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import RefreshIcon from '@mui/icons-material/Refresh';
import Dialog from '@mui/material/Dialog';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeriodoLabel from '../../../../components/periodo_date_picker/PeriodoLabel';
import InstruccionEntregaForm from './InstruccionEntregaForm';
import { changeDateFormat } from '../../../../utils/dateUtils';

const InstruccionEntregaTable = ({datos,getData,setDatos}) => {

    const [rowSelection, setRowSelection] = useState({});
    const [showDialog, setShowDialog] = useState(false);
    const tableInstanceRef = useRef(); 


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

    const columns=useMemo(()=>[
        {
            accessorKey:'folio',
            header:'Folio',
            size:50,
        },
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
        {   accessorKey:'fecha_entrega',
            header:'Entrega',
            size:90,
            Cell:({cell})=>(changeDateFormat((cell.getValue())))
            
                
        },
        { 
            accessorKey: 'destinatario', 
            header: 'Destinatario', 
            size:200,
        },
        { 
            accessorKey: 'direccion_entrega',
            header: 'Direccion',
            Cell: ({ row }) => {
    
                let direccion = ''
                    
                    if(row.original.direccion_entrega){
                        let instruccion = row.original.direccion_entrega;
                        direccion +=  `${instruccion.calle} ${ instruccion.numero_exterior} C.P. ${instruccion.codigo_postal} Mun.${instruccion.municipio}`;
                    }
                    return   <Box
                    component="span"
                    sx={(theme) => ({
                     
                    })}
                  >
                    {direccion}
                  </Box>;
                    
            },
            size:200,
        },
    ]);

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
           <InstruccionEntregaForm rowSelected={rowSelection} onCloseDialog={onCloseDialog} getData={getData} />
        </Dialog>
      
        </div>
    );
}

export default InstruccionEntregaTable;

import React,{useMemo, useState} from 'react';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { IconButton, Tooltip, Dialog, Button, Box } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import { changeDate} from '../../../utils/dateUtils';
import PeriodoLabelWctx from '../../../components/periodo_label_wctx/PeriodoLabelWctx';
import IncidenciaForm from './IncidenciaForm'


const IncidenciasTable = ({periodo,setPeriodo,datos, getData}) => {

    const [showDialog, setShowDialog] = useState(false)
    const [incidenciaRow, setIncidenciaRow] = useState({})

    const handleCickRow = (row) =>{
        setIncidenciaRow(row)
        setShowDialog(true)
    }
  

    const columns=useMemo(()=>[
        { accessorKey: 'folio', header: 'Folio',
        size:100,
        Cell:({cell,row})=>(
          <Button  sx={{mr:8, ml:5 , fontSize:17, fontWeight: 400}} fullWidth onClick={()=>{handleCickRow(row.original)}}>
            {cell.getValue()}
        </Button>
        ) 
        }, 
        { accessorKey: 'fecha', header: 'Fecha',  Cell:({cell})=>(changeDate(cell.getValue()).toLocaleDateString())}, 
        { accessorKey: 'embarque', header: 'Embarque',size: 100}, 
        { accessorKey: 'operador', header:'Operador'},
        { accessorKey: 'destinatario', header: 'Destinatario'},
        { accessorKey: 'documento', header:'Documento', size: 150},
        { accessorKey: 'fecha_documento', header: 'Fecha Documento', Cell:({cell})=>(new Date(cell.getValue()).toLocaleDateString())},
        { accessorKey: 'comentario', header: 'Comentario'}, 
        { accessorKey: 'descripcion', header: 'Descripcion'}, 
        ]);

      const refrescar = ()=>{}

    return (
        <div className='contenedor-pendientes-table '>
            <MaterialReactTable
            columns={columns}
            data = {datos}
            localization={MRT_Localization_ES}
            enableColumnResizing
            muiTableContainerProps={{ sx: { maxHeight: '85vh' , minHeight: '100%'} }}
            initialState={{ 
              density: 'compact',
               size:'small',
               
            }} 
            enableColumnOrdering
            enablePagination={false}
            enableRowVirtualization 
            enableBottomToolbar={false}
            renderTopToolbarCustomActions={({ table }) => (
              <div className='transito-header-container'>
                  <Box>
                      Regresos
                  </Box>
                  <PeriodoLabelWctx periodo={periodo} setPeriodo={setPeriodo} />
                  <Tooltip title="Refrescar">
                  <IconButton onClick={refrescar}>
                      <RefreshIcon />
                  </IconButton>
                  </Tooltip>
              </div>
              
          )} 
            /* enableRowActions 
            positionActionsColumn="last"
            renderRowActions={({
                row
              }) => <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '0.5rem',
               
              }}>
                {
                <>
                   <Tooltip title="Imprimir">
                    <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{ }} >
                            <PrintIcon />
                        </IconButton>
                   </Tooltip>
                </>
                
                    
                } 
                </div>}  */
            />
            <Dialog 
                open={showDialog}
                onClose={()=>{setShowDialog(false)}}
                PaperProps={{
                    sx: {
                
                      maxWidth: "100rem",
                      maxHeight:"200rem"
                    },
                  }}
            >
              <IncidenciaForm incidenciaRow={incidenciaRow} setShowIncidencia={setShowDialog} />
            </Dialog>
        </div>
    );
}

export default IncidenciasTable;

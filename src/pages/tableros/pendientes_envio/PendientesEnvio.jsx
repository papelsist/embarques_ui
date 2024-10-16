import React, {useMemo} from 'react';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Typography } from '@mui/material';
import { formatDate, tiempoDesde, tiempoDesdeStr } from '../../../utils/dateUtils';

const PendientesEnvio = ({pendientesAsignacion}) => {
    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'documento', 
            header: 'Documento',
            size:20,
        },
        { 
            accessorKey: 'fecha_documento', 
            header: 'Fecha',
            size:20,
            Cell:({cell})=>{
                return formatDate(cell.getValue())
            }
        },
        { 
            accessorKey: 'destinatario', 
            header: 'Destinatario',
            size:50,
        },
        { 
            accessorKey: 'date_created', 
            header: 'Alta',
            size:20,
            Cell:({cell})=>{
                const tiempo = tiempoDesdeStr(cell.getValue());
                const {horas, minutos} = tiempoDesde(cell.getValue());
                return tiempo
            }
        },
        { 
            accessorKey: 'productos', 
            header: 'Productos',
            size:20,
            Cell:({cell,row})=>{
                const detalles = row.original.detalles;
                return detalles.length;
            }
        },
        { 
            accessorKey: 'cortes', 
            header: 'Cortes',
            size:20,
            Cell:({cell,row})=>{
                const detalles = row.original.detalles;
                const cortesDet  = detalles.reduce((acum, detalle)=> {
                    if (detalle.cortes !== null){
                        return acum += 1;
                    }
                }, 0);
                return cortesDet? cortesDet : 0;
            }
        },
        

        
    ]);
    return (
        <div className='tablero-container'>
            <MaterialReactTable
                columns={columns}   
                data = {pendientesAsignacion}
                enableRowOrdering = {false}
                getRowId={(originalRow) => originalRow.id}
                initialState={{ 
                    density: 'compact',
                    size:'small',
                    
                    }}
                enablePagination={false}
                enableRowVirtualization 
                enableTopToolbar={true}
                enableToolbarInternalActions={false}
                renderTopToolbarCustomActions={({ table }) => (
               
                    <Box sx={{display:'flex', justifyContent:'center', width:'100%', height:'100%' }} >
                       <Typography variant='h6' sx={{display:'flex', justifyContent:'center', width:'100%', height:'100%' }} >
                              Envíos Pendientes de Asignar
                        </Typography>
                    </Box>
                    
                    
                )} 
                enableBottomToolbar={false}
                localization={MRT_Localization_ES}
                /> 
        </div>
    );
}

export default PendientesEnvio;

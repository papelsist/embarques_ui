import React, {useMemo} from 'react';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Typography } from '@mui/material';
import { tiempoDesde, tiempoDesdeStr } from '../../../utils/dateUtils';
import FlagIcon from '@mui/icons-material/Flag';



const Disponibles = ({pendientesSalida}) => {
    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'documento', 
            header: 'Documento',
            size:20,
            enableEditing: row => false
        },
        { 
            accessorKey: 'operador.nombre', 
            header: 'Operador',
            size:50,
            enableEditing: row => false
        },
        { 
            accessorKey: 'date_created', 
            header: 'Alta',
            size:20,
            Cell:({cell})=>{
                const tiempo = tiempoDesdeStr(cell.getValue());
                const {horas, minutos} = tiempoDesde(cell.getValue());
                return (
                    <Box sx={{display:'flex'}} >
                        <Typography variant='body2' sx={{width:'12rem'}} >{tiempo}
                        </Typography>
                        <FlagIcon sx={{color: horas > 1 ? 'red' :  minutos > 30 ? 'orange' : 'green'}}/>
                    </Box>

                );
            }
        },
        { 
            accessorKey: 'comentario', 
            header: 'Comentario',
            size:50,
            enableEditing: row => false
        },
    ]);
    return (
        <div className='tablero-container'>
        <MaterialReactTable
            columns={columns}   
            data = {pendientesSalida}
            //enableRowSelection= {(row)=> row.original.saldo > 0}
            //enableMultiRowSelection
            //enableSelectAll = {false}
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
                          Transportes Disponibles
                    </Typography>
                </Box>
                
                
            )} 
            enableBottomToolbar={false}
            localization={MRT_Localization_ES}
            />
        
    </div>
    );
}

export default Disponibles;

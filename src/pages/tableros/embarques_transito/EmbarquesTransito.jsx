import React, {useEffect, useMemo} from 'react';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Typography } from '@mui/material';
import { tiempoDesde, tiempoDesdeStr } from '../../../utils/dateUtils';
import FlagIcon from '@mui/icons-material/Flag';

const EmbarquesTransito = ({embarquesTransito}) => {
    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'documento', 
            header: 'Documento',
            size:10,
        },
        { 
            accessorKey: 'operador.nombre', 
            header: 'Operador',
            size:10,
        },
        { 
            accessorKey: 'or_fecha_hora_salida', 
            header: 'Salida',
            size:20,
            Cell:({cell})=>{
                const tiempo = tiempoDesdeStr(cell.getValue());
                const {horas, minutos} = tiempoDesde(cell.getValue());
                return (
                    <Box sx={{display:'flex'}} >
                        <Typography variant='body2' sx={{width:'12rem'}} >{tiempo}
                        </Typography>
                        <FlagIcon sx={{color: horas > 3 ? 'red' :  horas > 1 ? 'orange' : 'green'}}/>
                    </Box>

                );
            }
        },
        {
            accessorKey: 'partidas_length',
            header: 'Facturas',
            size:10,
            Cell:({row})=>{
                const partidas = row.original.partidas.length;
                return partidas
            }
        },
        {
            accessorKey: 'pendientes',
            header: 'Pendientes',
            size:10,
            Cell:({row})=>{
                const partidas = row.original.partidas.filter(partida => !partida.recepcion).length;
                return partidas
            }
        },
    ]);


    return (
        <div className='tablero-container'>
        <MaterialReactTable
            columns={columns}   
            data = {embarquesTransito}
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
                          Embarques en Transito
                    </Typography>
                </Box>
                
                
            )} 
            enableBottomToolbar={false}
            localization={MRT_Localization_ES}
            />
        
    </div>
    );
}

export default EmbarquesTransito;

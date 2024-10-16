
import React, {useMemo} from 'react';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Typography } from '@mui/material';
import { tiempoDesde, tiempoDesdeStr,formatDate } from '../../../utils/dateUtils';



const EnviosParciales = ({enviosParciales}) => {
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
            accessorKey: 'cantidad', 
            header: 'Cantidad',
            size:10,
            Cell:({row})=>{
                const inicial = 0
                const cantidad = row.original.detalles.reduce(
                    (acum, part) => acum + Number(part.me_cantidad),
                    inicial,
                )
                return cantidad
              
            }   
        },
        { 
            accessorKey: 'saldo', 
            header: 'Saldo',
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
    ]);
    return (
        <div className='tablero-container'>
            <MaterialReactTable
                columns={columns}   
                data = {enviosParciales}
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
                              Envíos Parciales
                        </Typography>
                    </Box>
                    
                    
                )} 
                enableBottomToolbar={false}
                localization={MRT_Localization_ES}
                /> 
        </div>
    );
}

export default EnviosParciales;

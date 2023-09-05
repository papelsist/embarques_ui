import React,{useMemo} from 'react';
import { Box, Button} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';

import "./AsignacionesTable.css"




const AsignacionesTable = ({datos}) => {
    const navigate = useNavigate()
    const handleClickCell = (row) => {
        navigate(`create/${row.id}`)
    }
    const columns=useMemo(()=>[
        { 
            accessorKey: 'documento', 
            header: 'Documento',
          
            Cell: ({cell,row})=>(
             
                <Button  sx={{mr:8, ml:5 , fontSize:17, fontWeight: 400}} fullWidth onClick={()=>{handleClickCell(row.original)}}>
                    {cell.getValue()} 
                </Button>

            ), 
            muiTableBodyCellProps: {
                align: 'center'
            },
            muiTableHeadCellProps: {
                align: 'left'
            },
            size:110
        },
        { accessorKey: 'operador.nombre', header: 'Operador'}, 
        {   accessorKey:'fecha',
            header:'Fecha',
            Cell:({cell})=>(cell.getValue()) 
        },
        { accessorKey: 'comentario', header: 'Comentario'},
    ])
    return (
        <div className='contenedor-asignaciones-table' >
            <MaterialReactTable
                    columns={columns}
                    data = {datos}
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
                        <Box>
                            Embarques
                        </Box>
                    )} 
                    />   

        </div >
    );
}

export default AsignacionesTable;

import React, {useMemo, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button,IconButton,Tooltip} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PrintIcon from '@mui/icons-material/Print';
import { apiUrl } from '../../../../conf/axios_instance';
import { tiempoDesdeStr, tiempoEntreStr } from '../../../../utils/dateUtils';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';


import "./RegresosTable.css"

import PeriodoLabel from '../../../../components/periodo_date_picker/PeriodoLabel';



const RegresosTable = ({datos, getData}) => {

    const navigate = useNavigate()
    const {auth} = useContext(ContextEmbarques);


    const handleClickCell = (row) =>{
        navigate(`regresos_view/${row.id}`)
    }

    const imprimirRegreso = async(row) =>{
        const url = `${apiUrl.url}embarques/reporte_asignacion_embarque`
        const data = {embarqueId: row.id}
        const response = await axios.get(url,{params:data,
            headers: { Authorization: `Bearer ${auth.access}` },
            method: 'GET',
            responseType: 'blob' //Force to receive data in a Blob Format
            
        })
        const file = new Blob(
            [response.data], 
            {type: 'application/pdf'});
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL);
    }


    const refrescar = ()=>{
        getData()
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
        {   accessorKey:'or_fecha_hora_salida',
            header:'Salida',
        },
        {   accessorKey:'regreso',
            header:'Regreso',
        },
        {   accessorKey:'tiempo',
            header:'Tiempo',
            Cell:({cell,row})=>(tiempoEntreStr(row.original.or_fecha_hora_salida,row.original.regreso)) 
        },
        { accessorKey: 'comentario', header: 'Comentario'},

    ])
    return (
        <div className='contenedor-regresos-table' >
            {/* */}
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
                    <div className='transito-header-container'>
                        <Box>
                            Regresos
                        </Box>
                        <PeriodoLabel getData={refrescar}/>
                        <Tooltip title="Refrescar">
                        <IconButton onClick={refrescar}>
                            <RefreshIcon />
                        </IconButton>
                        </Tooltip>
                    </div>
                    
                )} 
                enableRowActions 
                positionActionsColumn="last"
                renderRowActions={({
                    row
                  }) => <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: '0.5rem',
                   
                  }}>
                    {row.original.partidas.length >0 && 
                    <>
                       <Tooltip title="Imprimir">
                        <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{  imprimirRegreso(row.original)}} >
                                <PrintIcon />
                            </IconButton>
                       </Tooltip>
                       
                    </>
                    
                        
                    }
                    </div>}  

            />
            
        </div>
    );
}

export default RegresosTable;

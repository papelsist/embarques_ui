import React, {useEffect, useState, useMemo, useRef, useContext } from 'react';
import { Box, Button,IconButton,Tooltip} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import MapIcon from '@mui/icons-material/Map';
import PublicIcon from '@mui/icons-material/Public';
import PeriodoLabel from '../../../../components/periodo_date_picker/PeriodoLabel';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import "./EnviosPendientesTable.css"

const EnviosPendientesTable = ({datos, getData,setDatos}) => {
    const navigate = useNavigate()
    const [rowSelection, setRowSelection] = useState({});
    const tableInstanceRef = useRef(); 
    const {auth, sucursal,setLoading} = useContext(ContextEmbarques);


    const columns=useMemo(()=>[
        { 
            accessorKey: 'documento', 
            header: 'Documento'
        },
        { 
            accessorKey: 'fecha_documento', 
            header: 'Fecha'
        },
        { 
            accessorKey: 'destinatario', 
            header: 'Destinatario'
        },
        { 
            accessorKey: 'kilos', 
            header: 'Kilos'
        }

    ])
    
    const refrescar = ()=>{
        setDatos([])
        getData()
    }

    const crearRuta = async ()=>{
            setLoading(true)
            const rowSelection = tableInstanceRef.current.getState().rowSelection;
            const envios_ids = Object.keys(rowSelection).join(",")
            console.log(envios_ids)
            try{
                const url = `${apiUrl.url}ruteo/sugerencia_ruta_envios`        
                const resp = await axios.get(url, 
                    {params:{envios:envios_ids},
                     headers: { Authorization: `Bearer ${auth.access}` }
                    })
                navigate("/embarques/ruteo" , { state: resp.data })
           
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
            }}
            
    }

 

    return (
        <div className='contenedor-pendientes-table '>
                        {/* */}
                        <MaterialReactTable
                columns={columns}
                data = {datos}
                enableRowSelection
                onRowSelectionChange={setRowSelection}
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
                    <div className='transito-header-container'>
                        <Box>
                            Envios Pendientes
                        </Box>
                        <PeriodoLabel getData={refrescar}/>
                        <Tooltip title="Refrescar">
                        <IconButton onClick={refrescar}>
                            <RefreshIcon />
                        </IconButton>
                        </Tooltip>
                        <IconButton onClick={crearRuta}>
                            <PublicIcon />
                        </IconButton>
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
                    {/* {row.original.partidas.length >0 && 
                    <>
                       <Tooltip title="Imprimir">
                        <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{ }} >
                                <PrintIcon />
                            </IconButton>
                       </Tooltip>
                       
                    </>
                    
                        
                    } */}
                    </div>}  
                tableInstanceRef={tableInstanceRef}
            />
        </div>
    );
}

export default EnviosPendientesTable;

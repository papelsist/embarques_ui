import React, {useContext, useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Button,IconButton,Tooltip,Dialog} from '@mui/material';
import { tiempoDesdeStr } from '../../../../utils/dateUtils';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RouteIcon from '@mui/icons-material/Route';
import Swal from 'sweetalert2'
import { apiUrl } from '../../../../conf/axios_instance';


import FlightLandIcon from '@mui/icons-material/FlightLand';

import './TransitoTable.css'
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import RutaEmbarqueForm from '../../asignaciones/components/ruta_embarque_form/RutaEmbarqueForm';

const TransitoTable = ({datos, getData}) => {

    const {auth} = useContext(ContextEmbarques);
    const [showRuta, setShowRuta] = useState(false)
    const [ruta,setRuta] = useState({})
    const navigate = useNavigate()

    const handleClickCell = (row) =>{
       navigate(`entregas/${row.id}`)
       
    }

    const borrarEmbarque =async (row) =>{
    
       /*   */
        Swal.fire({
            title: `Esta seguro de borrar Embarque:${row.documento} Op:${row.operador.nombre}?`,
            text: "Esta accion no se puede revertir!",
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar'
          }).then(async(result)=>{
            if (result.isConfirmed) {
                const url = `${apiUrl.url}embarques/borrar_embarque`
                const resp = await axios.post(url,row,{headers: { Authorization: `Bearer ${auth.access}` }})
                getData()
                if(resp.data.deleted >= 0){
                    Swal.fire(
                        `Eliminado!`,
                        'El embarque ha sido borrado!',
                      )
                }else {
                      Swal.fire(
                        `No se pudo eliminar!`,
                        'Hubo un error!',
                      )
                }
    
                
            }
          })
    }

    const verRuta = async (row) =>{
        const url = `${apiUrl.url}embarques/ruta_embarque/${row.id}`
        const res = await axios.get(url,{params:{embarqueId:row.id},
            headers: { Authorization: `Bearer ${auth.access}` }})

        const ruta_list = []
        console.log(res.data)
        for (let entrega of res.data.partidas) {
            ruta_list.push(entrega.envio)
        }
        setRuta(ruta_list)
        setShowRuta(true)
    }

    const refrescar = ()=>{
        getData()
    }

    const registrarRegreso = (row)=>{
        Swal.fire({
            title: `Regreso de Embarque: ${row.documento} de ${row.operador.nombre} `,
            text: "Registrar regreso ",
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
          }).then(async(result)=>{
                if(result.isConfirmed){
                    const url = `${apiUrl.url}embarques/registrar_regreso`
                    const res = await axios.post(url,row,{headers: { Authorization: `Bearer ${auth.access}` }})
                    if(res.data.actualizado){
                        getData() 
                    }else{
                        Swal.fire(
                            `Faltan envios por recibir!`,
                            'No se puede marcar regreso!',
                          
                        )
                    }
                   
                }
          })
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
            Cell:({cell})=>(tiempoDesdeStr(cell.getValue()))
        },
        { accessorKey: 'comentario', header: 'Comentario'},
    ])
    return (
        <div className='contenedor-transito-table'>
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
                            Embarques en Transito
                        </Box>
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
                    {!row.original.partidas.length >0 && 
                                <IconButton aria-label="delete" size="small" color="error"  onClick={()=>{borrarEmbarque(row.original)}}  >
                                    <DeleteForeverIcon />
                                </IconButton>
                    }
                    {row.original.partidas.length >0 && 
                    <>      
                         <Tooltip title="Regreso">
                        <IconButton aria-label="delete" size="small" color="success"  onClick={()=>{registrarRegreso(row.original)}}  >
                            <FlightLandIcon/>
                        </IconButton>
                        </Tooltip>
                        <IconButton aria-label="print_route" size="small" color="success"  onClick={()=>{verRuta(row.original)}}  >
                            <RouteIcon /> 
                        </IconButton>
                    </> 
                    }
                    </div>
                } 
                  
            />
            <Dialog 
                open={showRuta} 
                onClose={()=>{setShowRuta(false)}}
                PaperProps={{
                    sx: {
                      width: "100%",
                      maxWidth: "80rem",
                      height:"80%" ,
                      maxHeight:"70rem"
                    },
                  }}
            >
                <Box>
                   <RutaEmbarqueForm ruta={ruta} setShowRuta={setShowRuta} />
                </Box>            
            </Dialog>
            
        </div>
    );
}

export default TransitoTable;

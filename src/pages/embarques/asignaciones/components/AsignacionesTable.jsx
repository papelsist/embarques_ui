import React,{useContext, useMemo} from 'react';
import axios from 'axios';
import {apiUrl} from '../../../../conf/axios_instance';
import { Box, Button,IconButton,Tooltip} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import Swal from 'sweetalert2'


import "./AsignacionesTable.css"
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const AsignacionesTable = ({datos, getData}) => {
    const {auth} = useContext(ContextEmbarques);
    const navigate = useNavigate()
    const handleClickCell = (row) => {
        navigate(`create/${row.id}`)
    }
    const registrarSalida = (row) =>{
        const url = `${apiUrl.url}embarques/registrar_salida`
        Swal.fire({
            title: `Salida de Embarque: ${row.documento} de ${row.operador.nombre} `,
            text: "Registrar salida ",
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            cancelButtonText: 'Cancelar'
          }).then(async(result)=>{
                if(result.isConfirmed){
                    const res = await axios.post(url,row, {headers: { Authorization: `Bearer ${auth.access}` }})
                    getData()
                }
          })
    }
    const refrescar = ()=>{
        getData()
    }

    const imprimirAsignacion = async (row) =>{
        const url = `${apiUrl.url}embarques/reporte_asignacion`
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
                        <div className='asignaciones-header-container'>
                            <Box>
                                Embarques
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
                            <IconButton aria-label="delete" size="small" color="success"  onClick={()=>{ registrarSalida(row.original)}}   >
                                <FlightTakeoffIcon />
                            </IconButton>
                            <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{ imprimirAsignacion(row.original)}} >
                                <PrintIcon />
                            </IconButton>
                        </>
                        
                            
                        }
                        
                       
                        </div>} 
                    />   

        </div >
    );
}

export default AsignacionesTable;

import React,{useContext, useMemo,useState} from 'react';
import axios from 'axios';
import {apiUrl} from '../../../../conf/axios_instance';
import { Box, Button,IconButton,Tooltip,Dialog} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import RouteIcon from '@mui/icons-material/Route';
import Swal from 'sweetalert2'
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import RutaEmbarqueForm from './ruta_embarque_form/RutaEmbarqueForm';
import "./AsignacionesTable.css"


const AsignacionesTable = ({datos, getData}) => {

    const {auth} = useContext(ContextEmbarques);
    const navigate = useNavigate()
    const [showRuta, setShowRuta] = useState(false)
    const [ruta,setRuta] = useState({})

    const handleClickCell = (row) => {
        navigate(`create/${row.id}`)
    }


    const registrarSalida = (row) =>{

        let enCero = 0
        for (let partida of row.partidas) {
            console.log(partida)
            for (let detalle of partida.detalles) {
                console.log(detalle.cantidad);
                const cantidad = Number(detalle.cantidad)
                if(cantidad === 0){
                    enCero += 1
                }
            }   
        }

        if(enCero > 0){
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hay partidas con cantidad en cero!',
              })
              return
        }

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
                            <IconButton aria-label="print_route" size="small" color="success"  onClick={()=>{verRuta(row.original)}}  >
                            <RouteIcon /> 
                            </IconButton>
                        </>
                        
                            
                        }
                        </div>} 
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

        </div >
    );
}

export default AsignacionesTable;

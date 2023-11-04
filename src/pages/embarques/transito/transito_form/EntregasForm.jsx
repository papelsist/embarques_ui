import React, { useState,useMemo, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Divider,TextField,Grid, Typography, Button, Checkbox,FormControlLabel,Fab,Dialog,Paper,IconButton  } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';


import  { apiUrl }  from '../../../../conf/axios_instance'

import "./EntregasForm.css"
import { sortObjectsList } from '../../../../utils/embarqueUtils';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const EntregasForm = () => {
    const {auth} = useContext(ContextEmbarques);
    const navigate = useNavigate()
    const params = useParams()
    const [embarque, setEmbarque] = useState();
    const [entregas, setEntregas] = useState([]);

    const handleSalir =()=>{
        navigate("/embarques/transito")   
    } 

    const handleBorrar = (row)=>{
        Swal.fire({
            title: `Esta seguro de borrar ${row.documento} del Cte:${row.destinatario}?`,
            text: "Esta accion no se puede revertir!",
            
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar'
          }).then(async (result)=>{
            if (result.isConfirmed) {
                const url = `${apiUrl.url}embarques/eliminar_entrega`
                const resp = await axios.post(url, row,{headers: { Authorization: `Bearer ${auth.access}` }} )
                if(resp.data.deleted >= 0){
                    const found = entregas.find((item)=> item.entregaId === row.entregaId)
                    let entregasTemp = entregas.filter((item)=> item.entregaId != found.entregaId)
                    entregasTemp = sortObjectsList(entregasTemp,'entregaId')
                    setEntregas(entregasTemp)
                    Swal.fire(
                        `Eliminado!`,
                        'El envío ha sido borrado!',
                      
                      )

                }else{
                    Swal.fire(
                        `No se pudo eliminar!`,
                        'Hubo un error!',
                      
                    )
                }  
            }   
          })
       
    }

    const actualizarArribo= (row)=>{
        const found = entregas.find((item)=> item.entregaId === row.entregaId)
        found.arribo = new Date().toISOString().replace("Z","")
        let entregasTemp = entregas.filter((item)=> item.entregaId != found.entregaId)
        entregasTemp = [...entregasTemp,found]
        entregasTemp = sortObjectsList(entregasTemp,'entregaId')
        setEntregas(entregasTemp)
   
    }

    const actualizarRecepcion= (row)=>{
        if(row.arribo){
            const found = entregas.find((item)=> item.entregaId === row.entregaId)
            found.recepcion = new Date().toISOString().replace("Z","")
            let entregasTemp = entregas.filter((item)=> item.entregaId != found.entregaId)
            entregasTemp = [...entregasTemp,found]
            entregasTemp = sortObjectsList(entregasTemp,'entregaId')
            setEntregas(entregasTemp)
        }else{
            Swal.fire(
                {
                    title: 'Atencion !',
                    text: "Debe registrar arribo previamente",
                    icon: 'warning',
                }
              )
        }
        
    }

    const handleSaveCell = (cell, value)=>{
        if(cell.row.original.recepcion){
            let entregasTemp = entregas       
            entregasTemp[cell.row.index][cell.column.id] = value;
            setEntregas([...entregasTemp]);  
        }
    }

    const borrarEmbarque = ()=>{

    }

    const handleSalvar = async ()=>{
        const url = `${apiUrl.url}embarques/actualizar_bitacora`
        const data = {
            id:embarque.id,
            partidas: entregas
        }
        const resp = axios.post(url, data,{headers: { Authorization: `Bearer ${auth.access}` }})
        getData()
        navigate("/embarques/transito")
    }
        
    const getData = async () => {
          const url = `${apiUrl.url}embarques/actualizar_entregas/${params.id}`
          const res =  await axios.get(url,{headers: { Authorization: `Bearer ${auth.access}` }})
          setEmbarque(res.data)
    
          if(res.data?.partidas.length != 0){
              const partidasEmbarque = res.data.partidas
              let entregasEmbarque = []
              for(let partida of partidasEmbarque){
                    let entregaEmbarque = {}
                    entregaEmbarque.entregaId = partida.id
                    entregaEmbarque.documento = partida.documento
                    entregaEmbarque.entidad = partida.entidad
                    entregaEmbarque.destinatario = partida.destinatario
                    entregaEmbarque.envioId = partida.envio
                    entregaEmbarque.fechaDocumento = partida.fecha_documento
                    entregaEmbarque.sucursal = partida.sucursal
                    entregaEmbarque.tipoDocumento = partida.tipo_documento
                    entregaEmbarque.arribo = partida.arribo
                    entregaEmbarque.arribo_latitud = partida.arribo_latitud
                    entregaEmbarque.arribo_longitud = partida.arribo_longitud
                    entregaEmbarque.recepcion = partida.recepcion
                    entregaEmbarque.recepcion_latitud = partida.recepcion_latitud
                    entregaEmbarque.recepcion_longitud = partida.recepcion_longitud
                    entregaEmbarque.recibio = partida.recibio

                    entregasEmbarque.push(entregaEmbarque)
              }
              const entregasEmbarqueSort = sortObjectsList(entregasEmbarque,'entregaId')
              setEntregas(entregasEmbarqueSort)
              
          }
        }
        
        useEffect(() => {
        // Effect que carga el embarque al abrir la vista
          getData()   
        }, []);

        const columns=useMemo(()=>[
            {
                header: 'Tipo',
                accessorKey: 'tipoDocumento', 
                enableEditing: row => false,
                size:100,
                muiTableBodyCellProps: {
                    align: 'left'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  }
              },
            {
                header: 'Documento',
                accessorKey: 'documento', 
                enableEditing: row => false,
                size:70,
                muiTableBodyCellProps: {
                    align: 'center'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  }
              },   
              {
                header: 'Nombre',
                accessorKey: 'destinatario', 
                enableEditing: row => false,
                size:100,
                muiTableBodyCellProps: {
                    align: 'left'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  }
              }, 
              {
                header: 'Arribo',
                accessorKey: 'arribo', 
                enableEditing: row => false,
                size:100,
                muiTableBodyCellProps: {
                    align: 'center'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  },
                  Cell:({cell,row})=>(
                    !cell.getValue()? 
                    (<IconButton aria-label="delete" size="medium" color="success" onClick={()=>{actualizarArribo(row.original)}} >
                        <FlightLandIcon   />
                    </IconButton>):
                    cell.getValue()
                  )
              }, 
              {
                header: 'Recepcion',
                accessorKey: 'recepcion', 
                enableEditing: row => false,
                size:100,
                muiTableBodyCellProps: {
                    align: 'center'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  },
                  Cell:({cell,row})=>(
                    !cell.getValue()? 
                    (<IconButton aria-label="delete" size="medium" color="warning" onClick={()=>{actualizarRecepcion(row.original)}} >
                        <AssignmentTurnedInIcon   />
                    </IconButton>):
                    cell.getValue()
                  )
              }, 
              {
                header: 'Recibio',
                accessorKey: 'recibio', 
                enableEditing: row => true,
                size:100,
                muiTableBodyCellProps: {
                    align: 'left'
                  },
                  muiTableHeadCellProps: {
                    align: 'center'
                  }
              }, 
              
            ])

        return (
            <div className='entregas-form-container'>  
                <Paper sx={{height: '100%',display:'flex',flexDirection:'column',justifyContent:'space-between'   }}  elevation={0}>
                    <Box component={'div'}>
                        <Typography fontSize={20}>Actualizar Entregas</Typography>
                        <Divider />
                        <Grid container columnSpacing={2}    
                            sx={{
                                    display: 'flex' ,
                                    '& .MuiTextField-root': { ml: 1},
                                }}
                        >
                             <Grid item xs={2}>
                                 <TextField  variant="standard" name = "documento" value={embarque ? embarque.documento :""} disabled fullWidth/> 
                            </Grid>
                            <Grid item xs={2}>
                                <TextField  variant="standard" name = "sucursal" value={embarque ? embarque.sucursal:""} disabled fullWidth/>
                            </Grid>
                            <Grid item xs={2}>
                            <TextField  variant="standard" value={embarque ? embarque.fecha : ""} name="fecha"  disabled fullWidth />
                            </Grid>
                            <Grid item xs={1}>
                                <FormControlLabel control={<Checkbox checked={embarque ? embarque.cp : false} name='cp' disabled/>}  label="FORANEO" />
                            </Grid> 
                        </Grid>
                        <Grid container columnSpacing={2}   sx={{ marginBottom:1,
                                    display: 'flex',
                                        '& .MuiTextField-root': { mr: 1},
                                    }}>
                           <Grid item xs={5}>
                                <TextField   name = "operador" variant="standard" value={embarque ? embarque.operador.nombre : ""} disabled fullWidth/> 
                            </Grid>
                            <Grid item xs={7}>
                                   <TextField  variant="standard" name = "comentario" value={embarque && embarque.comentario  ? embarque.comentario : ""}  disabled fullWidth /> 
                            </Grid>     
                        </Grid>
                        <Divider />
                    </Box>
                    <Box component={'div'} sx={{height:"100%"}}>
                    <MaterialReactTable
                        columns={columns}
                        data={entregas}
                        enableTopToolbar={false}
                        enableColumnOrdering
                        enableGlobalFilter={false} 
                        initialState={{ 
                            density: 'compact',
                            size:'small',
                            
                        }} 
                        enablePagination={false}
                        enableRowVirtualization 
                        enableBottomToolbar={false}
                        muiTableContainerProps={{ sx: { maxHeight: 600 , minHeight: 500 } }}
                        enableColumnActions={false}
                        enableColumnFilters={false}
                        enableSorting={false}
                        enableColumnDragging={false}
                        enableRowNumbers
                        rowNumberMode="original"
                        localization={MRT_Localization_ES}
                        enableRowActions 
                        positionActionsColumn="last"

                        editingMode="cell"  
                        enableEditing 
                        muiTableBodyCellEditTextFieldProps={({
                                cell
                            }) => ({
                                onBlur: event => {
                                    if(cell.column.id === 'recibio'){
                                        handleSaveCell(cell, event.target.value);
                                    }
                                },
                                onFocus: event =>{
                                   if(!cell.row.original.recepcion){
                                    Swal.fire(
                                        {
                                            title: 'Atencion !',
                                            text: "Debe registrar recepcion previamente",
                                            icon: 'warning',
                                        }
                                      )
                                   }
                                }
                            })} 
                        renderRowActions={({
                        row
                        }) => <div style={{
                        display: 'flex',
                        flexWrap: 'nowrap',
                        gap: '0.5rem',
                        color:'red'
                        }}>
                           
                            {
                                !row.original.arribo ?
                                (<IconButton aria-label="delete" size="medium" color="error" onClick={()=>{handleBorrar(row.original)}} >
                                    <DeleteForeverIcon   />
                                </IconButton>):
                                null
                            }
                            
                        
                            </div>} 
                    />
                    </Box>
                    <Box
                        component={'div'}
                        sx={{height: '4rem'}}
                    >
                    <Divider sx={{mb:2}} />
                        <Button  sx={{mr:8, ml:5 }}  disabled={! entregas.length > 0} onClick={handleSalvar}>Salvar</Button>
                        <Button onClick={handleSalir} >Salir</Button>
                    </Box> 

                </Paper>  
    
          
            </div>
        );
}

export default EntregasForm;

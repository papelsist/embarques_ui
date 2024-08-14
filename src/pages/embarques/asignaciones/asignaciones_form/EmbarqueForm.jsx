import React, { useState,useMemo, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Divider,TextField,Grid, Typography, Button, Checkbox,FormControlLabel,Fab,Dialog,Paper,IconButton  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import BuscadorEnvio from '../components/BuscadorEnvio';
import { sortObjectsList,makeSublistByProperty,makeMasterDetailObject } from '../../../../utils/embarqueUtils';
import  { apiUrl }  from '../../../../conf/axios_instance'
import Swal from 'sweetalert2'

import './EmbarqueForm.css'
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const EmbarqueForm = () => {

    const{auth} = useContext(ContextEmbarques)
    const navigate = useNavigate()
    const params = useParams()
    const [embarque, setEmbarque] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const [entregas, setEntregas] = useState([]);
    const [cp, setCp] = useState(false)

    const hadleBorrar = (row) =>{

        Swal.fire({
          title: `Esta seguro de borrar Clave:${row.clave} Cant:${row.enviar}?`,
          text: "Esta accion no se puede revertir!",
          
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, borrar',
          cancelButtonText: 'Cancelar'
        }).then(async(result) => {
          if (result.isConfirmed) {
            const resp = await borrarPatida(row)
           
            if(resp >= 0){
              const entregasNew = entregas.filter((entrega)=>  entrega.id !== row.id)
              setEntregas(entregasNew)
              Swal.fire(
                `Eliminado!`,
                'El envío ha sido borrado!',
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

    const borrarPatida = async(row)=>{
      const url = `${apiUrl.url}embarques/eliminar_entrega_det`
      const res = await axios.post(url, row ,{headers: { Authorization: `Bearer ${auth.access}` }})
      return res.data.deleted
    } 

    const handleSalir =()=>{
        navigate("/embarques/asignaciones")    
    }   

    const handleSalvar= async(e)=>{
        // prepara informacion para salvar el embarque con entregas y entregadet
        const url = `${apiUrl.url}embarques/actualizar_embarque`
        const partidas = buildPartidas()
        const data = {
          embarqueId: embarque.id,
          cp : cp,
          comentario : embarque.comentario,
          operador: embarque.operador.id,
          partidas: partidas
        }
        console.log(data)
        const res = await axios.post(url,data, {headers: { Authorization: `Bearer ${auth.access}` }})  
        navigate("/embarques/asignaciones")
    }

    const buildPartidas = () =>{
        let partidas = []
        const entregasSort = sortObjectsList([...entregas],'envioId')
        const entregasGroupedList = makeSublistByProperty(entregasSort,'envioId')
        entregasGroupedList.forEach((sublista) =>{
          const master = makeMasterDetailObject(sublista,'envioId', 'documento', 'destinatario','fechaDocumento','sucursal','tipoDocumento','entidad','entregaId')
          partidas.push(master)
        })
        return partidas
    }

    const agregarEntregas = (nuevas) => {
    // Metodo para actualizar las partidas agregando los nuevos envios
        setEntregas([...entregas, ...nuevas])
    }

    const handleSaveCell = (cell, value) => {
    // Metodos para actualizar las columnas que se modifican en la tabla
            let entregasTemp = entregas
            if (cell.row.original.entregaDetId){
              entregasTemp[cell.row.index]['saldo'] = Number(cell.row.original.saldo) + Number(cell.row.original.enviar) - Number(value)
            }
            
            entregasTemp[cell.row.index][cell.column.id] = value;
            setEntregas([...entregasTemp]);    
    };
    
    const getData = async () => {
    // Metodo para obtener el embarque al carga la vista
      const url = `${apiUrl.url}embarques/crear_asignacion/${params.id}`
      const res =  await axios.get(url,{headers: { Authorization: `Bearer ${auth.access}` }})
      setEmbarque(res.data)
      
      setCp(res.data.cp)
      if(res.data?.partidas.length != 0){
          const partidasEmbarque = res.data.partidas
          let entregasEmbarque = []
          for(let partida of partidasEmbarque){
 
            if(partida.detalles.length != 0){
                const detalles = partida.detalles
              for(let detalle of detalles){
                  let entregaEmbarque = {}
                  entregaEmbarque.entregaId = partida.id
                  entregaEmbarque.documento = partida.documento
                  entregaEmbarque.entidad = partida.entidad
                  entregaEmbarque.destinatario = partida.destinatario
                  entregaEmbarque.envioId = partida.envio
                  entregaEmbarque.fechaDocumento = partida.fecha_documento
                  entregaEmbarque.sucursal = partida.sucursal
                  entregaEmbarque.tipoDocumento = partida.tipo_documento
                  entregaEmbarque.entregaDetId = detalle.id
                  entregaEmbarque.clave = detalle.clave
                  entregaEmbarque.me_descripcion = detalle.descripcion
                  entregaEmbarque.id = detalle.envio_det
                  entregaEmbarque.enviar = detalle.cantidad
                  entregaEmbarque.valor = detalle.valor
                  entregaEmbarque.me_cantidad = detalle.cantidad_envio
                  entregaEmbarque.saldoEnvio = detalle.saldo
                  entregaEmbarque.enviado = detalle.enviado
                  entregaEmbarque.saldo = detalle.saldo
                  entregasEmbarque.push(entregaEmbarque)
                }
            }
          }
          setEntregas(entregasEmbarque)
          
      }
    }

    
    useEffect(() => {
    // Effect que carga el embarque al abrir la vista
      getData()   
    }, []);

    // Definición de columnasa para partidas
    const columns=useMemo(()=>[
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
          header: 'Destinatario',
          accessorKey: 'destinatario', 
          enableEditing: row => false,
          size: 250,
          muiTableBodyCellProps: {
              align: 'left'
            },
            muiTableHeadCellProps: {
              align: 'center'
            }

        },
        {
          header: 'Clave',
          accessorKey: 'clave', 
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
          header: 'Descripcion',
          accessorKey: 'me_descripcion', 
          enableEditing: row => false,
          size:180,
          muiTableBodyCellProps: {
              align: 'left'
            },
            muiTableHeadCellProps: {
              align: 'center'
            }
        },
        {
          header: 'Cantidad',
          accessorKey: 'me_cantidad', 
          enableEditing: row => false,
          size: 80,
            muiTableBodyCellProps: {
              align: 'right'
            },
            muiTableHeadCellProps: {
              align: 'center'
            }

        },
        {
          header: 'Saldo',
          accessorKey: 'saldo', 
            enableEditing: row => false,
            Cell: ({ row }) => (row.original.entregaDetId ? row.original.saldo : row.original.saldo - row.original.enviar)
           ,
            size:80,
            muiTableBodyCellProps: {
              align: 'right'
            },
            muiTableHeadCellProps: {
              align: 'center'
            }
        },
        {
          header: 'Enviar',
          accessorKey: 'enviar', 
          size:80,
          muiTableBodyCellProps: {
              align: 'right'
            },
            muiTableHeadCellProps: {
              align: 'center'
            }
        },
      ])
    
    return (
        <div className='embarque-form-container'>  
            <Paper sx={{height: '100%',display:'flex',flexDirection:'column',justifyContent:'space-between'   }}  elevation={0}>
                <Box component={'div'}>
                    <Typography fontSize={20}>Asignación Embarque</Typography>
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
                            <FormControlLabel control={<Checkbox onChange={(e)=>{setCp(e.target.checked)}} checked={cp} name='cp'/>}  label="FORANEO" />
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
                        columnVisibility:{subdimension:false},
                        columnPinning: { left: ['descripcion'] },
                        density: 'compact',
                         size:'small',
                         
                      }} 
                    enablePagination={false}
                    enableRowVirtualization 
                    enableBottomToolbar={false}
                    editingMode="cell"  
                   enableEditing 
                   muiTableBodyCellEditTextFieldProps={({
                        cell
                      }) => ({
                        onBlur: event => {
                            if(cell.column.id === 'enviar'){
                                handleSaveCell(cell, event.target.value);
                            }
                        }
                      })}  
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
                    renderRowActions={({
                      row
                    }) => <div style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      gap: '0.5rem',
                      color:'red'
                    }}>
                        <IconButton aria-label="delete" size="large" color="error"  onClick={()=>{hadleBorrar(row.original)}} >
                            <DeleteForeverIcon  />
                        </IconButton>
                     
                          </div>} 
                    />             
                </Box>
               <Box
                component={'div'}
                 sx={{height: '4rem'}}
                >
                <Divider sx={{mb:2}} />
                    <Button  sx={{mr:8, ml:5 }} onClick={handleSalvar} disabled={! entregas.length > 0}>Salvar</Button>
                    <Button onClick={handleSalir}>Salir</Button>
                </Box> 
            </Paper>  

           <Fab 
                color="primary" aria-label="add"  
                sx={{position: "fixed",bottom: (theme) => theme.spacing(7),right: (theme) => theme.spacing(10)}}
                onClick={()=>{setOpenDialog(true)}}
            >
                <AddIcon  sx={{fontSize:35}} />
            </Fab> 
            <Dialog open={openDialog} onClose={()=>{setOpenDialog(false)}}   maxWidth={'md'}>
               <BuscadorEnvio setOpenDialog={setOpenDialog} agregarEntregas={agregarEntregas}  />
            </Dialog> 
        </div>
    );
}

export default EmbarqueForm;

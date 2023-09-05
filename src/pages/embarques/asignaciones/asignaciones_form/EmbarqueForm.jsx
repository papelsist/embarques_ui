import React, { useState,useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Divider,TextField,Grid, Typography, Button, Checkbox,FormControlLabel,Fab,Dialog,Paper  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import BuscadorEnvio from '../components/BuscadorEnvio';
import { sortObjectsList,makeSublistByProperty,makeMasterDetailObject } from '../../../../utils/embarqueUtils';
import  { apiUrl }  from '../../../../conf/axios_instance'

import './EmbarqueForm.css'

const EmbarqueForm = () => {

    const navigate = useNavigate()
    const params = useParams()
    const [embarque, setEmbarque] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const [entregas, setEntregas] = useState([]);
    const [foraneo, setForaneo] = useState(false)

    const handleSalir =(e)=>{
        navigate("/embarques/asignaciones")

       
    }   

    const handleSalvar= async(e)=>{
        // prepara informacion para salvar el embarque con entregas y entregadet
        const url = `${apiUrl.url}embarques/actualizar_embarque`
        const partidas = buildPartidas()
        const data = {
          embarqueId: embarque.id,
          foraneo : foraneo,
          comentario : embarque.comentario,
          operador: embarque.operador.id,
          partidas: partidas
        }
        console.log(data)
        const res = await axios.post(url,data)
        console.log(res)
    }

    const buildPartidas = () =>{
        let partidas = []
        const entregasSort = sortObjectsList([...entregas],'envioId')
        const entregasGroupedList = makeSublistByProperty(entregasSort,'envioId')
        entregasGroupedList.forEach((sublista) =>{
          const master = makeMasterDetailObject(sublista,'envioId', 'documento', 'destinatario','fechaDocumento','sucursal','tipoDocumento','entidad')
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
            entregas[cell.row.index][cell.column.id] = value;
            setEntregas([...entregas]);    
    };
    
    const getData = async () => {
    // Metodo para obtener el embarque al carga la vista
      const url = `${apiUrl.url}embarques/crear_asignacion/${params.id}`
      const res =  await axios.get(url)
      console.log(res.data)
      setEmbarque(res.data)
      if(res.data?.partidas.length != 0){
          console.log("El embarque tiene partidas... ")
          const partidasEmbarque = res.data.partidas
          for(let partida of partidasEmbarque){
            console.log("***********")
            console.log(partida)
            if(partida.detalles.length != 0){
                const detalles = partida.detalles
                for(let detalle of detalles){
                    console.log("____________________")
                    console.log(detalles)
                }
            }
          }
          
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
            Cell: ({ row }) => (row.original.saldo - row.original.enviar),
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
                            <TextField  variant="standard" name = "documento" value={embarque && embarque.documento} disabled fullWidth/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField  variant="standard" name = "sucursal" value={embarque && embarque.sucursal} disabled fullWidth/>
                        </Grid>
                        <Grid item xs={2}>
                        <TextField  variant="standard" value={embarque && embarque.fecha} name="fecha"  disabled fullWidth />
                        </Grid>
                        <Grid item xs={1}>
                            <FormControlLabel control={<Checkbox onChange={(e)=>{setForaneo(e.target.checked)}}/>}  label="Foraneo" />
                        </Grid>
                    </Grid>
                    <Grid container columnSpacing={2}   sx={{ marginBottom:1,
                                display: 'flex',
                                    '& .MuiTextField-root': { mr: 1},
                                }}>
                        <Grid item xs={5}>
                            <TextField   name = "operador" variant="standard" value={embarque && embarque.operador.nombre} disabled fullWidth/>
                        </Grid>
                        <Grid item xs={7}>
                                <TextField  variant="standard" name = "comentario" value={embarque && embarque.comentario}  disabled fullWidth />
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
                            console.log(cell)
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
                    />            
                </Box>
                <Box
                component={'div'}
                 sx={{height: '4rem'}}
                >
                <Divider sx={{mb:2}} />
                    <Button  sx={{mr:8, ml:5 }} onClick={handleSalvar}>Salvar</Button>
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

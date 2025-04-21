import React, {useEffect,useState,useMemo, useContext} from 'react';
import {apiUrl} from '../../../conf/axios_instance';
import axios from 'axios';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { Box, Typography, IconButton,Tooltip,Avatar,Dialog,Card,CardMedia,CardActions,Button  } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import  {ContextEmbarques} from '../../../context/ContextEmbarques';

import '../Embarques.css'


const CapturasEntregas = () => {
    const [datos, setDatos] = useState([]);
    const [showImage, setShowImage] = useState(false)
    const [img, setImg] = useState('')
    const [fecha, setFecha] = useState(dayjs());
    const {sucursal} = useContext(ContextEmbarques)


    const getData = async() => {
        const url = `${apiUrl.url}tableros/capturas_entregas`;
        const params = {
            fecha: fecha.format('YYYY-MM-DD'),
            sucursal: sucursal.nombre
        }
        try {
            const response = await axios.get(url,{
                params:params,
              });
            console.log(response.data);
            setDatos(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const refrescar = ()=>{
        getData()
    }

    const mostrarImagen = (img) =>{
        setImg(img)
        setShowImage(true)
    }

    useEffect(() => {
        getData()
    }, [sucursal,fecha]);

    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'entrega.documento', 
            header: 'Documento',
            size:60,
            enableEditing: row => false
        },
        {
            accessorKey: 'entrega.fecha_documento', 
            header: 'Fecha',
            size:80,
            enableEditing: row => false

        },
        {
            accessorKey: 'entrega.origen', 
            header: 'Tipo',
            size:30,
            enableEditing: row => false

        },
        {
            accessorKey: 'entrega.destinatario', 
            header: 'Cliente',
            size:100,
            enableEditing: row => false

        },
        {
            accessorKey: 'entrega.operador', 
            header: 'Operador',
            size:100,
            enableEditing: row => false

        },
        
    ]);


    return (
        <div className='contenedor-embarques-table'>
            <MaterialReactTable
                columns={columns}   
                data = {datos}
                muiTableContainerProps={{ sx: { maxHeight: '80vh' , minHeight: '80vh'} }}
                initialState={{ density: 'compact',size:'small',}} 
                enableRowOrdering = {false}
                getRowId={(originalRow) => originalRow.id}
                enableColumnOrdering
                enablePagination={false}
                enableRowVirtualization 
                enableTopToolbar={true}
                enableToolbarInternalActions={true}
                renderTopToolbarCustomActions={({ table }) => (
                <div className='embarques-header-container'>
                    <Box sx={{display:'flex', justifyContent:'center', width:'30%', height:'100%' }} >
                    <Typography variant='h6' sx={{display:'flex', justifyContent:'center', width:'100%', height:'100%' }} >
                            Capturas Entregas
                        </Typography>
                    </Box>
                   
                        <DatePicker   
                                label="Fecha"
                                value={fecha} 
                                onChange={(fecha)=>{setFecha(fecha)}} 
                                slotProps={{ textField: { variant: 'standard' } }}
                            />
                    
                   
                    
                    <Tooltip title="Refrescar">
                    <IconButton onClick={refrescar}>
                        <RefreshIcon />
                    </IconButton>
                    </Tooltip>
                </div>  
                    
                )} 
                enableBottomToolbar={false}
                localization={MRT_Localization_ES}
                enableRowActions 
                positionActionsColumn="last"
                renderRowActions={({
                    row
                  }) => <div style={{
                    display: 'flex',
                    flexWrap: 'nowrap',
                    gap: '0.5rem',
                   
                  }}>
                     
                    <>
                       <Tooltip title="Ver Captura">
                            <IconButton aria-label="delete" size="small" color='secondary' onClick={()=>{mostrarImagen(row.original.url_image)}}>
                                <Avatar alt="Captura" src={row.original.url_image} />
                            </IconButton>
                       </Tooltip>
                       
                    </>
                    
                        
                    
                    </div>}  
            />
             <Dialog open={showImage} onClose={()=>{setShowImage(false)}}>
                <Card>
                    <CardMedia
                        component="img"
                        height="700"
                        image={img}
                        alt="img_incidencia"
                    />
                    <CardActions sx={{}}>
                        <Button size="small" color="primary" onClick={()=>{setShowImage(false)}} >
                            Cerrar
                        </Button>
                    </CardActions>
                </Card>
            </Dialog>
            
        </div>
    );
}

export default CapturasEntregas;

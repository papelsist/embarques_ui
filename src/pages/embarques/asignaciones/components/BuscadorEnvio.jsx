import React, { useContext, useState } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { useForm}  from '../../../../hooks/useForm';
import { apiUrl } from '../../../../conf/axios_instance';
import {Paper, Box,Grid,FormControl,TextField,Typography,Divider, InputLabel,Select,MenuItem,IconButton,LinearProgress,Button,
FormControlLabel,Checkbox, useStepContext } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


import './BuscadorEnvio.css';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';


const initialParams = {
    tipo: "VENTA",
    documento:"",
    fecha_documento:""
}
const columns = [
    {
        name: 'Clave',
        selector: row => row.clave,
    },
    {
        name: 'Descripcion',
        selector: row => row.me_descripcion,
    },
    {
        name: 'Cantidad',
        selector: row => row.me_cantidad,
    },
    {
        name: 'Saldo',
        selector: row => row.saldo,
        
    },
];

const BuscadorEnvio = ({setOpenDialog, agregarEntregas}) => {

    const {auth,sucursal} = useContext(ContextEmbarques);
    const [loading, setLoading] = useState(false);
    const [envio, setEnvio] = useState(null);
    const [values, handleInputChange] = useForm(initialParams)
    const [selecteds, setSelecteds] = useState([]);
    const [total, setTotal] = useState(false)
  


    const getData = async ()=> {
        const url = `${apiUrl.url}embarques/search_envio_surtido`
        setEnvio(null)
        setLoading(true)
        const datos = await axios.get(url, {params:{...values,sucursal:sucursal.nombre}, headers: { Authorization: `Bearer ${auth.access}` }})
        if(datos.data){
            setEnvio(datos.data)
        }
        setLoading(false)
    }

    const handleSelectedRow = ({ selectedRows }) =>{
        setSelecteds(selectedRows)
    }

    const handleAgregar = () =>{
            const entregas = buildEntregas()
            agregarEntregas(entregas)
            setOpenDialog(false)
    }

    const buildEntregas = ()=>{
       let entregas = []
        selecteds. forEach((selected)=>{
            let entrega = {
                entregaId: null,
                entregaDetId:null,
                envioId:envio.id,
                entidad:values.tipo,
                documento: envio.documento,
                fechaDocumento: envio.fecha_documento,
                destinatario: envio.destinatario,
                sucursal: envio.sucursal,
                tipoDocumento: envio.tipo_documento,
                valor: envio.valor,
                kilos: envio._me_kilos,
                enviar:  0,
                ...selected
            }
            if(total){
                entrega.enviar = entrega.saldo
                entrega.saldoEnvio = entrega.saldo
                // entrega.saldo = 0     
            }
            entregas.push(entrega)
        })

        return entregas
    }

    const handleTotal = (e) =>{
            setTotal(e.target.checked)
          
    }

    const rowDisabledCriteria = row => row.saldo <= 0;

    return (
        <div className='buscador-envio-container'>
            
            <Paper sx={{height:"100%", width:"100%", padding:3}}>
            
            <Box>
                <Typography>
                    Buscador Envio
                </Typography>
                <Divider/>
            </Box>
            <Box sx={{mb:1}}>
                <Grid container columnSpacing={2} >
                    <Grid item xs={3}>
                    <FormControl  variant="standard" fullWidth>
                        <InputLabel >Tipo</InputLabel>
                        <Select name="tipo"    defaultValue="VENTA" onChange={handleInputChange} >
                            <MenuItem value={"VENTA"}>VENTA</MenuItem>
                            <MenuItem value={"TRASLADO"}>TRASLADO</MenuItem>
                            <MenuItem value={"DEVOLUCION"}>DEVOLUCION</MenuItem>
                        </Select>
                    </FormControl>
                    </Grid>  
                    <Grid item xs={3}>
                        <TextField label="Documento" variant="standard" name = "documento" onChange={handleInputChange}/>
                    </Grid>
                    {/* <Grid item xs={3}>
                    <DatePicker label="Fecha"  slotProps={{ textField: { variant: "standard" } }} name="date-field" onChange={handleDatePicker}/>
                    </Grid> */}
                    <Grid item xs={3}>
                     <TextField
                        id="date"
                        label="Select Date"
                        type="date"
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant='standard'
                        name='fecha_documento'
                        /> 
                    </Grid>
                    <Grid item xs={2}>
                        <IconButton aria-label="search" onClick={getData} >
                            <SearchIcon sx={{fontSize:35}} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={1}>
                        <FormControlLabel control={<Checkbox onChange={handleTotal}/>}  label="Total" />
                    </Grid>
                </Grid>
                
            </Box>
            <Divider/>
            <Box>
               {loading &&
                <LinearProgress />
               }
               {envio?.detalles &&
                <Box component={"div"} sx={{display:'flex', flexDirection:"column",justifyContent:"space-between"}}>
                        <Box component={"div"}>
                            <Grid container columnSpacing={2}>
                                <Grid item xs={3}>
                                    {envio.documento}
                                </Grid>
                                <Grid item xs={3}>
                                    {envio.fecha_documento}
                                </Grid>
                                <Grid item xs={3}>
                                    {envio.sucursal}
                                </Grid>
                                <Grid item xs={3}>
                                    {envio.tipo_documento}
                                </Grid>
                                <Grid item xs={12}>
                                    {envio.de_destinatario}
                                </Grid>
                            </Grid>
                        </Box>
                            <Divider/>  
                        <Box component={"div"}>
                            <DataTable   
                                columns={columns}
                                data={envio.detalles}
                                fixedHeaderScrollHeight="25rem"
                                onSelectedRowsChange={handleSelectedRow}
                                selectableRowsHighlight={true}
                                selectableRowDisabled={rowDisabledCriteria}
                                dense
                                fixedHeader
                                highlightOnHover
                                pointerOnHover
                                responsive
                                striped
                                selectableRows
                                headCell
                            /> 
                        </Box>
                        <Box component={"div"}>
                        <Divider sx={{mb:2}} />
                            <Button  sx={{mr:8, ml:5 }} onClick={handleAgregar}>Agregar</Button>
                            <Button onClick={()=>{setOpenDialog(false)}}>Salir</Button>
                        </Box>
                </Box>
               }
            </Box>
            </Paper>
        </div>
    );
}

export default BuscadorEnvio;

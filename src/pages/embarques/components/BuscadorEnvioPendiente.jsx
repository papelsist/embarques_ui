import React,{useState, useContext} from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, Divider, Grid,Button, TextField, Tooltip, IconButton} from '@mui/material';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { apiUrl } from '../../../conf/axios_instance';
import axios from 'axios';

const BuscadorEnvioPendiente = ({onCloseDialog, onOpenDialog, setRowSelection, setShowDialog }) => {

    const tipos = ['CON','COD','CRE']
    const {sucursal} = useContext(ContextEmbarques)
    const [envio, setEnvio] = useState(null)
    const [documento, setDocumento] = useState(null)
    const [origen, setOrigen] = useState('')
    const [message, setMessage] = useState(null)


    const buscar = async()=>{
        setEnvio(null)
        setMessage(null)
        console.log('Buscando')
        const params = {
            documento,
            origen,
            sucursal: sucursal.nombre

        }
        const url = `${apiUrl.url}embarques/get_envio_pendiente/`

        const response = await axios.get(url, {params})
        console.log(response.data);
        if(response.data.envio.id){
            setEnvio(response.data.envio)
            setRow(response.data.envio.id)
            setMessage(null)
        }else{
            setEnvio(null)
            setMessage('No se encontró el envio')
        }
    }

    const handleChangeDocumento = (e)=>{
        setDocumento(e.target.value)
    }

    const handleChangeOrigen = (e)=>{
        setOrigen(e.target.value)
    }

    const setRow = (row)=>{
        setRowSelection({[row]:true})
    }

    const handleAsignacionParcial = ()=>{
        if(!envio){
            return
        }
        onCloseDialog()
        onOpenDialog()
    }

    const handleAsignacionTotal = ()=>{
        if(!envio){
            return
        }
        setShowDialog(true)
        onCloseDialog()
    }


    const handleSalir = ()=>{
        setRowSelection({})
        onCloseDialog()
    }

    return (
        <Box sx={{width:"30rem"}}>
            <Box padding={2}>
            <Grid container spacing={2} padding={1}>
                <Grid item xs={10}>
                    <Typography variant="h6" component="div">
                    Buscador de Envio
                    </Typography>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip title="Asignación Total">
                        <IconButton onClick={handleAsignacionTotal}>
                            <LocalShippingIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip title="Asignación Parcial">
                        <IconButton onClick={handleAsignacionParcial}>
                            <ChecklistRtlIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>

            </Grid> 
        </Box>
            <Divider />
            <Box>
                <Grid container spacing={2} padding={1}>
                    <Grid item xs={5}>
                         <TextField label="Documento" name="documento" variant="standard" type='number' fullWidth onChange={handleChangeDocumento}   />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Origen</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={origen}
                                label="Age"
                                onChange={handleChangeOrigen}
                                variant='standard'
                            >
                                {
                                tipos.map((tipo) => (
                                    <MenuItem value={tipo}>{`${tipo}`}</MenuItem>
                                ))
                            }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                        <Button 
                             color="primary" 
                             startIcon={<TroubleshootIcon />}
                             onClick={buscar}
                             disabled={documento === null || origen === ''}
                        >
                            Buscar
                        </Button>

                    </Grid>
                </Grid>
            </Box>
            <Divider />
            <Box sx={{height:'10rem'}}>
                {
                    message && (     
                        <Typography variant="h6" component="div" color='error' sx={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                            {message ? message : ''}
                        </Typography>
                    )
                }
                {
                    !message && envio && (
                        <Box>
                            <Typography  component="div" sx={{display:'flex', justifyContent:'center', alignItems:'center'}} color='primary'>
                                {envio.documento} - {envio.tipo_documento}
                            </Typography>
                            <Typography  component="div" sx={{display:'flex', justifyContent:'center', alignItems:'center'}} color='primary'>
                                {envio.destinatario}
                            </Typography>
                            <Typography  component="div" sx={{display:'flex', justifyContent:'center', alignItems:'center'}} color='primary'>
                                {envio.instruccion.direccion_calle}
                            </Typography>
                            <Typography  component="div" sx={{display:'flex', justifyContent:'center', alignItems:'center'}} color='primary'>
                                {envio.instruccion.direccion_colonia} - {envio.instruccion.direccion_codigo_postal}
                            </Typography>
                        </Box>
                    )
                }


            </Box>
            <Divider />
            <Box sx={{display:'flex', justifyContent:'center', alignItems:'center',margin:1}}>
                <Button 
                        color="primary" 
                        onClick={handleSalir}
                >
                    Salir
                </Button>


            </Box>
        </Box>
    );
}

export default BuscadorEnvioPendiente;

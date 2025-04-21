import React, {useState, useEffect} from 'react';
import { Grid, TextField, IconButton,Box, Alert, FormControl, InputLabel, Select, MenuItem,Button,InputAdornment } from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import SaveIcon from '@mui/icons-material/Save';
import { apiUrl } from '../../conf/axios_instance';
import axios from 'axios';



const DireccionForm = ({setDir, setOpenDialog}) => {
    
    const [showAlert, setShowAlert] = useState(false)
    const [tipoAlert, setTipoAlert] = useState('success')
    const [alertMessage, setAlertMessage] = useState('')
    const [codigoValidado, setCodigoValidado] = useState(false)
    const [direccion, setDireccion] = useState({
        codigo_postal: '',
        colonia: null,
        municipio: null,
        estado: null,
        pais: null,
        calle:null,
        numero_exterior:null,
        numero_interior:null,
    })

    const [colonias, setColonias] = useState([])

    const handleChange = (e) => {

        setDireccion({
            ...direccion,
            [e.target.name]: e.target.value
        })
    }

    const handleChangeCodigo = (e) => {
        setCodigoValidado(false)
        setDireccion({
            ...direccion,
            municipio: null,
            estado: null,
            pais: null,
            colonia: null,
            calle:null,
            numero_exterior:null,
            numero_interior:null,
            [e.target.name]: e.target.value
        })
        setColonias([])
    }

    const handleChangeSelector =(e)=>{
        setDireccion({
            ...direccion,
            municipio: colonias[0].municipio,
            estado: colonias[0].estado,
            pais: colonias[0].pais,
            [e.target.name]: e.target.value
        })
    }

    const validarCodigoPostal = async () => {

        if(direccion.codigo_postal){
            setDireccion({
                ...direccion,
                colonia: null
            })
            const url = `${apiUrl.url}get_address_from_zipcode/`
            const response = await axios.get(url, {params: {zip: direccion.codigo_postal}})

            if(response.data.length > 0){
                setCodigoValidado(true)
                setColonias(response.data) 
                
            }else{
                setAlertMessage('No se encontraron resultados')
                setCodigoValidado(false)
                setShowAlert(true)
                setTipoAlert('error')
                setColonias([])
            }
        }else{
            setColonias([])
            setAlertMessage('El campo Codigo Postal es requerido')
            setCodigoValidado(false)
            setShowAlert(true)
            setTipoAlert('error')
        }
    }

    const onClickAceptar = () => {
        if(typeof setDir === 'function'){
            if(codigoValidado && direccion.colonia && direccion.municipio && direccion.estado && direccion.pais && direccion.calle && direccion.numero_exterior){
                setDir(direccion)
                setOpenDialog(false)
            }else{
                setAlertMessage('Todos los campos son requeridos')
                setShowAlert(true)
                setTipoAlert('error')
            }
        }
    }

    useEffect(() => {
        if (showAlert) {
          const timer = setTimeout(() => {
            setShowAlert(false);
            setTipoAlert('success')
          }, 2000)
          return () => clearTimeout(timer);
        }
      }, [showAlert]);

    return (
        <Box sx={{width:400, height:700, padding:1}}>
            <Box component='div'  sx={{height: 20, margin: 3,display:'flex', justifyContent:'center', alignItems:'center'}} >
            {
                showAlert &&
                <Alert icon={<NewReleasesIcon fontSize="inherit" />} severity={tipoAlert}>
                    {alertMessage}
                </Alert>
                }
            </Box>
            <Grid container spacing={2} >
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                    <TextField
                        type='number'
                        label="Codigo Postal"
                        fullWidth
                        name='codigo_postal'
                        onChange={handleChangeCodigo}
                        value={direccion.codigo_postal}
                        InputProps={{endAdornment: <IconButton onClick={validarCodigoPostal}>
                            { 
                                !codigoValidado ? 
                                <NewReleasesIcon sx={{color: '#F44336'  }} /> : 
                                <VerifiedIcon sx={{color: '#1876D1'  }} />
                            }
                            </IconButton>}}
                        sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {display: "none",},
                            "& input[type=number]": {MozAppearance: "textfield",},
                        }}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="select-label">Colonia</InputLabel>
                        <Select
                            labelId="select-label"
                            id="select"
                            label="Colonia"
                            value={direccion.colonia ? direccion.colonia : ''} 
                            name='colonia'
                            onChange={handleChangeSelector}
                        >
                            {
                                colonias.length == 0 &&
                                <MenuItem value={''}>
                                    Teclee un codigo postal valido
                                </MenuItem>
                            }
                            {   
                                colonias.map((colonia) => {
                                    return <MenuItem key={colonia.id} value={colonia.colonia}>{colonia.colonia}</MenuItem>
                                }) 
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} >
                    <TextField
                        label="Municipio"
                        fullWidth
                        name='municipio'
                        value={direccion.municipio ? direccion.municipio : ''}
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Estado"
                        fullWidth
                        name='estado'
                        value={direccion.estado ? direccion.estado : ''}
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Pais"
                        fullWidth
                        name='pais'
                        value={direccion.pais ? direccion.pais : ''}
                        disabled
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Calle"
                        fullWidth
                        name='calle'
                        onChange={handleChange}
                        value={direccion.calle ? direccion.calle : ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Numero Exterior"
                        fullWidth
                        name='numero_exterior'
                        onChange={handleChange}
                        value={direccion.numero_exterior ? direccion.numero_exterior : ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Numero Interior"
                        fullWidth
                        name='numero_interior'
                        onChange={handleChange}
                        value={direccion.numero_interior ? direccion.numero_interior : ''}
                    />
                </Grid>
            </Grid>
            <Box component='div' sx={{display:'flex', justifyContent:"space-around", marginTop: 2}}>
                <Button onClick={() => setOpenDialog(false)} >
                    Cancelar
                </Button>
                <Button onClick={onClickAceptar} >
                    Aceptar <SaveIcon sx={{color: '#1876D1'  }} />
                </Button>
            </Box>
            </Box>
    );
}

export default DireccionForm;

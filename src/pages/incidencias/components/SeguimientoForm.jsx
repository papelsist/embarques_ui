import React, {useState, useContext} from 'react';
import { Paper, Typography, Divider, Box, Grid, TextField, Button } from '@mui/material';
import axios from 'axios';
import { apiUrl } from '../../../conf/axios_instance';
import { ContextEmbarques } from '../../../context/ContextEmbarques';


const SeguimientoForm = ({incidenciaRow,setShowSeguimiento, updateIncidencia }) => {

    const [capturedText, setCapturedText] = useState('');
    const {auth,sucursal} = useContext(ContextEmbarques);

    const handleChange = (e) =>{
        setCapturedText(e.target.value);
    }

    const handleSalvar = async(e) =>{
        setShowSeguimiento(false);
        const url = `${apiUrl.url}embarques/crear_seguimiento`
        e.preventDefault()
        const data ={
            comentario: capturedText,
            incidencia: incidenciaRow.id
        }
        const resp = await axios.post(url,data,{headers: { Authorization: `Bearer ${auth.access}` }})
        updateIncidencia();

    }

    return (    
        <Paper sx={{padding:3, width: '35rem'}}>
        <Typography variant="h5" gutterBottom sx={{height:'2.5rem' ,display: 'flex', justifyContent:'space-between'}}>  
            Actualizar Seguimiento
        </Typography>
        <Divider sx={{margin: '1.5rem' }} />
        <Box>
        <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
            <TextField
                label="Captura tu texto aquí"
                multiline
                rows={10} // Puedes ajustar el número de filas según sea necesario
                variant="outlined"
                fullWidth
                value={capturedText}
                onChange={handleChange}
            />
            </Grid>
            <Grid item xs={12} md={12}> 
                <Button size="small" color="primary" onClick={handleSalvar} >
                    Salvar
                </Button>
                <Button size="small" color="primary" onClick={()=>{setShowSeguimiento(false)}} >
                    Cerrar
                </Button>
            </Grid>
        </Grid>

        </Box>
        </Paper>
    );
}

export default SeguimientoForm;

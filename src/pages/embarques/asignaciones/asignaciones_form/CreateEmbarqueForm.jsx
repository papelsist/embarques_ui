import React, { useContext, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'
import BuscadorOperador from '../components/BuscadorOperador';
import Paper  from '@mui/material/Paper';
import { Box, Divider,TextField,Grid, Typography, Button } from '@mui/material';
import { apiUrl } from '../../../../conf/axios_instance';

import './EmbarqueForm.css'
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const CreateEmbarqueForm = ({setOpenDialog, getData}) => {
    const {auth,sucursal} = useContext(ContextEmbarques);
    const [operador, setOperador] = useState();
    const [comentario, setComentario] = useState();

    const handleChangeComentario = (e) =>{
        setComentario(e.target.value)
    }

    const handleSalvar = async(e)=>{
        const url = `${apiUrl.url}embarques/crear_embarque`
        e.preventDefault()
        const data ={
            operador: operador.id,
            facturista: operador.facturista,
            sucursal: sucursal.id,
            comentario: comentario
        }
        const resp = await axios.post(url,data,{headers: { Authorization: `Bearer ${auth.access}` }})
        setOpenDialog(false)
        Swal.fire(`Se creo el Embarque No. ${resp.data.documento} para ${resp.data.operador.nombre}`)
        getData()

    }
    const urlChofer = `${apiUrl.url}embarques/search_operador`
    return (
        <div className='create-embarque-form-container '>
            <Paper sx={{height: '100%',display:'flex',flexDirection:'column',justifyContent:'space-between'   }}  elevation={0}>
                <Box component={'div'}>
                    <Typography fontSize={20}>Alta de Embarque</Typography>
                    <Divider />
                    <Grid container columnSpacing={2}    
                        sx={{
                                display: 'flex' ,
                                '& .MuiTextField-root': { ml: 1},
                            }}
                    >
                        <Grid item xs={6}>
                            <TextField  variant="standard" value={sucursal.nombre} disabled fullWidth/>
                        </Grid>
                        <Grid item xs={6}>
                        <TextField  variant="standard" value={new Date().toLocaleDateString()}  disabled fullWidth />
                        </Grid>
                       {/*  <Grid item xs={2}>
                            <FormControlLabel control={<Checkbox/>}  label="Foraneo" />
                        </Grid> */}
                    </Grid>
                    <Grid container columnSpacing={2}   sx={{ marginBottom:1,
                                display: 'flex',
                                    '& .MuiTextField-root': { mr: 1},
                                }}>
                        <Grid item xs={12}>
                            <BuscadorOperador  label={"Seleccione un Operador"} apiUrl={urlChofer} searchField={'term'} setFound={setOperador}/>
                        </Grid>    
                    </Grid>
                    <Grid container columnSpacing={2}   sx={{ marginBottom:1,
                                display: 'flex',
                                    '& .MuiTextField-root': { mr: 1},
                                }}>
                        <Grid item xs={12}>
                                <TextField label="Comentario" name="comentario" variant="standard"  fullWidth  onChange={handleChangeComentario} />
                        </Grid>     
                    </Grid>
              
                </Box>
                <Box>
                <Divider  sx={{mb:1}}/>
                    <Button  sx={{mr:8, ml:5 }} onClick={handleSalvar} disabled={!operador} >Salvar</Button>
                    <Button onClick={()=>{setOpenDialog(false)}} >Salir</Button>
                </Box>
            </Paper>
        </div>
    );
}

export default CreateEmbarqueForm;

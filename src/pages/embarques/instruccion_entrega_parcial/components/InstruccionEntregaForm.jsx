import React, {useContext, useEffect, useState, useMemo} from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, Divider, Grid,Button } from '@mui/material';
import DataTable from 'react-data-table-component';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import { objectIsEmpty } from '../../../../utils/embarqueUtils';
import MaterialReactTable from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import Swal from 'sweetalert2';

const InstruccionEntregaForm = ({rowSelected, onCloseDialog, getData}) => {

    const {auth,sucursal} = useContext(ContextEmbarques);
    const [transportes, setTransportes] = useState([])
    const [instruccion, setInstruccion] = useState(null);
    const [embarque, setEmbarque] = useState('');
    const [detalles, setDetalles] = useState([])

    const getTransportesDisponibles = async ()=>{
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}embarques/pendientes_salida`
                const resp = await axios.get(url,{
                    params: {sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                } )
                setTransportes(resp.data)
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                } 
            }
        }else{
            console.log('No esta autenticado')
        }    
    }

    const handleChange = (event) => {
        setEmbarque(event.target.value);
      };

    const getInstruccionEntrega =  async()=>{
        const id = Object.keys(rowSelected)[0]
        const url = `${apiUrl.url}embarques/get_instruccion_entrega/`
        const params = {id}
        const instr = await axios.get(url,{
            headers: { Authorization: `Bearer ${auth.access}` },
            params:params
        })

        if(instr.data){
            setInstruccion(instr.data)
            setDetalles(instr.data.detalles)
        }

    }

    const handleAsignar = async()=>{
        const url = `${apiUrl.url}embarques/asignar_instruccion_entrega/`
        const data = {
            id: instruccion.id,
            embarque_id: embarque?.id
        }

        const resp = await axios.post(url,data,{headers: { Authorization: `Bearer ${auth.access}` }})

        if(resp.status === 200){
            onCloseDialog()
            Swal.fire({
                title: 'Asignacion Exitosa',
                text: 'Se ha asignado correctamente la instruccion de entrega',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            })
            getData()
        }

        

    }



    useEffect(() => {
        getTransportesDisponibles()
        getInstruccionEntrega()
    }, []);

    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'clave', 
            header: 'Clave',
            size:80,
        },
        {
            accessorKey: 'descripcion',
            header: 'Descripcion',
            size:200,
        },
        {
            accessorKey: 'cantidad',
            header: 'Cantidad',
            size:80,
        },
    ]);

    return (
        <div className='asignacion_parcial_container'>
            <Box padding={2}>
                <Typography variant="h6" component="div">
                    Asignacion Parcial
                </Typography>
            </Box>
            <Divider />
            <Box>
                <Grid container spacing={2} padding={1}>
                    <Grid item xs={6}>
                        <Box >
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Embarque</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={embarque}
                                    label="Age"
                                    onChange={handleChange}
                                    variant='standard'
                                >
                                    {
                                    transportes.map((transporte) => (
                                        <MenuItem value={transporte}>{`${transporte.documento} - ${transporte.operador.nombre}`}</MenuItem>
                                    ))
                                }
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>
                </Grid>
                <Divider />
                {instruccion?.detalles &&
                    <Box component={"div"} sx={{display:'flex', flexDirection:"column",justifyContent:"space-between", margin:1}}>
                            <Box component={"div"}>
                                <MaterialReactTable
                                    columns={columns}   
                                    data = {detalles}
                                    getRowId={(originalRow) => originalRow.id}
                                    initialState={{ 
                                        density: 'compact',
                                        size:'small',
                                        
                                        }}
                                  
                                    enablePagination={false}
                                    enableRowVirtualization 
                                    enableTopToolbar={false}
                                    enableBottomToolbar={false}
                                    localization={MRT_Localization_ES}
                                 />
                                
                            </Box>
                            <Box component={"div"} sx={{
                                display:'flex',
                                flexDirection:"row",
                                justifyContent:"center",
                                alignItems:"center",
                                margin:1,
                            }}>
                            <Divider sx={{mb:2}} />
                                <Button  sx={{mr:8, ml:5 }} onClick={handleAsignar} disabled= {!embarque }>Asignar</Button>
                                <Button onClick={onCloseDialog}>Salir</Button>
                            </Box>
                    </Box>
        }
                </Box>
        </div>
    );
}

export default InstruccionEntregaForm;

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


import '../EnviosParciales.css';



const AsignacionParcialForm = ({rowSelected, onCloseDialog}) => {

    const {auth,sucursal} = useContext(ContextEmbarques);
    const [transportes, setTransportes] = useState([])
    const [envio, setEnvio] = useState(null);
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
                console.log(resp.data);
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                } 
            }
        }else{
            console.log('No esta autenticado')
        }    
    }

    const handleSaveCell = (cell, value) => {
        let detallesTemp = detalles
        let valor = Number(value)
        const saldo = Number(detallesTemp[cell.row.index]['saldo'])
        if (valor > saldo){
            valor = saldo
        }
        detallesTemp[cell.row.index]['enviar'] = valor
        detallesTemp[cell.row.index]['pendiente'] = saldo - valor
        setDetalles([...detallesTemp])  
    };

    const getEnvio = async ()=>{
        
        const envioId = Object.keys(rowSelected)[0]
        const url = `${apiUrl.url}embarques/envios_parciales/${envioId}/`
        const resp = await axios.get(url,{
            headers: { Authorization: `Bearer ${auth.access}` }
        })
        setEnvio(resp.data)
        if(resp.data.detalles){
            setDetalles(resp.data.detalles)
        }
       
    
    }

    const handleChange = (event) => {
        setEmbarque(event.target.value);
      };




    const handleAgregar = async() =>{
        
        const partidas = detalles.filter((detalle)=> detalle.enviar )
        const url = `${apiUrl.url}embarques/asignar_envios_parciales`
        const data = {
            embarque_id: embarque.id,
            envio_id: envio.id,
            detalles: partidas
        }
        
        onCloseDialog()

        if (partidas.length === 0){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'No se ha seleccionado ninguna partida',
              })
            return
        }

        Swal.fire({
            title: 'Asignacion de envios parciales',
            text: '¿Desea asignar el envío parcial?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
          }).then(async(result) => {
            if (result.isConfirmed) {
                const resp = await axios.post(url,data,{
                    headers: { Authorization: `Bearer ${auth.access}` }
                })

                if(resp.status === 200){
                    Swal.fire({
                        icon: 'success',
                        title: 'Envio parcial asignado',
                        text: `Envio ${envio.documento} asignado correctamente a ${embarque.operador.nombre}`,
                      })
                }
                
            }
          })

    }

    useEffect(() => {
        getTransportesDisponibles()
        getEnvio()
    }, []);

    const columns =useMemo(()=>[ 
        { 
            accessorKey: 'clave', 
            header: 'Clave',
            size:80,
            enableEditing: row => false
        },
        {
            accessorKey: 'me_descripcion',
            header: 'Descripcion',
            size:200,
            enableEditing: row => false
        },
        {
            accessorKey: 'me_cantidad',
            header: 'Cantidad',
            size:80,
            enableEditing: row => false
        },
        {
            accessorKey: 'saldo',
            header: 'Saldo',
            size:80,
            enableEditing: row => false
            
        },
        {
            
            accessorKey: 'enviar',
            header: 'Enviar',
            id: 'enviar',
            size:80,
            enableEditing: row => row.original.saldo > 0
          },
        {
            accessorKey: 'pendiente',
            header: 'Pendiente',
            size:80,
            enableEditing: row => false
        }
          

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
                {envio?.detalles &&
                    <Box component={"div"} sx={{display:'flex', flexDirection:"column",justifyContent:"space-between", margin:1}}>
                            <Box component={"div"}>
                                <MaterialReactTable
                                    columns={columns}   
                                    data = {detalles}
                                    //enableRowSelection= {(row)=> row.original.saldo > 0}
                                    //enableMultiRowSelection
                                    //enableSelectAll = {false}
                                    getRowId={(originalRow) => originalRow.id}
                                    initialState={{ 
                                        density: 'compact',
                                        size:'small',
                                        
                                        }}
                                  
                                    enablePagination={false}
                                    enableRowVirtualization 
                                    enableTopToolbar={false}
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
                                <Button  sx={{mr:8, ml:5 }} onClick={handleAgregar} disabled= {!embarque }>Asignar</Button>
                                <Button onClick={onCloseDialog}>Salir</Button>
                            </Box>
                    </Box>
        }
            </Box>
            
        </div>
    );
}

export default AsignacionParcialForm;

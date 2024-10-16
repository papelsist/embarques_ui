import React, {useEffect, useState, useMemo, useRef, useContext } from 'react';
import { Box, Button,IconButton,Tooltip} from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import Dialog from '@mui/material/Dialog';
import PublicIcon from '@mui/icons-material/Public';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeriodoLabel from '../../../../components/periodo_date_picker/PeriodoLabel';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';
import axios from 'axios';
import { apiUrl } from '../../../../conf/axios_instance';
import Swal from 'sweetalert2'
import AsignacionParcialForm from './AsignacionParcialForm';

const EnviosParcialesTable = ({datos, getData,setDatos}) => {
    const navigate = useNavigate()
    const [rowSelection, setRowSelection] = useState({});
    const [transporte, setTransporte] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const tableInstanceRef = useRef(); 
    const {auth, sucursal,setLoading} = useContext(ContextEmbarques);

    const refrescar = ()=>{
        setDatos([])
        getData()
    }

    const onCloseDialog = ()=>{
        setShowDialog(false)
        setRowSelection({})
    }

    const crearRuta = async ()=>{
       /*  setLoading(true)
        const rowSelection = tableInstanceRef.current.getState().rowSelection;
        const envios_ids = Object.keys(rowSelection).join(",")
        if(envios_ids){
            try{
                const url = `${apiUrl.url}ruteo/sugerencia_ruta_envios`        
                const resp = await axios.get(url, 
                    {params:{envios:envios_ids, sucursal: sucursal.nombre},
                    headers: { Authorization: `Bearer ${auth.access}` }
                    })
                console.log("Antes de navegar al ruteo ...")
                navigate("/embarques/ruteo" , { state: resp.data })
                console.log("Navegando hacia el ruteo ....")
                setLoading(false)
        
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
            }}
        } */
      
}



const asignar = (transporte) =>{
    const rowSelection = tableInstanceRef.current.getState().rowSelection;
    console.log(rowSelection);
    //setShowDialog(false)
   /*  const rowSelection = tableInstanceRef.current.getState().rowSelection;
    console.log(Object.keys(rowSelection))
    Swal.fire({
        title: `Asignación de Ruta `,
        text: `Asignar ruta a embarque ${"ruta.embarque.documento"} ? `,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
      }).then(async(result)=>{
            if(result.isConfirmed){  
               setLoading(true)
                const url = `${apiUrl.url}embarques/asignar_evios_pendientes`
                const data ={
                    embarque_id: transporte.id,
                    envios: Object.keys(rowSelection)
                }
                const resp = await axios.post(url,data,{headers: { Authorization: `Bearer ${auth.access}` }}) 
                setLoading(false) 
                setRowSelection({})
                refrescar()
            }
      })  */  
}

const mostrarDialog =()=>{
    const rowSelection = tableInstanceRef.current.getState().rowSelection;
    setRowSelection(rowSelection)
    if (Object.keys(rowSelection).length !== 0)
        setShowDialog(true)

    /* 
    const envios_ids = Object.keys(rowSelection).join(",")
    console.log(Object.keys(rowSelection))
    if(envios_ids){
        setShowDialog(true)
        console.log(envios_ids)
    }
    */ 
}


const columns=useMemo(()=>[
    { 
        accessorKey: 'documento', 
        header: 'Documento',
        size:80,
    },
    {   accessorKey:'fecha_documento',
        header:'Fecha',
        size:90,
        Cell:({cell})=>(new Date(cell.getValue()).toLocaleDateString())
    },
    {   accessorKey:'instruccion.fecha_de_entrega',
        header:'Entrega',
        size:90,
        Cell:({cell})=>(new Date(cell.getValue()).toLocaleDateString())
    },
    { 
        accessorKey: 'destinatario', 
        header: 'Destinatario', 
        size:200,
    },
    { 
        accessorKey: 'kilos', 
        header: 'Kilos',
        size:80,
    },
    { 
        accessorKey: 'instruccion.direccion_codigo_postal',
        header: 'Direccion',
        Cell: ({ row }) => {

            let direccion = ''
                let instruccion = row.original.instruccion;
                if (row.original.instruccion.sx_transporte){
                    instruccion = row.original.instruccion.sx_transporte
                    direccion = `${row.original.instruccion.sx_transporte.nombre} - `
                }
                direccion +=  `${instruccion.direccion_calle} ${ instruccion.direccion_numero_exterior} C.P. ${instruccion.direccion_codigo_postal} Mun.${instruccion.direccion_municipio}`;
                return   <Box
                component="span"
                sx={(theme) => ({
                  color:
                  row.original.instruccion.sx_transporte
                      && theme.palette.error.dark,
                })}
              >
                {direccion}
              </Box>;
                
        },
        size:300,
    },
    { 
        accessorKey: 'instruccion.sector', 
        header: 'Sector',
        size:80,
    },
    { 
        accessorKey: 'instruccion.distancia', 
        header: 'Distancia',
        size:80,
    },

])

    return (
        <div className='contenedor-pendientes-table '>
        <MaterialReactTable
            columns={columns}   
            data = {datos}
            enableMultiRowSelection = {false}
            enableRowSelection
            onRowSelectionChange={setRowSelection}
            positionToolbarAlertBanner="none"
            state={{ rowSelection }}
            getRowId={(originalRow) => originalRow.id}
            muiTableContainerProps={{ sx: { maxHeight: '80vh' , minHeight: '80vh'} }}
            initialState={{ 
                density: 'compact',
                size:'small',
                
                }}
            enableColumnOrdering
            enablePagination={false}
            enableRowVirtualization 
            enableBottomToolbar={false}
            localization={MRT_Localization_ES}
            renderTopToolbarCustomActions={({ table }) => (
                <div className='pendientes-header-container'>
                    <Box>
                        Envios Parciales
                    </Box>
                    <PeriodoLabel getData={refrescar}/>
                    <Box>
                        <Tooltip title="Refrescar">
                            <IconButton onClick={refrescar}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Asignar">
                            <IconButton onClick={mostrarDialog}>
                                <LocalShippingIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </div>
                
            )} 
            enableRowActions 
            enableColumnResizing
            positionActionsColumn="last"
            renderRowActions={({
                row
            }) => <div style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '0.5rem',
            
            }}>
                </div>}  
            tableInstanceRef={tableInstanceRef}
        />
        <Dialog 
        open={showDialog} 
        onClose={onCloseDialog}
        fullWidth={true}
        maxWidth={'md'}
        maxHeight={'md'}
        sx={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', height:'100vh'}}
        >
           <AsignacionParcialForm rowSelected={rowSelection} onCloseDialog={onCloseDialog} />
        </Dialog>
        </div>
    );
}

export default EnviosParcialesTable;

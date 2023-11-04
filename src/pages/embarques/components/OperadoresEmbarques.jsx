import React, { useContext, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ListItemIcon from '@mui/material/ListItemIcon';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { List, Paper, Typography,IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

import axios from 'axios';
import { apiUrl } from '../../../conf/axios_instance';
import { useNavigate } from 'react-router-dom';
import { ContextEmbarques } from '../../../context/ContextEmbarques';
import { objectIsEmpty } from '../../../utils/embarqueUtils';



const OperadoresEmbarques = () => {
    const {auth,sucursal} = useContext(ContextEmbarques);
    const [datos, setDatos] = useState([]);
    const navigate = useNavigate() 
    
    const handleRefresh = ()=>{
        getData()
    }

    const getData = async ()=>{
        if(objectIsEmpty(auth)){
            try{
                const url = `${apiUrl.url}embarques/pendientes_salida`
                const resp = await axios.get(url,{
                    params: {sucursal: sucursal.id},
                    headers: { Authorization: `Bearer ${auth.access}` }
                } )
                setDatos(resp.data)
            }catch(error){
                if(error.response?.status === 401){
                    navigate(`../../login`)
                } 
            }
        }else{
            console.log('No esta autenticado')
            navigate(`../../login`)
        } 

    }

    useEffect(() => {
        getData()
    
    }, []);
    return (
        <>
            
            <Paper
                sx={{ width: '100%', height: '99%', maxHeight: '99%', overflow: 'auto' , bgcolor: 'background.paper', padding:'0 .5rem' }}
                >  
                <List
                    subheader={<ListSubheader><span style={{fontSize:"1.2rem", fontWeight:"bold"}}>Embarques disponibles</span> <IconButton onClick={handleRefresh}><RefreshIcon/></IconButton></ListSubheader>}
                >
                    
                {
                    datos.map((embarque)=> 
                    <ListItem component="div" disablePadding key={embarque.id}>
                        <ListItemButton>
                        <ListItemIcon>
                            <LocalShippingIcon />
                        </ListItemIcon>
                        <ListItemText primary={`${embarque.documento} - ${embarque.operador.nombre}`} />
                        </ListItemButton>
                    </ListItem>
                    )
                }
                </List>
            </Paper>
        </>
    );
}

export default OperadoresEmbarques;

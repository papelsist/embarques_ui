import React, { useContext } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import "./NoAsignados.css"
import { ContextRuteo } from '../../../context/ContextRuteo';

const NoAsignados = () => {
    const{noAsignados} = useContext(ContextRuteo)
    return (
        <div className='no-asignados-container'>
            <List 
                sx={{ width: '96%', bgcolor: 'background.paper', maxHeight: 320, overflow: 'auto', }}
                component="nav"
                 aria-labelledby="noasignados-subheader"
                 subheader={
                     <ListSubheader component="div" id="noasignados-subheader">
                         No Asignados
                         <Divider  />
                     </ListSubheader>
                 }
            
            > 
                         {noAsignados && noAsignados.map((noAsignado)=>(
                            <div key={noAsignado.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" /> */}
                                </ListItemAvatar>
                                <ListItemText
                                primary= {`${noAsignado.destinatario}`}
                                secondary={
                                    <>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {`Documento - ${noAsignado.documento}:`}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="p"
                                        color="text.primary"
                                    >
                                        {`Dir: ${noAsignado.instruccion.direccion_calle} ${noAsignado.instruccion.direccion_numero_exterior} ${noAsignado.instruccion.direccion_numero_interior?noAsignado.instruccion.direccion_numero_interior:""} `}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="p"
                                        color="text.primary"
                                    >
                                        {`${noAsignado.instruccion.direccion_colonia} ${noAsignado.instruccion.direccion_codigo_postal} ${noAsignado.instruccion.direccion_municipio}  ${noAsignado.instruccion.direccion_estado}`}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="p"
                                        color="text.primary"
                                    >
                                        {`Kilos: ${noAsignado.kilos}`}
                                    </Typography>
                                    
                                    </>
                                }
                                />
                            </ListItem>
                            <Divider  component="li" />
                            </div>

                        ))}
                    </List>
        </div>
    );
}

export default NoAsignados;

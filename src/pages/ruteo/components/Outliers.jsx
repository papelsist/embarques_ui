import React, {useContext} from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListSubheader from '@mui/material/ListSubheader';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import "./Outliers.css"
import { ContextRuteo } from '../../../context/ContextRuteo';

const Outliers = () => {
    const{outliers} = useContext(ContextRuteo)
    return (
        <div className='outliers-container'>
             <List 
                 sx={{ width: '96%', bgcolor: 'background.paper', maxHeight:320, overflow: 'auto', }}
                 component="nav"
                 aria-labelledby="outliers-subheader"
                 subheader={
                     <ListSubheader component="div" id="outliers-subheader">
                         Fuera de Rango
                         <Divider  />
                     </ListSubheader>
                 }
             > 
                        {outliers && outliers.map((outlier)=>(
                            <div key={outlier.id}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" /> */}
                                </ListItemAvatar>
                                <ListItemText
                                primary= {`${outlier.destinatario}`}
                                secondary={
                                    <>
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {`Documento - ${outlier.documento}:`}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="p"
                                        color="text.primary"
                                    >
                                        {`Dir: ${outlier.instruccion.direccion_calle} ${outlier.instruccion.direccion_numero_exterior} ${outlier.instruccion.direccion_numero_interior?outlier.instruccion.direccion_numero_interior:""} `}
                                    </Typography>
                                    <Typography
                                        sx={{ display: 'block' }}
                                        component="span"
                                        variant="p"
                                        color="text.primary"
                                    >
                                        {`${outlier.instruccion.direccion_colonia} ${outlier.instruccion.direccion_codigo_postal} ${outlier.instruccion.direccion_municipio}  ${outlier.instruccion.direccion_estado}`}
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

export default Outliers;

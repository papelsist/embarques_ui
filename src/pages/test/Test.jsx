import React from 'react';
import { Toolbar, Grid  } from '@mui/material';
import InputField from '../../components/InputField/InputField';
import PrintIcon from '@mui/icons-material/Print';



import "./Test.css"


const Test = () => {

    const onChange = ()=>{
        console.log("change")
    }

    return (
        <>
            <Toolbar className="toolbar"/>
            <h1>Test</h1>
            
            <Grid container columnSpacing={2}    
                        sx={{
                                display: 'flex' ,
                                '& .MuiTextField-root': { ml: 1},
                            }}
                    >
                    <Grid item xs={6}>
                    <InputField onChange={onChange} label ={"Nombre"} leftIcon={<PrintIcon />} />    
                    </Grid>
            </Grid>
       
        </>
        
    );
}

export default Test;

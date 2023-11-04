import React, { useContext, useState } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {Fab, Dialog, Box} from '@mui/material';
import { ContextEmbarques } from '../../context/ContextEmbarques';

import './PeriodoLabel.css'

const PeriodoLabel = () => {

    const {periodo, setPeriodo} = useContext(ContextEmbarques);
    const [openDialog, setOpenDialog] = useState(false);
    const [newPeriodo, setNewPeriodo] = useState(periodo);

    const handleClickLabel = () =>{
        setOpenDialog(true)
    }

    const handleSelectorChange = (e) =>{
        if( e.target.value){
             setNewPeriodo({
                 ...newPeriodo,
                 [e.target.name]: e.target.value
             })
        }
     }
 
     const changePeriodo = () =>{
        setPeriodo(newPeriodo)
        localStorage.setItem("periodo", JSON.stringify(newPeriodo))
        setOpenDialog(false)
    
     }

     const closeSelector = () =>{
        setOpenDialog(false)
    }

    return (
        <>
             <div className='periodo__label' onClick={handleClickLabel}> 
                Periodo del {periodo.fecha_inicial} al {periodo.fecha_final} 
                <CalendarTodayIcon />  
             </div>
              <Dialog open={openDialog} onClose={()=>{setOpenDialog(false)}}  >
                <div className='periodo__selector'>
                        <div className="periodo_selector__header">
                            <p> Seleccione un periodo:</p>
                        </div>
                        <div className="periodo_selector__body">
                        <input type="date" id="fecha_inicial" name="fecha_inicial" onChange = {handleSelectorChange} value={newPeriodo.fecha_inicial}  className="periodo__input"/>
                        <input type="date" id="fecha_final" name ="fecha_final" onChange = {handleSelectorChange} value={newPeriodo.fecha_final}  className="periodo__input"/>
            
                        </div>
                        <div className="periodo_selector__actions">
                            <button onClick={changePeriodo} className='periodo_selector__actions-button'> Aceptar </button>
                            <button onClick={closeSelector} className='periodo_selector__actions-button'> Cancelar </button>
                        </div>
                    </div> 
            </Dialog>
        </>
    );
}

export default PeriodoLabel;

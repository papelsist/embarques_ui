import React, {useState} from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';



import './PeriodoDatePicker.css'
const PeriodoDatepicker = ({periodo, setPeriodo}) => {

    const [newPeriodo, setNewPeriodo] = useState(periodo);
    const [showSelector, setShowSelector] = useState(false);
    const handleClickLabel = () =>{
        setShowSelector(!showSelector)
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
        setShowSelector(false)
    }

    const closeSelector = () =>{
        setShowSelector(false)
    }
  
    return (
        <div className='datePicker__container'>
                <div className='datePicker__label' onClick={handleClickLabel}> Periodo del {periodo.fecha_inicial} al {periodo.fecha_final} <CalendarTodayIcon />  </div>
                {showSelector ? <div className='datePicker__selector'>
                    <div className="selector__header">
                        <p> Seleccione un periodo:</p>
                    </div>
                    <div className="selector__body">
                    <input type="date" id="fecha_inicial" name="fecha_inicial" onChange = {handleSelectorChange} value={newPeriodo.fecha_inicial}  className="datepicker__input"/>
                    <input type="date" id="fecha_final" name ="fecha_final" onChange = {handleSelectorChange} value={newPeriodo.fecha_final}  className="datepicker__input"/>
        
                    </div>
                    <div className="selector__actions">
                        <button onClick={changePeriodo} className='selector__actions-button'> Aceptar </button>
                        <button onClick={closeSelector} className='selector__actions-button'> Cancelar </button>
                    </div>
                </div> : null}
        </div>
    );
}

export default PeriodoDatepicker;

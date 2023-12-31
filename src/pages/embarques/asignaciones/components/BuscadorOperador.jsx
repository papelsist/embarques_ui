import React, {useState,useMemo, useContext } from 'react';
import axios from 'axios'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';



const BuscadorOperador = ({setFound, apiUrl, searchField, label }) => {

    const {auth} = useContext(ContextEmbarques);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    
    const search = useMemo(
        () =>
          debounce((newInputValue) => {
            setInputValue(newInputValue)
            getData(newInputValue)
          }, 500),
        [],
      );

    const getData = async(input) =>{
        const params = {
            [searchField]: input
        }
         const datos = await axios({
            method: 'get',
            url: apiUrl,
            params: params,
            headers: { Authorization: `Bearer ${auth.access}` }
          });
        setOptions(datos.data)     
    }

    return (
      <Autocomplete
          disablePortal
          getOptionLabel={(option) =>
            typeof option === 'string' ? option : `${option.nombre}`
          }
          id="buscador_debounce"
          options={options}
          sx={{ ml:1, mr:1 }}
          renderInput={(params) => <TextField {...params} label={label} variant="standard"  />}
          onInputChange={(event, newInputValue) => {
            search(newInputValue)
          }}
          noOptionsText="No hay información"
          value={ inputValue}
          isOptionEqualToValue={(option, value) => option.title === value.title}
          onChange={(event, newValue) => {
            setFound(newValue)
          }}
      />
    );
}

export default BuscadorOperador;

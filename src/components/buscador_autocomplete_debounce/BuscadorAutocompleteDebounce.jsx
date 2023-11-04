import React, {useState,useMemo } from 'react';
import axios from 'axios'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';


import './BuscadorAutoCompleteDebounce.css'

const BuscadorAutocompleteDebounce = ({setFound, apiUrl, searchField, label }) => {
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
            params: params
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
          sx={{ width:300 }}
          renderInput={(params) => <TextField {...params} label={label} variant="standard"  fullWidth/>}
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

export default BuscadorAutocompleteDebounce;

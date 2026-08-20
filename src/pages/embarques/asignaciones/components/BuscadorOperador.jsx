import React, { useState, useMemo, useContext } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { debounce } from '@mui/material/utils';
import { ContextEmbarques } from '../../../../context/ContextEmbarques';

const dedupeById = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

const BuscadorOperador = ({ setFound, apiUrl, searchField, label }) => {
    const { auth } = useContext(ContextEmbarques);
    const [value, setValue] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const getData = async (input) => {
        if (!input || input.trim().length < 2) {
            setOptions([]);
            return;
        }
        setLoading(true);
        try {
            const params = {
                [searchField]: input.trim(),
            };
            const datos = await axios({
                method: 'get',
                url: apiUrl,
                params,
                headers: { Authorization: `Bearer ${auth.access}` },
            });
            setOptions(dedupeById(datos.data || []));
        } catch (error) {
            console.error('Error al buscar operador:', error);
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const search = useMemo(
        () =>
            debounce((newInputValue) => {
                getData(newInputValue);
            }, 400),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [apiUrl, searchField, auth?.access]
    );

    return (
        <Autocomplete
            disablePortal
            id="buscador_operador"
            options={options}
            loading={loading}
            value={value}
            inputValue={inputValue}
            filterOptions={(x) => x}
            getOptionLabel={(option) => {
                if (!option) return '';
                if (typeof option === 'string') return option;
                return option.nombre || '';
            }}
            isOptionEqualToValue={(option, selected) =>
                Boolean(option?.id && selected?.id && option.id === selected.id)
            }
            noOptionsText={
                inputValue.trim().length < 2
                    ? 'Escribe al menos 2 caracteres'
                    : 'No hay información'
            }
            sx={{ ml: 1, mr: 1 }}
            renderInput={(params) => (
                <TextField {...params} label={label} variant="standard" />
            )}
            onInputChange={(event, newInputValue, reason) => {
                setInputValue(newInputValue);
                if (reason === 'input' || reason === 'clear') {
                    search(newInputValue);
                }
            }}
            onChange={(event, newValue) => {
                setValue(newValue);
                setFound(newValue);
            }}
        />
    );
};

export default BuscadorOperador;

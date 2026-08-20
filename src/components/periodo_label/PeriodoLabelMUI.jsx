import React, { useContext, useState } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { ContextEmbarques } from '../../context/ContextEmbarques';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const toDayjs = (value) => {
    if (!value) return null;
    if (dayjs.isDayjs(value)) return value.isValid() ? value : null;
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
};

const formatFecha = (value) => {
    const fecha = toDayjs(value);
    return fecha ? fecha.format('DD/MM/YYYY') : '—';
};

const PeriodoLabelMUI = ({
    isFullscreen = false,
    fontSize = '1.05rem',
    color = 'text.primary',
    sx = {},
}) => {
    const { periodo, setPeriodo } = useContext(ContextEmbarques);
    const [openDialog, setOpenDialog] = useState(false);
    const [newPeriodo, setNewPeriodo] = useState({
        fecha_inicial: toDayjs(periodo?.fecha_inicial),
        fecha_final: toDayjs(periodo?.fecha_final),
    });

    const dialogZIndex = isFullscreen ? 13000 : 1300;
    const pickerZIndex = isFullscreen ? 14000 : 1500;

    const datePickerSlotProps = {
        textField: {
            fullWidth: true,
        },
        popper: {
            disablePortal: false,
            style: { zIndex: pickerZIndex },
            sx: {
                zIndex: `${pickerZIndex} !important`,
            },
        },
        desktopPaper: {
            sx: {
                zIndex: pickerZIndex,
            },
        },
    };

    const handleClickLabel = () => {
        setNewPeriodo({
            fecha_inicial: toDayjs(periodo.fecha_inicial),
            fecha_final: toDayjs(periodo.fecha_final),
        });
        setOpenDialog(true);
    };

    const handleSelectorChange = (fieldName, value) => {
        if (!value || !dayjs(value).isValid()) return;
        setNewPeriodo((prev) => ({
            ...prev,
            [fieldName]: dayjs(value),
        }));
    };

    const changePeriodo = () => {
        const fechaInicial = toDayjs(newPeriodo.fecha_inicial);
        const fechaFinal = toDayjs(newPeriodo.fecha_final);
        if (!fechaInicial || !fechaFinal) return;

        const nextPeriodo = {
            fecha_inicial: fechaInicial.format('YYYY-MM-DD'),
            fecha_final: fechaFinal.format('YYYY-MM-DD'),
        };
        setPeriodo(nextPeriodo);
        localStorage.setItem('periodo', JSON.stringify(nextPeriodo));
        setOpenDialog(false);
    };

    const closeSelector = () => {
        setOpenDialog(false);
    };

    return (
        <>
            <Button
                variant="text"
                onClick={handleClickLabel}
                startIcon={<CalendarTodayIcon sx={{ fontSize: 'inherit' }} />}
                sx={{
                    textTransform: 'none',
                    px: 0,
                    minWidth: 'auto',
                    fontSize,
                    color,
                    '& .MuiButton-startIcon': {
                        color: 'inherit',
                        marginRight: 0.75,
                        '& > *:nth-of-type(1)': {
                            fontSize: '1.1em',
                        },
                    },
                    ...sx,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: 'inherit',
                            color: 'inherit',
                            lineHeight: 1.4,
                        }}
                    >
                        Periodo del {formatFecha(periodo.fecha_inicial)} al {formatFecha(periodo.fecha_final)}
                    </Typography>
                </Box>
            </Button>
            <Dialog
                open={openDialog}
                onClose={closeSelector}
                fullWidth
                maxWidth="xs"
                disablePortal={false}
                container={isFullscreen ? document.body : undefined}
                sx={{
                    zIndex: dialogZIndex,
                    '& .MuiBackdrop-root': {
                        zIndex: isFullscreen ? dialogZIndex - 1 : dialogZIndex,
                    },
                    '& .MuiDialog-container': {
                        zIndex: dialogZIndex,
                    },
                    '& .MuiDialog-paper': {
                        zIndex: dialogZIndex,
                        overflow: 'visible',
                    },
                }}
            >
                <DialogTitle>Selecciona un periodo</DialogTitle>
                <DialogContent sx={{ overflow: 'visible' }}>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <DatePicker
                            label="Fecha inicial"
                            value={newPeriodo.fecha_inicial}
                            onChange={(value) => handleSelectorChange('fecha_inicial', value)}
                            desktopModeMediaQuery="(min-width: 0px)"
                            slotProps={datePickerSlotProps}
                        />
                        <DatePicker
                            label="Fecha final"
                            value={newPeriodo.fecha_final}
                            onChange={(value) => handleSelectorChange('fecha_final', value)}
                            desktopModeMediaQuery="(min-width: 0px)"
                            slotProps={datePickerSlotProps}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeSelector}>Cancelar</Button>
                    <Button variant="contained" onClick={changePeriodo}>Aceptar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PeriodoLabelMUI;

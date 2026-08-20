import React from 'react';
import {
    Box,
    Typography,
    Divider,
    IconButton,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Slide,
    Backdrop,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PANEL_WIDTH = '35%';

const formatDireccion = (instruccion) => {
    if (!instruccion) return null;
    const partes = [
        instruccion.direccion_calle,
        instruccion.direccion_numero_exterior,
        instruccion.direccion_colonia,
        instruccion.direccion_codigo_postal ? `C.P. ${instruccion.direccion_codigo_postal}` : null,
        instruccion.direccion_municipio,
        instruccion.direccion_estado,
    ].filter(Boolean);
    return partes.length ? partes.join(', ') : null;
};

const InfoRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ mb: 1.25 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    );
};

const EnvioDetalleLateral = ({
    open,
    onClose,
    envio,
    loading = false,
}) => {
    const detalles = envio?.detalles || [];
    const instruccion = envio?.instruccion;

    return (
        <>
            <Backdrop
                open={open}
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1200,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }}
            />
            <Slide direction="left" in={open} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: PANEL_WIDTH,
                        minWidth: PANEL_WIDTH,
                        maxWidth: PANEL_WIDTH,
                        height: '100%',
                        zIndex: 1201,
                        bgcolor: 'background.paper',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        borderTopLeftRadius: 12,
                        borderBottomLeftRadius: 12,
                        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5,
                            borderBottom: 1,
                            borderColor: 'divider',
                            flexShrink: 0,
                            height: 64,
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                Detalle del envío
                            </Typography>
                            {envio?.documento && (
                                <Typography variant="caption" color="text.secondary">
                                    Doc. {envio.documento}
                                </Typography>
                            )}
                        </Box>
                        <IconButton onClick={onClose} size="small" aria-label="Cerrar">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            width: '100%',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {loading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1.5,
                                    bgcolor: 'background.paper',
                                    zIndex: 1,
                                }}
                            >
                                <CircularProgress size={36} />
                                <Typography variant="body2" color="text.secondary">
                                    Cargando información...
                                </Typography>
                            </Box>
                        )}

                        {!envio && !loading ? (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body2" color="text.secondary" textAlign="center">
                                    No hay información disponible
                                </Typography>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    minHeight: 0,
                                    visibility: loading ? 'hidden' : 'visible',
                                }}
                            >
                                <Box sx={{ px: 2, pt: 2, pb: 1, flexShrink: 0 }}>
                                    <InfoRow label="Destinatario" value={envio?.destinatario} />
                                    <InfoRow label="Dirección" value={formatDireccion(instruccion)} />
                                    <InfoRow label="Contacto" value={instruccion?.contacto} />
                                    <InfoRow label="Teléfono" value={instruccion?.telefono} />
                                    <InfoRow label="Horario" value={instruccion?.horario} />
                                </Box>

                                <Divider sx={{ flexShrink: 0 }} />

                                <Box sx={{ px: 2, pt: 1.5, pb: 0.5, flexShrink: 0 }}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Partidas ({detalles.length})
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 2, pb: 2 }}>
                                    {detalles.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            Sin partidas
                                        </Typography>
                                    ) : (
                                        <List dense disablePadding>
                                            {detalles.map((detalle, index) => (
                                                <React.Fragment key={detalle.id || index}>
                                                    <ListItem
                                                        alignItems="flex-start"
                                                        sx={{
                                                            px: 0,
                                                            py: 1,
                                                            flexDirection: 'column',
                                                            alignItems: 'stretch',
                                                        }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {detalle.clave || 'Sin clave'} — {detalle.me_descripcion || detalle.descripcion || 'Sin descripción'}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Cant: {detalle.me_cantidad ?? detalle.cantidad ?? '—'}
                                                                    </Typography>
                                                                    {detalle.saldo != null && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Saldo: {detalle.saldo}
                                                                        </Typography>
                                                                    )}
                                                                    {detalle.me_kilos != null && (
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Kg: {detalle.me_kilos}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {index < detalles.length - 1 && <Divider />}
                                                </React.Fragment>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Slide>
        </>
    );
};

export default EnvioDetalleLateral;

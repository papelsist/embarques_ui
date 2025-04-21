import React, {useState, useEffect} from 'react';
import { MapContainer, TileLayer, useMap,Marker,Popup, Polygon,Circle,Polyline, useMapEvent } from 'react-leaflet'
import { LogoIcon,TruckIcon, OfficeIcon,TruckIco7, TruckIco6,  } from './iconos_mapa';
import CamionetaIcon from '../camioneta/camioneta_icon';

const MapController = ({center})=> {
  const latlng= {lat: center.latitud, lng: center.longitud}
  const map = useMap()
  map.setZoom(13)
  map.flyTo(latlng,map.getZoom())
  return null
}

const styles = { 
    height: '100%', 
    width: '100%' ,
}
const options = { color: 'blue', weight: 2, stroke:true }


    const voronoi = [
        [
            [19.41949068, -99.13598377],
            [19.41545035, -99.14157853],
            
        ],
        [
            [19.41949068, -99.13598377],
            [19.42413298, -99.09726585],
        ],
        [
            [19.42413298, -99.09726585],
            [19.39778281, -99.10048514],
        ],
        [
            [19.39778281, -99.10048514],
            [19.3139416, -99.23940675],
        ],
        [
            [19.39778281, -99.10048514],
            [19.31443, -99.02442],
        ],
        [
            [19.42413298, -99.09726585],
            [19.57416297,-99.04274947],
        ],
        [
            [19.41949068, -99.13598377],
            [19.44167901, -99.16104601],
        ],
        [
            [19.43956721, -99.16379499],
            [19.44167901, -99.16104601],
        ],
        [
            [19.43956721, -99.16379499],
            [19.41545035, -99.14157853],
        ],
        [
            [19.3139416, -99.23940675],
            [19.41545035, -99.14157853],
        ],
        [
            [19.44167901, -99.16104601],
            [19.57416297,-99.04274947],
        ],
        [
            [19.43956721, -99.16379499],
            [19.31463,-99.34435],
        ],
        [
            [19.3139416, -99.23940675],
            [19.25571,-99.32492],
        ],
        
       
      ]


const MapaLocalizacion = ({puntos,center,showVoronoi = false, layer="OPENSTREETMAP"}) => { 
    
    

  
    return (
        <MapContainer center={[center.latitud, center.longitud]} zoom={12} scrollWheelZoom={false} 
        style={styles} >
                {
                    layer == "OPENSTREETMAP" &&
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                }
                {
                    layer == "GOOGLECALLES" &&
                    <TileLayer
                        attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                        url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                    />
                 }
                {puntos.map((punto)=>(
                    <Marker 
                        key={punto.nombre} 
                        icon={punto.tipo == "EMPRESA" ? LogoIcon : punto.tipo == "DESTINO" ? OfficeIcon : TruckIco7}  
                        position={[punto.latitud, punto.longitud]}>
                    <Popup>
                        {punto.nombre}
                    </Popup>
                    </Marker>
                )) }
                <MapController center={center}/>
                {   
                    showVoronoi &&
                    <Polyline pathOptions={options} positions={voronoi} />
                }
                
        </MapContainer>  
    );
}

export default MapaLocalizacion;

import { Icon } from 'leaflet';
import TruckPng from "../../assets/mapicons/truck3.png";
import  OfficePng from "../../assets/mapicons/office-building.png";
import PapelPng from "../../assets/mapicons/papel-suc.png"
import LogoPng from "../../assets/mapicons/logo-papel.png"




export const TruckIcon = new Icon({
    iconUrl: TruckPng,
    iconSize: [30,30]
  })

export const  OfficeIcon = new Icon({
    iconUrl: OfficePng,
    iconSize: [30,30]
    })

export const  PapelIcon = new Icon({
    iconUrl: PapelPng,
    iconSize: [24,20]
    })

export const  LogoIcon = new Icon({
    iconUrl: LogoPng,
    iconSize: [35,20]
    })
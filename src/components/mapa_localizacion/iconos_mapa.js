import { Icon } from 'leaflet';
import TruckPng from "../../assets/mapicons/truck3.png";
import  OfficePng from "../../assets/mapicons/office-building.png";
import PapelPng from "../../assets/mapicons/papel-suc.png"
import LogoPng from "../../assets/mapicons/logo-papel.png"
import truc from "../../assets/mapicons/truck.svg"
import dtruck from "../../assets/mapicons/dtruck.svg"
import truck142 from "../../assets/mapicons/truck-142.svg"
import truck144 from "../../assets/mapicons/truck-144.svg"




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

export const  TruckIcon1 = new Icon({
    iconUrl: truc,
    iconSize: [20,20]
    })

export const  TruckIcon3 = new Icon({
    iconUrl: dtruck,
    iconSize: [30,30]
    })

export const  TruckIcon4 = new Icon({
    iconUrl: truck142,
    iconSize: [30,30]
    })

export const  TruckIco5 = new Icon({
    iconUrl: truck144,
    iconSize: [30,30]
    })
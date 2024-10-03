import React, {useState } from 'react';
import  { ContextEmbarques } from './ContextEmbarques';


const hoy =  new Date();
const hoy2 = new Date();
const antes = new Date(hoy2.setDate(hoy2.getDate() -7))
const mañana = new Date(hoy.setDate(hoy.getDate() + 1))
const periodoInicial = {
    fecha_inicial: antes.toISOString().slice(0, 10),
    fecha_final: mañana.toISOString().slice(0, 10)
} 

const sucursales = [
    {nombre: "ANDRADE", latitud:19.421601, longitud:-99.1454862, tipo: "EMPRESA"},
    {nombre: "BOLIVAR", latitud:19.4286673, longitud:-99.1392302, tipo: "EMPRESA"},
    {nombre: "CALLE 4", latitud:19.3598997, longitud:-99.1068492, tipo: "EMPRESA"},
    {nombre: "TACUBA", latitud:19.4618881, longitud:-99.1764352, tipo: "EMPRESA"},
    {nombre: "CF5FEBRERO", latitud:19.4098067, longitud:-99.1369688,tipo: "EMPRESA"},
    {nombre: "VERTIZ 176", latitud:19.4198486, longitud:-99.1473885,tipo: "EMPRESA"},
    {nombre: "ZARAGOZA", latitud:19.4006695, longitud:-99.0621798,tipo: "EMPRESA"},                 
]


const EmbarquesProvider = ({children}) =>{

    let authObj = {}
    let sucursalObj = {}
    const authStorage = JSON.parse(localStorage.getItem('auth'))

    if(authStorage){
        const {access, refresh,username,nombres,sucursal: authSucursal, user_permissions: permisos,groups: grupos  } = authStorage
        //console.log(grupos);
       
        let controlador = grupos.filter((grupo)=> grupo.name == 'controladores').length > 0
        let rol = null
        if (controlador) {
            rol = 'controlador'
        }
       
        authObj ={access: access, refresh: refresh,username: username,nombres: nombres,permisos : permisos, sucursal: authSucursal, grupos: grupos,rol: rol}     
        sucursalObj = authSucursal
      
    }
    
    const [periodo, setPeriodo] = useState(periodoInicial)
    const [sucursal, setSucursal] = useState(sucursalObj)
    const [auth,setAuth] = useState(authObj)
    const [loading, setLoading] = useState(false);

    const contextIni = {
        sucursal,
        sucursales,
        loading,
        setLoading: (loading)=>setLoading(loading),
        setSucursalCtx : (suc) => setSucursalCtx(suc),
        periodo,
        setPeriodo: (per)=> setPeriodo(per) ,
        auth,
        setAuth: (a)=> setAuth(a),
        setSucursal: (s)=> setSucursal(s)
    }

    return (
        <ContextEmbarques.Provider value={contextIni}>
            {children}
        </ContextEmbarques.Provider>
    )

}

export default EmbarquesProvider;

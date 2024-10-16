import MainLayout from "../layout/main/MainLayout"
import EmbarquesLayout from "../layout/embarques/EmbarquesLayout";
import Embarques from "../pages/embarques/Embarques";
import Asignaciones from "../pages/embarques/asignaciones/Asignaciones";
import EmbarqueForm from "../pages/embarques/asignaciones/asignaciones_form/EmbarqueForm";
import Regresos from "../pages/embarques/regresos/Regresos";
import Transito from "../pages/embarques/transito/Transito";
import EntregasForm from "../pages/embarques/transito/transito_form/EntregasForm";
import RegresosForm from "../pages/embarques/regresos/regresos_form/RegresosForm";
import EnviosPendientes from "../pages/embarques/envios_pendientes/EnviosPendientes";
import Ruteo from "../pages/ruteo/Ruteo";
import RuteoProvider from "../context/RuteoProvider";
import Incidencias from "../pages/incidencias/Incidencias";
import EnviosParciales from "../pages/embarques/envios_parciales/EnviosParciales";
import Pasan from "../pages/embarques/pasan/Pasan";


const EmbarquesRouter =  {
    path:"/embarques",
    element:<MainLayout />,
    children:[
     {
      path:"",
      element: <EmbarquesLayout />,
      children:[
        {
          index:true,
          element:<Embarques />
        },
        {
          path:"asignaciones",
          element:<Asignaciones />
        },
        {
          path:"asignaciones/create/:id",
          element:<EmbarqueForm />
        },
        {
          path:"transito",
          element:<Transito />
        },
        {
          path:"transito/entregas/:id",
          element:<EntregasForm />
        },
        {
          path:"regresos",
          element:<Regresos />
        },
        {
          path:"regresos/regresos_view/:id",
          element:<RegresosForm />
        },
        {
          path:"envios_pendientes",
          element:<EnviosPendientes />
        },
        {
          path:"ruteo",
          element:<RuteoProvider><Ruteo/></RuteoProvider>
        },
        {
          path:"incidencias",
          element:<RuteoProvider><Incidencias/></RuteoProvider>
        },
        {
          path:"envios_parciales",
          element:<RuteoProvider><EnviosParciales /></RuteoProvider>
        },
        {
          path:"pasan",
          element:<Pasan />
        },
      ]
     }
    ]
  }

export default EmbarquesRouter;

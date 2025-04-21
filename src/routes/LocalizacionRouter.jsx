
import PublicLayout from "../layout/public/PublicLayout";

import LocalizacionLayout from "../layout/localizacion/LocalizacionLayout";
import LocalizacionEmbarques from "../pages/localizacion/LocalizacionEmbarques";
import LocalizacionTransportesGPS from "../pages/localizacion/LocalizacionTransportesGPS";

const LocalizacionRouter = {
    path:"/localizacion",
    element:<PublicLayout />,
    children:[
     {
      path:"",
      element: <LocalizacionLayout />,
      children:[
        {
          index:true,
          element:<LocalizacionTransportesGPS />
        }

      ]
     }
    ]
  }

export default LocalizacionRouter;

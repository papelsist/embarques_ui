
import PublicLayout from "../layout/public/PublicLayout";

import LocalizacionLayout from "../layout/localizacion/LocalizacionLayout";
import LocalizacionEmbarques from "../pages/localizacion/LocalizacionEmbarques";

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
          element:<LocalizacionEmbarques />
        }

      ]
     }
    ]
  }

export default LocalizacionRouter;

import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/home/Home";
import Mapa from "./components/map/Mapa";
import MainLayout from "./layout/main/MainLayout"
import EmbarquesLayout from "./layout/embarques/EmbarquesLayout";
import Embarques from "./pages/embarques/Embarques";
import Chofer from "./pages/chofer/Chofer";
import MobileLayout from "./layout/mobile/MobileLayout";
import Login from "./pages/auth/Login";
import TablerosLayout from "./layout/tableros/TablerosLayout";
import Tableros from "./pages/tableros/Tableros";
import Transito from "./pages/tableros/transito/Transito";




export const router = createBrowserRouter([
    {
      path:"/login",
      element:<Login />
    },
    {
        path:"/",
        element:<MainLayout />,
        children:[
          {
            index: true,
            element: <Home />
          },
          {
            path:"demo-map",
            element:<Mapa />
        },
        /* {
          path:"/tableros",
          element: <TablerosLayout />,
          children:[
              {
                index:true,
                element:<Tableros />
              },
              {
                path: "transito",
                element:<Transito />
              }

            ]

        } */
        ]
    },
    {
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
          }

        ]
       }
      ]
    },
 {
      path:"/tableros",
      element:<MainLayout />,
      children:[
       {
        path:"",
        element: <TablerosLayout />,
        children:[
          {
            index:true,
            element:<Tableros />
          },
          {
            path: "transito",
            element:<Transito />
          }

        ]
       }
      ]
    }, 
    {
      path:"/chofer",
      element:<MobileLayout/>,
      children:[
        {
          path:"",
          element: <Chofer />
        }
      ]
    }
])
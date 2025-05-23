import { createBrowserRouter,createHashRouter } from "react-router-dom";
import Home from "./pages/home/Home";
import Mapa from "./components/map/Mapa";
import MainLayout from "./layout/main/MainLayout"
import Login from "./pages/auth/Login";
import Test from "./pages/test/Test";
import ChoferRouter from "./routes/ChoferRouter";
import EmbarquesRouter from "./routes/EmbarquesRouter";
import TablerosRouter from "./routes/TablerosRouter";
import LocalizacionRouter from "./routes/LocalizacionRouter";





export const router = createHashRouter([
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
        {
          path:"test",
          element:<Test />
        },
        ]
    },
    EmbarquesRouter,
    TablerosRouter, 
    ChoferRouter,
    LocalizacionRouter

])
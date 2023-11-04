
import Chofer from "../pages/chofer/Chofer";
import MobileLayout from "../layout/mobile/MobileLayout";

const ChoferRouter =   {
    path:"/chofer",
    element:<MobileLayout/>,
    children:[
      {
        path:"",
        element: <Chofer />
      }
    ]
  }

export default ChoferRouter;

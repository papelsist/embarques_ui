
import PublicLayout from "../layout/public/PublicLayout";
import TablerosLayout from "../layout/tableros/TablerosLayout";
import Tableros from "../pages/tableros/Tableros";


const TablerosRouter = {
    path:"/tableros",
    element:<PublicLayout />,
    children:[
     {
      path:"",
      element: <TablerosLayout />,
      children:[
        {
          index:true,
          element:<Tableros />
        }

      ]
     }
    ]
  }

export default TablerosRouter;

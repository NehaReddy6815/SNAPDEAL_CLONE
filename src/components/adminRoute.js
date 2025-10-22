
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const user = useSelector((state) => state.user.currentUser);

  if (!user || (!user.isAdmin && user?.user?.role !== 'admin' && user?.role !== 'admin')) {
    return <Navigate to="/" />; 
  }

  return children;
};

export default AdminRoute;

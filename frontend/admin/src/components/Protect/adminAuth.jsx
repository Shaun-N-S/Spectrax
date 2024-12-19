import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminAuth({ children }) {
    const info = useSelector((state) => state.admin.admin);
    if (!info) {
        return <Navigate to="/" />;
    }
    return children; // Render the `AdminHome` component if logged in
}
export default AdminAuth;
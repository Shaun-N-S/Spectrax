import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectHome({children}){

    // const user = useSelector((state) => state.user.users);
    const id =localStorage.getItem('accessToken')
    console.log(id)
    if (!id) {
    return <Navigate to="/login" />;
    }

    return children
}

export default ProtectHome;
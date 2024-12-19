import { Navigate } from "react-router-dom";

function ProtectedComponent({children}){


    // const user = useSelector((state)=> state.user.users)
    const user = localStorage.getItem('accessToken')
    if(user){
        return children
    }
    return <Navigate to={"/login"}/>;
}

export default ProtectedComponent
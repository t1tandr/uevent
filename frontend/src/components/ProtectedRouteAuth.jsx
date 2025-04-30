import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRouteAuth() {
    const { auth } = useSelector((state) => state.auth);
    return auth ? <Outlet /> : <Navigate to="/login" />;
}
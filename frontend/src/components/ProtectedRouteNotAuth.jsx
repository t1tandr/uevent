import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRouteNotAuth() {
    const { auth } = useSelector((state) => state.auth);
    return auth ? <Navigate to="/" /> : <Outlet />;
}
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/Appcontext";

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAppContext();
    const location = useLocation();

    if (isLoading) return <div>Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

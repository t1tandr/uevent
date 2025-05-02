import { Route, Routes } from "react-router-dom";
import ProtectedRouteAuth from "./components/ProtectedRouteAuth.jsx";
import ProtectedRouteNotAuth from "./components/ProtectedRouteNotAuth.jsx";

import IndexPage from "./pages/index.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import EventPage from "./pages/event.jsx";
import ProfilePage from "./pages/profile.jsx";
import CreateCompanyPage from "./pages/createCompany.jsx";
import ManageCompanyPage from "./pages/manageCompany.jsx";
import CreateEventPage from "./pages/createEvent.jsx";
import EditEventPage from "./pages/editEvent.jsx";
import OtherProfilePage from "./pages/profileOther.jsx";
import Error from "./pages/404.jsx";
import CompanyPage from "./pages/company.jsx";
import PaymentSuccess from "./pages/payment-success.jsx";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "./store/authSlice";
import { getAccessToken } from "./services/auth-token.service";
import { authService } from "./services/auth.service";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const userData = await authService.getProfile();
          dispatch(login(userData.data));
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    initializeAuth();
  }, [dispatch]);
  return (
    <Routes>
      <Route element={<Login />} path="/login" />
      <Route element={<Register />} path="/register" />
      <Route element={<IndexPage />} path="/" />
      <Route element={<EventPage />} path="/event/:id" />
      <Route element={<ProfilePage />} path="/profile" />
      <Route element={<CreateCompanyPage />} path="/company/create" />
      <Route element={<ManageCompanyPage />} path="/company/manage" />
      <Route element={<CreateEventPage />} path="/event/create" />
      <Route element={<EditEventPage />} path="/event/edit/:id" />
      <Route element={<OtherProfilePage />} path="/profile/:id" />
      <Route element={<CompanyPage />} path="/company/:id" />
      <Route element={<Error />} path="*" />
      <Route element={<PaymentSuccess />} path="/payment/success" />
    </Routes>
  );
}

export default App;

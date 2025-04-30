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

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRouteNotAuth />}>
        <Route element={<Login />} path="/login" />
        <Route element={<Register />} path="/register" />
        <Route element={<IndexPage />} path="/" />
        <Route element={<EventPage />} path="/event/:id"/>
        <Route element={<ProfilePage />} path="/profile"/>
        <Route element={<CreateCompanyPage />} path="/company/create"/>
        <Route element={<ManageCompanyPage />} path="/company/manage"/>
        <Route element={<CreateEventPage />} path="/event/create"/>
        <Route element={<EditEventPage />} path="/event/edit/:id"/>
      </Route>

      <Route element={<ProtectedRouteAuth />}>
      </Route>
    </Routes>
  );
}

export default App;

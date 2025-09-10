import { Route, Routes, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "../components/LoginPage";
import PublicRoute from "./PublicRoute";
import Dashboard from "../components/Dashboard";
import FileUploadForm from "../components/FileUploadForm";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/folder/:folderName" element={<Dashboard />} />
        <Route path="/upload-image" element={<FileUploadForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

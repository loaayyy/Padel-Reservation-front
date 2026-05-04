import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home/Home";
import BookingPage from "./pages/Booking/Book";
import Notfound from "./pages/Notfound/Notfound";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import OwnerDashboard from "./pages/OwnerDashboard/OwnerDashboard";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "home", element: <Home /> },
      { path: "book/:courtId", element: <ProtectedRoute><BookingPage /></ProtectedRoute> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "owner",
        element: (
          <ProtectedRoute allowedRoles={["Owner"]}>
            <OwnerDashboard />
          </ProtectedRoute>
        ),
      },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "*", element: <Notfound /> },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

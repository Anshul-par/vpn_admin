import VPNConfigForm from "./VPNConfigForm";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./loginForm";
import ProtectRoute from "./ProtectRoute";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route
          path="/app"
          element={
            <ProtectRoute>
              <VPNConfigForm />
            </ProtectRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

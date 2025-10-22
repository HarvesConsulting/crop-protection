import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PayPage from "./pages/pay"; // ⚠️ шлях до pay.js

import MainApp from "./MainApp"; // твоя стара логіка App, перенесемо її туди

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/pay" element={<PayPage />} />
        <Route path="*" element={<MainApp />} /> {/* усе інше — головний додаток */}
      </Routes>
    </Router>
  );
}

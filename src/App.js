import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainApp from "./MainApp";
import PayPage from "./pages/pay";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/pay" element={<PayPage />} />
      </Routes>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";

function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
          <p className="text-gray-400">This page is coming soon</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stocks" element={<PagePlaceholder title="Stocks Market" />} />
        <Route path="/futures" element={<PagePlaceholder title="Futures Market" />} />
        <Route path="/indices" element={<PagePlaceholder title="Indices" />} />
        <Route path="/docs" element={<PagePlaceholder title="API Documentation" />} />
      </Routes>
    </Router>
  );
}
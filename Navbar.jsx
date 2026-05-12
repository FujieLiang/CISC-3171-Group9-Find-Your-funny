import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Protected from "@/components/Protected";
import Home from "@/pages/Home";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import NearMe from "@/pages/NearMe";
import CreateEvent from "@/pages/CreateEvent";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserProfile from "@/pages/UserProfile";

function AppRoutes() {
  const { user: currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/near-me" element={<NearMe />} />
      <Route path="/create-event" element={<Protected><CreateEvent /></Protected>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Navigate to="/me" />} />
      <Route path="/profile/:id" element={<UserProfile />} />
      <Route path="/me" element={currentUser ? <Protected><Navigate to={`/profile/${currentUser.id}`} /></Protected> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App min-h-screen flex flex-col bg-cream text-stark">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <div className="flex-1">
            <AppRoutes />
          </div>
          <Footer />
          <Toaster position="top-right" toastOptions={{
            className: "!font-sans !border !border-dim !rounded-none !bg-paper !text-stark",
          }} />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;

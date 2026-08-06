// src/App.jsx
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSession, clearSession } from "./pages/Teachers/sessionSlice";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { PermissionProvider } from "./contexts/PermissionContext";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const storedSession = localStorage.getItem("userSession");
    
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        dispatch(setSession(sessionData));
      } catch (error) {
        console.error("Error parsing session data:", error);
        localStorage.removeItem("userSession");
        dispatch(clearSession());
      }
    } else {
      dispatch(clearSession());
    }
  }, [dispatch]);

  return (
    <PermissionProvider>
      <RouterProvider router={router} />
    </PermissionProvider>
  );
}

export default App;
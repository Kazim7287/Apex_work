import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSession, clearSession } from "./pages/Teachers/sessionSlice";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check for existing session in localStorage or just clear it
    const storedSession = localStorage.getItem("userSession");
    
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        dispatch(setSession(sessionData));
      } catch (error) {
        localStorage.removeItem("userSession");
        dispatch(clearSession());
      }
    } else {
      dispatch(clearSession());
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
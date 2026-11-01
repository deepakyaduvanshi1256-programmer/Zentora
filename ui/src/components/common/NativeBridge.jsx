import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App as CapApp } from "@capacitor/app";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { toast } from "react-toastify";
import { isNative } from "../../utils/platform";

// Pages where "back" should offer to exit the app instead of navigating further back.
const ROOTS = ["/", "/login", "/admin-dashboard", "/client-dashboard", "/user-dashboard"];

// Renders nothing. Wires Android-only behaviour: hardware back button, status bar, splash screen.
const NativeBridge = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathRef = useRef(location.pathname);
  const lastBack = useRef(0);
  useEffect(() => { pathRef.current = location.pathname; }, [location.pathname]);

  useEffect(() => {
    if (!isNative()) return undefined;
    document.documentElement.classList.add("is-native");
    (async () => {
      try { await StatusBar.setStyle({ style: Style.Dark }); await StatusBar.setBackgroundColor({ color: "#0d6efd" }); } catch { /* not critical */ }
      try { await SplashScreen.hide({ fadeOutDuration: 300 }); } catch { /* not critical */ }
    })();

    let handle;
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (ROOTS.includes(pathRef.current) || !canGoBack) {
        const now = Date.now();
        if (now - lastBack.current < 2000) { CapApp.exitApp(); return; }
        lastBack.current = now;
        toast.info("Press back again to exit", { autoClose: 1800 });
        return;
      }
      navigate(-1);
    }).then((h) => { handle = h; });
    return () => { handle?.remove(); };
  }, [navigate]);

  return null;
};

export default NativeBridge;

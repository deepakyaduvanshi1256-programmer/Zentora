
import { AppLauncher } from "@capacitor/app-launcher";
import { Capacitor } from "@capacitor/core";

const openEmail = async (email) => {
  const url = `mailto:${email}`;

  try {
    if (Capacitor.isNativePlatform()) {
      await AppLauncher.openUrl({ url });
    } else {
      window.location.href = url;
    }
  } catch (error) {
    console.error("Unable to open email app:", error);
  }
};

export default openEmail;

import { auth, googleProvider, signInWithPopup, signInWithRedirect } from "./firebase";

/**
 * Reliable detection for Android WebView
 */
export const isAndroidWebView = () => {
  if (typeof window === "undefined") return false;
  
  const ua = window.navigator.userAgent;
  const isAndroid = /Android/i.test(ua);
  const isWebView = /wv|Version\/[\d.]+/i.test(ua);
  
  return isAndroid && isWebView;
};

/**
 * Production-safe Google Login helper
 * - Uses signInWithPopup for normal browsers (Desktop/Mobile)
 * - Uses signInWithRedirect for Android WebView to avoid 'disallowed_useragent'
 */
export const handleGoogleLogin = async () => {
  try {
    if (isAndroidWebView()) {
      // In Android WebView, we MUST use redirect because popups/WebViews 
      // are blocked by Google OAuth.
      console.log("Android WebView detected, using redirect...");
      await signInWithRedirect(auth, googleProvider);
    } else {
      // Normal browser behavior
      console.log("Standard browser detected, using popup...");
      await signInWithPopup(auth, googleProvider);
    }
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

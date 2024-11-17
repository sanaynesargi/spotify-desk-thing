import { createEffect, createSignal } from "solid-js";
import SpotifyNowPlaying from "~/components/SpotifyNowPlaying";
import {
  getAuthTokenSignal,
  useSpotifyAuth,
} from "~/components/hooks/useSpotifyAuth";

const CARD_WIDTH = 715; // Card width
const CARD_HEIGHT = 500; // Adjusted card height for a 16:9 aspect ratio (~800x480 resolution)

export default function Home() {
  useSpotifyAuth();
  const [isAuthenticated, setIsAuthenticated] = createSignal(false);
  const [showAuthError, setShowAuthError] = createSignal(false);

  const authToken = getAuthTokenSignal?.();

  createEffect(() => {
    let timerReference = null;

    // Wait a little bit, then if we're still not authenticated show an error
    timerReference = setTimeout(() => {
      if (!authToken) {
        setShowAuthError(true);
      }
    }, 2000);

    // Check to see if we're authenticated
    if (getAuthTokenSignal?.() && getAuthTokenSignal?.().length > 0) {
      clearTimeout(timerReference);
      setIsAuthenticated(true);
    }

    return () => {
      if (timerReference) clearTimeout(timerReference);
    };
  });

  return (
    <main class="bg-black min-h-screen flex items-center justify-center">
      {isAuthenticated() && (
        <div class="relative">
          <div
            class="relative text-white rounded-3xl overflow-hidden"
            style={{
              width: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              transform: "translateZ(0)", // Fix for rounded corners in webkit
            }}
          >
            <SpotifyNowPlaying />
          </div>
        </div>
      )}
      {showAuthError() && (
        <div class="grid items-center justify-center h-screen">
          <p class="text-white text-center max-w-sm">
            Unable to authenticate with API. Have you set the proper auth tokens
            in the ".env" configuration file? (see README for setup
            instructions)
          </p>
        </div>
      )}
    </main>
  );
}

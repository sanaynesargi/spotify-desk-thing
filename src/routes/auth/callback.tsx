import fetch from "cross-fetch";
<<<<<<< HEAD
import { createEffect, createSignal } from "solid-js";

export default function AuthCallback() {
  const code = new URL(window.location.href).searchParams.get("code") || "";

  const [refreshToken, setRefreshToken] = createSignal("loading...");

  createEffect(() => {
    async function doTheThing() {
      const res = await fetch(
        "/api/v1/spotify/get-refresh-token?" +
          new URLSearchParams({
            code,
          }),
        {
          method: "GET",
        }
      );

      const response = await res.json();
      setRefreshToken(response["refresh_token"] || JSON.stringify(response));
    }

    doTheThing();
=======
import { createEffect, createSignal, onCleanup } from "solid-js";

export default function AuthCallback() {
  const [isMounted, setIsMounted] = createSignal(false);
  const [refreshToken, setRefreshToken] = createSignal("loading...");
  const [code, setCode] = createSignal("");

  createEffect(() => {
    if (!isMounted()) return;

    // Only run the logic if the code is available in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get("code") || "";
    setCode(codeFromUrl);

    if (codeFromUrl) {
      async function fetchRefreshToken() {
        try {
          const res = await fetch(
            `/api/v1/spotify/get-refresh-token?` +
              new URLSearchParams({ code: codeFromUrl }),
            { method: "GET" }
          );
          const response = await res.json();
          setRefreshToken(response.refresh_token || JSON.stringify(response));
        } catch (error) {
          console.error("Error fetching refresh token:", error);
          setRefreshToken("Error fetching token");
        }
      }
      fetchRefreshToken();
    }
  });

  // Ensure the code runs only on the client side
  createEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true); // Set mounted flag after the component is mounted
    }
>>>>>>> 17aa32a (Custom Commits)
  });

  return (
    <div class="bg-white">
      Copy this into the 'VITE_SPOTIFY_REFRESH_TOKEN' field in the .env file:
      <p>{refreshToken()}</p>
    </div>
  );
}

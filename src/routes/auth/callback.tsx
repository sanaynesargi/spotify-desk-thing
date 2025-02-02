import fetch from "cross-fetch";
import { createEffect, createSignal } from "solid-js";

export default function AuthCallback() {
  const [code, setCode] = createSignal("");
  const [refreshToken, setRefreshToken] = createSignal("loading...");

  createEffect(() => {
    if (typeof window !== "undefined") {
      // Only access `window` in the browser
      setCode(new URL(window.location.href).searchParams.get("code") || "");
    }
  });

  createEffect(() => {
    async function doTheThing() {
      if (code()) {
        const res = await fetch(
          "/api/v1/spotify/get-refresh-token?" +
            new URLSearchParams({
              code: code(),
            }),
          {
            method: "GET",
          }
        );

        const response = await res.json();
        setRefreshToken(response["refresh_token"] || JSON.stringify(response));
      }
    }

    doTheThing();
  });

  return (
    <div class="bg-white">
      Copy this into the 'VITE_SPOTIFY_REFRESH_TOKEN' field in the .env file:
      <p>{refreshToken()}</p>
    </div>
  );
}

import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js";
import { trpc } from "~/utils/trpc";
import DynamicBackground from "./DynamicBackground";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screensaver from "./Screensaver";
import SvgMusic from "./icons/bx-music.svg";

// Variables to control album art size and text scale
const PREVIEW_SIZE = 250; // Increased album art size for better visibility
const TEXT_SCALE = 1.5; // Controls the scale of text (title and subtitle)

const getAlbumMetadata = ({
  album,
  name,
}: {
  album: AlbumMetadata;
  name: string;
}) => ({
  preview: album.images[0].url,
  title: name,
  subtitle: album.artists.map((artist) => artist.name).join(", "),
});

const getEpisodeMetadata = (episode: EpisodeMetadata) => ({
  preview: episode.images[0].url,
  title: episode.name,
  subtitle: episode.show.name,
});

const metadataMappers: Record<
  SpotifyApi.CurrentlyPlayingObject["currently_playing_type"],
  (item: any) => UiMetadata
> = {
  track: getAlbumMetadata,
  episode: getEpisodeMetadata,
  ad: (e) => e, // TODO
  unknown: (e) => e, // TODO
};

const SpotifyNowPlaying: Component = () => {
  const utils = trpc.useContext();
  const [showScreensaver, setShowScreensaver] = createSignal(true);
  const nowPlayingQuery = trpc.metadata.nowPlaying.useQuery();
  const isSavedQuery = trpc.metadata.saved.useQuery(
    () => ({ ids: [nowPlayingQuery.data?.item?.id || ""] }),
    () => ({
      enabled: !!nowPlayingQuery.data?.item?.id,
    })
  );

  createEffect(() => {
    const thisNowPlaying = nowPlayingQuery.data;
    let interval: number;
    let refreshTimeout = !!thisNowPlaying?.is_playing ? 8000 : 15000;
    if (thisNowPlaying !== undefined) {
      const songDuration = thisNowPlaying?.item?.duration_ms ?? 0;
      const currentProgress = thisNowPlaying?.progress_ms ?? 0;

      const timeLeftOnSong = songDuration - currentProgress;
      if (thisNowPlaying?.is_playing && timeLeftOnSong < refreshTimeout) {
        refreshTimeout = timeLeftOnSong + 1000;
      }
    }

    interval = setInterval(
      () => utils.metadata.nowPlaying.invalidate(),
      refreshTimeout
    ) as any;

    onCleanup(() => {
      clearInterval(interval);
    });
  });

  const metadata = createMemo<UiMetadata>(() => {
    const mapperKey = nowPlayingQuery.data?.currently_playing_type ?? "track";
    const mapper = metadataMappers[mapperKey];

    const mapAttempt =
      mapper &&
      nowPlayingQuery.data?.item &&
      mapper(nowPlayingQuery.data?.item);

    if (!mapAttempt) {
      setShowScreensaver(true);
      return {
        preview: "",
        title: "",
        subtitle: "",
        missingNowPlayingContext: true,
      };
    } else {
      if (showScreensaver()) {
        setShowScreensaver(false);
      }
      return mapAttempt;
    }
  });

  return (
    <div class="w-full h-full flex justify-center items-center bg-black">
      {showScreensaver() ? (
        <Screensaver />
      ) : (
        <DynamicBackground imgUrl={metadata()?.preview} class="blur-3xl">
          {/* Centered Horizontal Layout with Album Art and Text */}
          <div class="flex justify-center items-center w-full px-6 py-6">
            {/* Full Width Flexbox Container */}
            <div class="flex items-center justify-center w-full max-w-screen-lg">
              {/* Album Art */}
              <div class="flex-shrink-0 mr-6">
                <div
                  class="relative"
                  style={{
                    width: `${PREVIEW_SIZE}px`,
                    height: `${PREVIEW_SIZE}px`,
                  }}
                >
                  <div class="absolute z-0">
                    <img
                      src={SvgMusic}
                      width={`${PREVIEW_SIZE / 2}px`}
                      height={`${PREVIEW_SIZE / 2}px`}
                    />
                  </div>
                  <div
                    class="relative z-10"
                    style={{
                      width: `${PREVIEW_SIZE}px`,
                      height: `${PREVIEW_SIZE}px`,
                      "background-image": `url(${metadata()?.preview})`,
                      "background-position": "center center",
                      "background-repeat": "no-repeat",
                      "background-size": "cover",
                    }}
                  />
                </div>
              </div>

              {/* Text Info */}
              <div class="flex flex-col justify-start text-white">
                <p
                  class="font-extrabold text-ellipsis overflow-hidden"
                  style={{
                    "font-size": `${TEXT_SCALE * 1.5}rem`, // Title scaled by TEXT_SCALE
                    "max-width": "400px", // Control text overflow
                  }}
                >
                  {metadata()?.title}
                </p>
                <p
                  class="opacity-75 text-ellipsis overflow-hidden"
                  style={{
                    "font-size": `${TEXT_SCALE * 1.25}rem`, // Subtitle scaled by TEXT_SCALE
                    "max-width": "400px", // Control text overflow
                  }}
                >
                  {metadata()?.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Player Controls */}
          <div class="absolute bottom-4 w-full px-4">
            <PlayerControls isSaved={!!isSavedQuery.data?.[0]} />
          </div>
        </DynamicBackground>
      )}
    </div>
  );
};

export default SpotifyNowPlaying;

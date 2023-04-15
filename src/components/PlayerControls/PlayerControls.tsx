import { Component } from "solid-js";
import SvgEmptyHeart from "../icons/bx-heart.svg";
import SvgPause from "../icons/bx-pause.svg";
import SvgPlay from "../icons/bx-play.svg";
import SvgShuffle from "../icons/bx-shuffle.svg";
import SvgSkipNext from "../icons/bx-skip-next.svg";
import SvgSkipPrevious from "../icons/bx-skip-previous.svg";
import PlayerControlIcon from "./PlayerControlIcon";
import { useNowPlayingActionsContext } from "../context/NowPlayingContext";

interface PlayerControlsType {
  playingProgressPercent: number;
  isPlaying: boolean;
  disableControls: boolean;
  enableShuffle: boolean;
  enableSaved: boolean;
}


const PlayerControls: Component<PlayerControlsType> = (props) => {
  const { setPause, setPlay } = useNowPlayingActionsContext();

  return (
    <div
      class="hidden fixed w-full left-0 bottom-0 flex items-center justify-between px-10"
      style={{
        "background-color": "rgba(0,0,0,0.2)",
        height: "120px",
        "align-items": "center",
      }}
    >
      <div
        class="absolute top-0 left-0 w-0 w-full origin-left"
        style={{ height: "3px", "background-color": "rgba(0,0,0,0.2)" }}
      ></div>
      <div
        class="absolute top-0 left-0 w-0 w-full scale-x-0 origin-left bg-white"
        style={{ height: "3px", transform: `scaleX(${props.playingProgressPercent})` }}
      ></div>
      <PlayerControlIcon
        src={SvgShuffle}
        isDisabled={props.disableControls}
        showActiveIndicator={props.enableShuffle}
      />
      <PlayerControlIcon
        src={SvgSkipPrevious}
        isDisabled={props.disableControls}
        enlargeIcon={true}
      />
      {props.isPlaying ? (
        <PlayerControlIcon
          src={SvgPause}
          isDisabled={props.disableControls}
          enlargeIcon={true}
          onClick={setPause}
        />
      ) : (
        <PlayerControlIcon
          src={SvgPlay}
          isDisabled={props.disableControls}
          enlargeIcon={true}
          onClick={setPlay}
        />
      )}
      <PlayerControlIcon
        src={SvgSkipNext}
        isDisabled={props.disableControls}
        enlargeIcon={true}
      />
      <PlayerControlIcon
        src={SvgEmptyHeart}
        isDisabled={props.disableControls}
      />
    </div>
  );
};

export default PlayerControls;
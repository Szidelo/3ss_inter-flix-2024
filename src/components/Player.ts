import { Lightning, VideoPlayer } from "@lightningjs/sdk";

export class Player extends Lightning.Component {
  private _videoURL = "";

  override _firstActive() {
    VideoPlayer.consumer(this);
  }

  get videoURL(): string {
    return this._videoURL;
  }

  set videoURL(url: string) {
    this._videoURL = url;
    VideoPlayer.open(url);
  }

  setPosition(x: number, y: number) {
    VideoPlayer.position(x, y);
  }

  setSize(w: number, h: number) {
    VideoPlayer.size(w, h);
  }

  // call this with the video URL to setup the playback
  initializePlayback(url: string) {
    this._videoURL = url;

    if (this._videoURL) {
      VideoPlayer.open(this._videoURL);
    }
  }

  // Stops the video that is currently playing, and restarts it from the beginning.
  reload() {
    VideoPlayer.reload();
  }

  // Unsets the source of the video player and then hides the video player.
  close() {
    VideoPlayer.close();
  }

  // Unsets the source of the video player (without hiding it).
  clear() {
    VideoPlayer.clear();
  }

  pause() {
    VideoPlayer.pause();
  }

  play() {
    VideoPlayer.play();
  }

  // Pauses or plays the video player, depending on its current state.
  playPause() {
    VideoPlayer.playPause();
  }

  mute(optionalBool?: boolean) {
    if (optionalBool === undefined) {
      VideoPlayer.mute();
    } else {
      VideoPlayer.mute(optionalBool);
    }
  }

  // Sets the current time of the video player to the specified time in seconds.
  seek(seconds: number) {
    VideoPlayer.seek(seconds);
  }

  // Jumps a specified number of seconds forward or backward from the video's current time.
  // A positive value will have it jump forwards and a negative value will have it jump backward.
  skip(seconds: number) {
    VideoPlayer.skip(seconds);
  }

  show() {
    VideoPlayer.show();
  }

  hide() {
    VideoPlayer.hide();
  }

  getDuration() {
    return VideoPlayer.duration;
  }

  getCurrentTime() {
    return VideoPlayer.currentTime;
  }

  isPlaying() {
    return VideoPlayer.playing;
  }
}

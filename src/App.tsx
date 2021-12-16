import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import "./App.css";

declare global {
  interface Window {
    ReactNativeWebView: any;
  }
}

const App: React.FC = () => {
  const [playing, setPlaying] = React.useState(false);
  const player = React.useRef(null);
  const token = useRef<string>();

  const mediaId = "safe-mode-player";

  const location = useLocation();
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);

  const fetchCookie = async () => {
    try {
      if (token.current) {
        await fetch("https://tagmango.com/get-cookie", {
          credentials: "include",
          headers: { Authorization: `Bearer ${token.current}` },
        });
      } else {
        await fetch("https://tagmango.com/get-cookie", {
          credentials: "include",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchCookie();
  }, [token.current]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get("url");
    const accessToken = params.get("accessToken");
    if (url) {
      setMediaUrl(url);
    }
    if (accessToken) {
      token.current = accessToken;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }, []);

  function onPlay() {
    let list = [...(document.getElementsByTagName("audio") ?? [])];
    list = [...list, ...(document.getElementsByTagName("video") ?? [])];
    list.forEach((element) => {
      if (element.parentElement?.id !== mediaId) element.pause();
    });
    setPlaying(true);
  }

  return mediaUrl ? (
    <ReactPlayer
      ref={player}
      controls
      config={{
        file: {
          attributes: {
            controlsList: "nodownload",
            disablePictureInPicture: true,
            onContextMenu: (e: any) => e.preventDefault(),
          },
        },
      }}
      playing={playing}
      width="100%"
      height="100%"
      className="post-player"
      url={mediaUrl}
      id={mediaId}
      onPlay={() => onPlay()}
      onPause={() => setPlaying(false)}
      style={{}}
      onReady={() => {}}
      onFullscreenChange={(val = true) => {
        window.ReactNativeWebView.postMessage(`fullscreenchange - ${val}`);
      }}
    />
  ) : null;
};

export default App;

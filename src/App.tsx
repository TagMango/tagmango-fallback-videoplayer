import React, { useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import "./App.css";

declare global {
  interface Window {
    ReactNativeWebView: any;
    VdoPlayer: any;
  }
}

const App: React.FC = () => {
  const [playing, setPlaying] = React.useState(false);
  const player = React.useRef(null);
  const token = useRef<string>();

  const mediaId = "safe-mode-player";

  const location = useLocation();
  const [mediaUrl, setMediaUrl] = React.useState<string | null>(null);
  const [vdoCipherId, setVdoCipherId] = React.useState<string | null>(null);

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

  const getCipherOTP = async (videoId: string) => {
    try {
      const resp = await axios.post(`${process.env.REACT_APP_API_BASE}/get-video-cipher-details`, {
        "videoId":videoId
      })
      if (resp.data?.code === 0) {
        const video = new window.VdoPlayer({
          otp: resp.data?.result?.otp,
          playbackInfo: resp.data?.result?.playbackInfo,
          theme: "9ae8bbe8dd964ddc9bdb932cca1cb59a",
          // the container can be any DOM element on website
          container: document.querySelector(`#cipher`),
        });
      } else {
        console.log(resp.data?.result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCookie();
    const interval = setInterval(() => fetchCookie(), 240000);
    return () => clearInterval(interval);
  }, [token.current]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get("url");
    const cipherId = params.get("vdoCipherId");
    const accessToken = params.get("accessToken");
    console.log(url, accessToken);
    if (url) {
      setMediaUrl(url);
    } 
    if (accessToken) {
      token.current = accessToken;
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
    if (cipherId) {
      setVdoCipherId(cipherId);
      getCipherOTP(cipherId);
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

  const handleVideoPlay = () => {
    if (vdoCipherId) {
      return <div id="cipher" />;
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

  return handleVideoPlay();
};

export default App;

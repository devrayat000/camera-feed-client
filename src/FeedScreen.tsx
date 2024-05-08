import { useCallback, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import SingleFeed from "./components/SingleFeed";
import logo from "./assets/logo.png";
import { useSearchParams } from "react-router-dom";

export default function FeedScreen() {
  const [searchParams] = useSearchParams();
  const [cameraIndices, setCameraIndices] = useState<number[]>([]);

  const ioClient = useMemo(() => {
    console.log("id", searchParams.get("ip"));

    const ip = searchParams.get("ip");
    const port = parseInt(searchParams.get("port")!);
    const url = `http://${ip}:${port}/feed`;
    return io(url, {
      transports: ["websocket"],
    });
  }, [searchParams.get("ip"), searchParams.get("port")]);

  const connect = useCallback(() => {
    console.log("Connected, sid: ", ioClient.id);
  }, [ioClient]);

  const reconnect = useCallback(
    (error: Error) => {
      if (ioClient.active) {
        console.log("Reconnecting...");

        // temporary failure, the socket will automatically try to reconnect
      } else {
        // the connection was denied by the server
        // in that case, `socket.connect()` must be manually called in order to reconnect
        ioClient.connect();
        console.log(error.message);
      }
    },
    [ioClient]
  );

  useEffect(() => {
    ioClient.on("connect", connect);
    ioClient.on("camera_change", setCameraIndices);
    ioClient.on("connect_error", reconnect);

    return () => {
      ioClient.off("connect_error", reconnect);
      ioClient.off("camera_change", setCameraIndices);
      ioClient.off("connect", connect);
    };
  }, [connect, reconnect, ioClient]);

  useEffect(() => {
    return () => {
      ioClient.disconnect();
    };
  }, []);

  return (
    <div className="dark bg-background text-foreground h-screen">
      <div className="grid place-items-center">
        <img src={logo} alt="Logo" width={64} />
      </div>
      <h3 className="font-bold text-center text-4xl">PROCHESTA v3.0</h3>
      <div className="w-full flex gap-6 flex-wrap items-center justify-between p-6 mt-4">
        {cameraIndices.map((index) => (
          <SingleFeed key={index} ioClient={ioClient} index={index} />
        ))}
      </div>
    </div>
  );
}

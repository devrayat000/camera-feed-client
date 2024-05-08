import { useCallback, useEffect, useMemo } from "react";
import { io } from "socket.io-client";

import SingleFeed from "./components/SingleFeed";
import { useSearchParams } from "react-router-dom";

export default function FeedScreen() {
  const [searchParams] = useSearchParams();

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
  }, []);

  const reconnect = useCallback((error: Error) => {
    if (ioClient.active) {
      console.log("Reconnecting...");

      // temporary failure, the socket will automatically try to reconnect
    } else {
      // the connection was denied by the server
      // in that case, `socket.connect()` must be manually called in order to reconnect
      ioClient.connect();
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    ioClient.on("connect", connect);
    ioClient.on("connect_error", reconnect);

    return () => {
      ioClient.off("connect_error", reconnect);
      ioClient.off("connect", connect);
    };
  }, [connect, reconnect]);

  return (
    <div className="bg-slate-800 h-screen">
      <div className="w-full flex gap-6 flex-wrap items-center justify-between p-6">
        {[0, 3, 5].map((index) => (
          <SingleFeed key={index} ioClient={ioClient} index={index} />
        ))}
      </div>
    </div>
  );
}

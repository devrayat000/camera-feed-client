import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import placeholder from "../assets/image.png";

interface SingleFeedProps {
  index: number;
}

export default function SingleFeed_2({ index }: SingleFeedProps) {
  const [searchParams] = useSearchParams();
  const [imageBase, setImageBase] = useState<string>();
  const [serverTime, setServerTime] = useState<number>();
  const [isOpen, setIsOpen] = useState(false);

  const ioClient = useMemo(() => {
    console.log("id", searchParams.get("ip"));

    const ip = searchParams.get("ip");
    const port = parseInt(searchParams.get("port")!);
    const url = `http://${ip}:${port + index}/feed`;
    return io(url, {
      transports: ["websocket"],
      autoConnect: false,
    });
  }, [searchParams.get("ip"), searchParams.get("port"), index]);

  const extractFeedFromIo = useCallback(
    (frame_data: ArrayBuffer, start_time: number) => {
      const blob = new Blob([frame_data]);
      const reader = new FileReader();
      reader.onload = function (event) {
        const result = event.target?.result;
        if (typeof result === "string") {
          setImageBase(result.split(",")[1]);
        }
      };
      reader.readAsDataURL(blob);
      setServerTime(start_time);
    },
    []
  );

  const startFeed = useCallback(() => {
    if (!ioClient.connected) {
      ioClient.connect().emit("join_feed", index);
    } else {
      ioClient.emit("join_feed", index);
    }
    setIsOpen(true);
  }, [ioClient, index]);

  const stopFeed = useCallback(() => {
    ioClient.emit("leave_feed", index);
    setIsOpen(false);
  }, [ioClient, index]);

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
    ioClient.on("connect_error", reconnect);

    return () => {
      ioClient.off("connect_error", reconnect);
      ioClient.off("connect", connect);
    };
  }, [connect, reconnect]);

  useEffect(() => {
    console.log("listening to feed", index);

    ioClient.on(`send_feed_${index}`, extractFeedFromIo);
    return () => {
      ioClient.off(`send_feed_${index}`, extractFeedFromIo);
    };
  }, [index, extractFeedFromIo, ioClient]);

  return (
    <div className="basis-[45%]">
      <div className="relative aspect-video rounded-lg overflow-hidden">
        {/* measure ping from serverTime */}
        {serverTime && isOpen && (
          <div className="absolute top-0 left-0 z-10 bg-black bg-opacity-50 text-white p-2 rounded-br-lg">
            Ping: {(Date.now() - serverTime * 1000).toFixed(2)}ms
          </div>
        )}
        {imageBase ? (
          <img
            src={`data:image/jpeg;base64,${imageBase}`}
            alt="feed"
            className="w-full -scale-x-100 h-full object-cover rounded-[inherit]"
          />
        ) : (
          <img
            src={placeholder}
            alt="placeholder"
            className="w-full h-full object-cover rounded-[inherit]"
          />
        )}
      </div>
      <div className="mt-2 flex justify-between gap-2">
        <button
          onClick={startFeed}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Start Feed
        </button>
        <button
          onClick={stopFeed}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Stop Feed
        </button>
      </div>
    </div>
  );
}

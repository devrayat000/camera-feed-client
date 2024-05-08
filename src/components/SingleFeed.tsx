import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import placeholder from "../assets/image.png";

type ListenEvents = {
  [Key in `send_feed_${number}`]: (
    frame_data: ArrayBuffer,
    start_time: number
  ) => any;
};

type EventsMap = {
  join_feed: (index: number) => void;
  leave_feed: (index: number) => void;
};

interface SingleFeedProps {
  ioClient: Socket<ListenEvents, EventsMap>;
  index: number;
}

export default function SingleFeed({ ioClient, index }: SingleFeedProps) {
  const [imageBase, setImageBase] = useState<string>();
  const [serverTime, setServerTime] = useState<number>();
  const [isOpen, setIsOpen] = useState(false);

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
    console.log("start feed", index);
    try {
      ioClient.emit("join_feed", index);
      setIsOpen(true);
      console.log("joined feed", index);
    } catch (error) {
      console.log("error", error);
    }
  }, [index]);

  const stopFeed = useCallback(() => {
    ioClient.emit("leave_feed", index);
    setIsOpen(false);
  }, [index]);

  const connect = useCallback(() => {
    if (isOpen) {
      startFeed();
    }
  }, [isOpen, startFeed]);

  useEffect(() => {
    ioClient.on("connect", connect);
    return () => {
      ioClient.off("connect", connect);
    };
  }, [connect]);

  useEffect(() => {
    console.log("listening to feed", index);

    ioClient.on(`send_feed_${index}`, extractFeedFromIo);
    return () => {
      ioClient.off(`send_feed_${index}`, extractFeedFromIo);
    };
  }, [index, extractFeedFromIo]);

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

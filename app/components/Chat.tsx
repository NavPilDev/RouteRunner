import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { Map } from "./map";
import { cosineSimilarity } from "ai";
const Chat = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/openai",
  });

  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    if (chatContainer.current) {
      const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current;
      if (scrollHeight >= scrollTop + offsetHeight) {
        chatContainer.current.scrollTo(0, scrollHeight + 200);
      }
    }
  };

  useEffect(() => {
    scroll();
  }, [messages]);

  const renderResponse = () => {
    return (
      <div className="response">
        {messages.map((m, index) => (
          <div
            key={m.id}
            className={`chat-line ${
              m.role === "user" ? "user-chat" : "ai-chat"
            }`}
          >
            <Image
              className="avatar"
              alt="avatar"
              width={40}
              height={40}
              src={m.role === "user" ? "/user-avatar.jpg" : "/ai-avatar.png"}
            />
            <div style={{ width: "100%", marginLeft: "16px" }}>
              <p className="message">{m.content}</p>
              {m.role != "user" ? <Map /> : ""}
              {index < messages.length - 1 && (
                <div className="horizontal-line" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const options = {
    maximumAge: 0,
    enableHighAccuracy: false,
    timeout: 1500,
  };

  const success = (pos) => {
    const coords = pos.coords;
    let radius = input.match(/(\d+)/)[1];
    console.log(radius);
    const offsetLat = Number(radius) / 69;
    const offsetLon = Number(radius) / 54.6;
    let flightPath = [
      {
        // Start
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
      {
        // TOP RIGHT CORNER
        latitude: pos.coords.latitude + offsetLat,
        longitude: pos.coords.longitude + offsetLon,
      },
      {
        // BOTTOM RIGHT CORNER
        latitude: pos.coords.latitude - offsetLat,
        longitude: pos.coords.longitude + offsetLon,
      },
      {
        // BOTTOM LEFT CORNER
        latitude: pos.coords.latitude - offsetLat,
        longitude: pos.coords.longitude - offsetLon,
      },
      {
        // TOP LEFT CORNER
        latitude: pos.coords.latitude + offsetLat,
        longitude: pos.coords.longitude - offsetLon,
      },
      {
        // TOP RIGHT CORNER
        latitude: pos.coords.latitude + offsetLat,
        longitude: pos.coords.longitude + offsetLon,
      },
      {
        // End
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      },
    ];
    console.log(coords);
    console.log(flightPath);
    console.log(flightPath.length);
    console.log("QGC WPL 110");
    console.log("0	1	0	0	0	0	0	0	0	0	0	1");
    for (let i = 0; i < flightPath.length; i++) {
      console.log(i);

      console.log(
        i +
          1 +
          " " +
          3 +
          " " +
          16 +
          " " +
          0 +
          " " +
          0 +
          " " +
          0 +
          " " +
          0 +
          " " +
          flightPath[i].latitude +
          " " +
          flightPath[i].longitude +
          " " +
          100 +
          " " +
          1
      );
    }
  };

  const error = (err) => {
    console.log(err);
  };

  return (
    <div ref={chatContainer} className="chat">
      {renderResponse()}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.includes("current location")) {
            navigator.geolocation.getCurrentPosition(success, error, options);
            handleSubmit();
          } else {
            handleSubmit();
          }
        }}
        className="chat-form"
      >
        <input
          name="input-field"
          type="text"
          placeholder="Say anything"
          onChange={handleInputChange}
          value={input}
        />
        <button type="submit" className="send-button" />
      </form>
    </div>
  );
};

export default Chat;

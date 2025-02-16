import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Map } from "./map";
import { cosineSimilarity } from "ai";
const Chat = () => {
  const [flightPath, setFlightPath] = useState<string[]>([]);
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
              {m.role != "user" && flightPath.length > 1 ? (
                <div>
                  <h1>Flight Path</h1>
                  {flightPath.map((line, index) => (
                    <p id={String(index)}>{line}</p>
                  ))}
                </div>
              ) : (
                ""
              )}
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
    let fP = [
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
    let fPSucessor = [];
    fPSucessor.push("<?xml version='1.0' encoding='UTF-8' standalone='yes'?>");
    fPSucessor.push("<mission>");
    fPSucessor.push("\t<version value='2.3-pre8'/>");
    fPSucessor.push(
      `\t<mwp cx='${pos.coords.longitude}' cy='${pos.coords.latitude}' home-x='0' home-y='0' zoom='15'/>`
    );
    for (let i = 0; i < fP.length; i++) {
      fPSucessor.push(
        `\t<missionitem no="${i + 1}" action="WAYPOINT" lat="${
          fP[i].latitude
        }" lon=""${
          fP[i].longitude
        }" alt="100" parameter1="0" parameter2="0" parameter3="0" flag="0"/>`
      );
    }
    fPSucessor.push("</mission>");
    setFlightPath(fPSucessor);
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

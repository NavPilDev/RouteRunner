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
  // State to manage copied effect
  const [isCopied, setIsCopied] = useState(false);
  // State to manage notification visibility
  const [showNotification, setShowNotification] = useState(false);
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

  const handleCopy = async () => {
    try {
      const copyText = flightPath.join("\n");
      console.log(flightPath);
      // Copy text to clipboard
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true); // Show "Copied!" effect
      setShowNotification(true); // Show notification
      // Remove "Copied!" text after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
      // Hide notification after 3 seconds
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

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
              {/* {m.role != "user" ? <Map /> : ""} */}
              {m.role != "user" && flightPath.length > 1 ? (
                <button onClick={handleCopy} className="copyButton">
                  <h1>Flight Path</h1>
                  {flightPath.map((line, index) => (
                    <p id={String(index)}>{line}</p>
                  ))}
                  <p className="copyText">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#b6b4b4"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    {isCopied ? "Copied!" : "Copy Flight Path"}
                  </p>
                </button>
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
    fPSucessor.push(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`);
    fPSucessor.push(`<mission>`);
    fPSucessor.push(`\t<version value="2.3-pre8"/>`);
    fPSucessor.push(
      `\t<mwp cx="${pos.coords.longitude}" cy="${pos.coords.latitude}" home-x="0" home-y="0" zoom="15"/>`
    );
    for (let i = 0; i < fP.length; i++) {
      fPSucessor.push(
        `\t<missionitem no="${i + 1}" action="WAYPOINT" lat="${
          fP[i].latitude
        }" lon="${
          fP[i].longitude
        }" alt="100" parameter1="0" parameter2="0" parameter3="0" flag="0"/>`
      );
    }
    fPSucessor.push("</mission>");
    console.log(fPSucessor);
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
      {/* Notification */}
      {showNotification && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#333",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "4px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          Copied to the clipboard!
        </div>
      )}
    </div>
  );
};

export default Chat;

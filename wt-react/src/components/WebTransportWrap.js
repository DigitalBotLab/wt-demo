import _ from "lodash";
import { createContext, useEffect, useState } from "react";

let _logs = [];

const WebTransportContext = createContext(null);

function WebTransportWrap(props) {
  const [transport, setTransport] = useState(null);
  const [streamNumber, setStreamNumber] = useState(0);
  const [logs, setLogs] = useState([]);
  let timer = null;
  const printLog = (log) => {
    log.timestamp = Date.now();
    _logs.push(log);
    if (timer !== null) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      const logCloned = _.clone(_logs);
      setLogs(logCloned);
    }, 50);
  };
  const connect = async () => {
    const url = "https://echo.webtransport.day";
    try {
      // eslint-disable-next-line no-undef
      var transport = new WebTransport(url);
      printLog({
        type: "info",
        text: "Initiating connection..."
      });
    } catch (e) {
      // addToEventLog("Failed to create connection object. " + e, "error");
      return;
    }

    try {
      await transport.ready;
      printLog({
        type: "info",
        text: "Connection ready."
      });
    } catch (e) {
      // addToEventLog("Connection failed. " + e, "error");
      return;
    }

    transport.closed
      .then(() => {
        // addToEventLog("Connection closed normally.");
      })
      .catch(() => {
        // addToEventLog("Connection closed abruptly.", "error");
      });

    setTransport(transport);
  };

  const readFromIncomingStream = async (readableStream) => {
    // eslint-disable-next-line no-undef
    const decoder = new TextDecoderStream("utf-8");
    const reader = readableStream.pipeThrough(decoder).getReader();
    setStreamNumber(streamNumber + 1);
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          printLog({
            type: "read",
            status: "off",
            number: streamNumber,
            text: "closed"
          });
          return;
        }
        let data = value;
        printLog({
          type: "read",
          number: streamNumber,
          text: data
        });
      }
    } catch (e) {
      // addToEventLog(
      //   "Error while reading from stream #" + number + ": " + e,
      //   "error"
      // );
      // addToEventLog("    " + e.message);
    }
  };

  useEffect(() => {
    connect();
  }, []);

  return (
    <WebTransportContext.Provider
      value={{
        transport,
        logs,
        streamNumber,
        readFromIncomingStream,
        printLog
      }}
    >
      {props.children}
    </WebTransportContext.Provider>
  );
}

export { WebTransportContext, WebTransportWrap };

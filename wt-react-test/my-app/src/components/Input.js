import { useContext, useRef } from "react";
import { WebTransportContext } from "./WebTransportWrap";

function Input() {
  const wtCtx = useContext(WebTransportContext);
  const inputRef = useRef(null);

  const sendData = async () => {
    const { transport, streamNumber, readFromIncomingStream, printLog } = wtCtx;
    try {
      const stream = transport
        ? await transport.createBidirectionalStream()
        : null;

      const encoder = new TextEncoder("utf-8");
      const rawData = inputRef.current ? inputRef.current.value : "";
      let data = encoder.encode(rawData);

      readFromIncomingStream(stream.readable);

      let writer = stream.writable.getWriter();
      for (let i = 0; i < 10; i++) {
        const number = streamNumber;
        await (() =>
          new Promise((resolve) => {
            setTimeout(() => {
              printLog({
                type: "write",
                number,
                text: rawData
              });
              resolve(writer.write(data));
            }, 0.4 * 1000);
          }))();
      }
      await writer.close();
      // addToEventLog(
      //   "Opened bidirectional stream #" + number + " with data: " + rawData
      // );
    } catch (e) {
      // addToEventLog("Error while sending data: " + e, "error");
    }
  };

  return (
    <div
      className="flex
    py-4
    w-full"
    >
      <input
        ref={inputRef}
        className="flex-1 rounded-sm
      outline-none
      focus:border-pink-400
      border-4
      border-slate-300
      p-2
      text-sm
      text-slate-800"
        placeholder="input your text"
      />
      <button
        className="ml-2 px-2
      bg-pink-500 rounded-sm
      hover:bg-pink-600
      active:bg-pink-700
      font-bold"
        onClick={sendData}
      >
        send data 10 times
      </button>
    </div>
  );
}

export { Input };

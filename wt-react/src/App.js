import "./App.css";
import {
  WebTransportContext,
  WebTransportWrap
} from "./components/WebTransportWrap";
import { Input } from "./components/Input";
import { Output } from "./components/Output";

function App() {
  return (
    <WebTransportWrap>
      <WebTransportContext.Consumer>
        {({ logs }) => {
          return (
            <div
              className="
          flex
        bg-black min-h-screen text-slate-100"
            >
              <div
                className=" w-[600px]  m-auto 
    flex
    flex-col "
              >
                <Input />
                <Output logs={logs} />
              </div>
            </div>
          );
        }}
      </WebTransportContext.Consumer>
    </WebTransportWrap>
  );
}

export default App;

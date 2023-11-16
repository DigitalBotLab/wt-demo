import _ from "lodash";
import { LogGroup } from "./Log/LogGroup";

function Output(props) {
  const { logs } = props;
  let _logs = _.clone(logs);
  const group = {};
  _logs.forEach((log) => {
    if (log.type === "write" || log.type === "read") {
      if (log.number in group) {
        group[log.number].push(log);
      } else {
        group[log.number] = [log];
      }
      // _.pull(_logs, log)
    }
  });
  const renderLogs = _.filter(
    _logs,
    (log) => log.type !== "write" || log.type !== "read"
  );

  console.log(renderLogs, "ll");
  return (
    <div
      className="border-pink-500 border
    rounded-lg
    p-4
    h-[800px]
    overflow-auto"
    >
      {/* {_logs.map(log => {
        return <Log key={JSON.stringify(log.toString)} type={log.type}>{log.text}</Log>
      }
      )} */}
      <LogGroup group={group} />
    </div>
  );
}

export { Output };

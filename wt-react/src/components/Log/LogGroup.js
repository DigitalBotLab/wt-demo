import { GroupItem } from "./GroupItem";

function LogGroup(props) {
  const { group } = props;
  return (
    <div>
      {Object.keys(group).map((key) => {
        return (
          <div
            className="rounded-sm
      bg-pink-800 my-10
      py-2 relative
      break-all"
          >
            <span
              className="absolute h-[24px]
        text-[18px]
        leading-[24px]
         top-[-24px]
         left-[12px]
         px-2
         bg-pink-800
         rounded-t-sm"
            >
              Stream {key}
            </span>
            {group[key].map((log) => {
              return (
                <GroupItem
                  key={JSON.stringify(log)}
                  type={log.type}
                  display={"inline-block"}
                >
                  {log.text}
                </GroupItem>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export { LogGroup };

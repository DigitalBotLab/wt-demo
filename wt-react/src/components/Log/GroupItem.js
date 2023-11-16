function GroupItem(props) {
  const { type } = props;
  return (
    <span
      className={`
    mx-2
    ${
      type === "write"
        ? " text-yellow-400 "
        : type === "read"
        ? " text-green-400 "
        : ""
    }`}
    >
      {props.children}
    </span>
  );
}

export { GroupItem };

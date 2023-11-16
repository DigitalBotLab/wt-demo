function Log(props) {
  const { type } = props;
  return (
    <div
      className={`${
        type === "write"
          ? " text-yellow-400 "
          : type === "read"
          ? " text-green-400 "
          : ""
      }`}
    >
      {props.children}
    </div>
  );
}

export { Log };

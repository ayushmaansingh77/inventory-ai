

import nonamelogo from "../assets/nonamelogo.png";

function FloatingBox({
  size = 40,
  x = 50,
  y = 50,
  dx = 0,
  dy = 0,
  rotate = 0,
  delay = 0,
  duration = 7,
}) {
  return (
    <img
      src={nonamelogo}
      alt=""
      draggable={false}
      className="absolute pointer-events-none select-none floating-box"
      style={{
        width: `${size}px`,
        height: "auto",

        left: `${x}%`,
        top: `${y}%`,

        "--dx": dx,
        "--dy": dy,
        "--rot": `${rotate}deg`,

        animation: `burst ${duration}s linear infinite`,
        animationDelay: `-${delay}s`,
      }}
    />
  );
}

export default FloatingBox;
function toPath(values, width, height, padding = 20) {
  const max = Math.max(...values, 1);
  const step = (width - padding * 2) / (values.length - 1);
  return values
    .map((v, i) => {
      const x = padding + i * step;
      const y = height - padding - (v / max) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export default function LineChart({ labels, values, stroke = "#f6c75c", height = 180 }) {
  const width = labels.length * 36 + 40;
  const path = toPath(values, width, height);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[180px]">
        {[...Array(4)].map((_, i) => (
          <line key={i} x1="0" x2={width} y1={20 + i * 40} y2={20 + i * 40} stroke="rgba(255,255,255,0.06)" />
        ))}
        <path d={path} fill="none" stroke={stroke} strokeWidth="2" />
        {values.map((v, i) => {
          const max = Math.max(...values, 1);
          const step = (width - 40) / (values.length - 1);
          const x = 20 + i * step;
          const y = height - 20 - (v / max) * (height - 40);
          return <circle key={i} cx={x} cy={y} r="3" fill={stroke} />;
        })}
        {labels.map((l, i) => (
          <text
            key={i}
            x={20 + i * ((width - 40) / (labels.length - 1))}
            y={height - 4}
            textAnchor="middle"
            fontSize="10"
            fill="rgba(255,255,255,0.6)"
          >
            {l}
          </text>
        ))}
      </svg>
    </div>
  );
}

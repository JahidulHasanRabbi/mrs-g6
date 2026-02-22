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

export default function LineChart({ labels, values, stroke = "#f6c75c", height = 220 }) {
  const width = 100;
  const padding = 5;
  const bottomMargin = 15;
  const chartHeight = height - bottomMargin;
  
  const path = toPath(values, width, chartHeight, padding);
  
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: `${height}px` }} preserveAspectRatio="none">
        {/* Horizontal grid lines */}
        {[...Array(5)].map((_, i) => {
          const y = padding + (i / 4) * (chartHeight - padding * 2);
          return (
            <line
              key={i}
              x1="0"
              x2={width}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="0.2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        
        {/* Line path */}
        <path d={path} fill="none" stroke={stroke} strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        
        {/* Dots */}
        {values.map((v, i) => {
          const max = Math.max(...values, 1);
          const step = (width - padding * 2) / (values.length - 1);
          const x = padding + i * step;
          const y = chartHeight - padding - (v / max) * (chartHeight - padding * 2);
          return <circle key={i} cx={x} cy={y} r="0.8" fill={stroke} vectorEffect="non-scaling-stroke" />;
        })}
        
        {/* Labels */}
        {labels.map((l, i) => {
          const step = (width - padding * 2) / (labels.length - 1);
          const x = padding + i * step;
          return (
            <text
              key={i}
              x={x}
              y={height - 3}
              textAnchor="middle"
              fontSize="3"
              fill="#757575"
              fontFamily="Times New Roman"
            >
              {l}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

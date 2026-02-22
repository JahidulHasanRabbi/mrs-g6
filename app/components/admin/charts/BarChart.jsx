export default function BarChart({
  labels,
  values,
  positiveColor = "#f6c75c",
  baseColor = "rgba(255,255,255,0.15)",
  height = 180,
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${labels.length * 36} ${height}`} className="w-full h-[180px]">
        {values.map((v, i) => {
          const h = (v / max) * (height - 28);
          const x = i * 36 + 12;
          const y = height - h - 20;
          return (
            <g key={i}>
              <rect x={x - 14} width={28} y={height - 20 - (height - 28)} height={height - 28} rx={6} fill={baseColor} />
              <rect x={x - 14} width={28} y={y} height={h} rx={6} fill={positiveColor} />
              <text x={x} y={height - 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.6)">
                {labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

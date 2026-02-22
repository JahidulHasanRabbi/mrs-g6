export default function BarChart({
  labels,
  values,
  positiveColor = "#fab47f",
  baseColor = "#f6f6f6",
  height = 269,
  highlightIndex = 3,
}) {
  const max = 8000;
  const yLabels = ["8K", "6K", "4K", "2K", "0"];
  const barWidth = 25;
  const barSpacing = 80;
  const chartWidth = labels.length * barSpacing + 60;
  const leftMargin = 40;
  const bottomMargin = 30;
  const chartHeight = height - bottomMargin;

  return (
    <div className="w-full flex">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between pr-[18px] pb-[12px]" style={{ height: `${height}px` }}>
        {yLabels.map((label, i) => (
          <p key={i} className="text-[12px] text-[#757575] font-['Times_New_Roman'] leading-[1.3] text-right">
            {label}
          </p>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1">
        <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full" style={{ height: `${height}px` }}>
          {/* Horizontal grid lines */}
          {yLabels.map((_, i) => {
            const y = (i / (yLabels.length - 1)) * chartHeight;
            return (
              <line
                key={i}
                x1="0"
                x2={chartWidth}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            );
          })}

          {/* Bars */}
          {values.map((v, i) => {
            const h = (v / max) * chartHeight;
            const x = leftMargin + i * barSpacing;
            const y = chartHeight - h;
            const isHighlight = i === highlightIndex;

            return (
              <g key={i}>
                {/* Base bar (grey) */}
                <rect
                  x={x - barWidth / 2}
                  y={0}
                  width={barWidth}
                  height={chartHeight}
                  rx={6}
                  fill={baseColor}
                  stroke={isHighlight ? "white" : "none"}
                  strokeWidth={isHighlight ? 1 : 0}
                />
                {/* Active bar (orange or gradient) */}
                {isHighlight ? (
                  <>
                    <defs>
                      <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#FFFF84" />
                        <stop offset="100%" stopColor="#DD8F1F" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x - barWidth / 2}
                      y={y}
                      width={barWidth}
                      height={h}
                      rx={6}
                      fill="url(#barGradient)"
                    />
                  </>
                ) : (
                  <rect
                    x={x - barWidth / 2}
                    y={y}
                    width={barWidth}
                    height={h}
                    rx={6}
                    fill={positiveColor}
                  />
                )}
                {/* Label */}
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="14"
                  fill="#757575"
                  fontFamily="Times New Roman"
                >
                  {labels[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

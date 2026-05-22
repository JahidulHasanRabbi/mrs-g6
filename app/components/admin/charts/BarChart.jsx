export default function BarChart({
  labels,
  values,
  positiveColor = "#fab47f",
  baseColor = "#f6f6f6",
  height = 269,
  highlightIndex = 3,
}) {
  // Calculate max dynamically from values, with a minimum of 10 for better visualization
  const dataMax = Math.max(...values, 1);
  const max = Math.max(Math.ceil(dataMax * 1.2), 10); // Add 20% padding and minimum of 10
  
  // Generate Y-axis labels dynamically - evenly spaced
  const generateYLabels = (maxValue) => {
    const numLabels = 5;
    const labels = [];
    for (let i = 0; i < numLabels; i++) {
      const value = Math.round(maxValue * (1 - i / (numLabels - 1)));
      if (value >= 1000) {
        labels.push(`${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`);
      } else {
        labels.push(value.toString());
      }
    }
    return labels;
  };
  
  const yLabels = generateYLabels(max);
  const barWidth = 25;
  const barSpacing = 80;
  const chartWidth = labels.length * barSpacing + 60;
  const leftMargin = 40;
  const bottomMargin = 30;
  const chartHeight = height - bottomMargin;

  return (
    <div className="w-full flex">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between pr-[18px]" style={{ height: `${chartHeight}px` }}>
        {yLabels.map((label, i) => (
          <p key={i} className="text-[12px] text-[#757575] leading-[1.3] text-right">
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

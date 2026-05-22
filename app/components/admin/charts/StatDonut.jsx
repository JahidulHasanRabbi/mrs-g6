export default function StatDonut({
  value,
  total,
  size = 160,
  stroke = 16,
  strokeColor,
}) {
  const pct = Math.max(0, Math.min(1, value / total));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  const gradientId = `stat-donut-grad-${size}-${stroke}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFF84" />
            <stop offset="100%" stopColor="#DD8F1F" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ffffff"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor ?? `url(#${gradientId})`}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="drop-shadow-[0_0_20px_rgba(246,199,92,0.25)]"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-[16px] font-bold text-[#06b800] leading-[1.2] capitalize">
            Active Users
          </div>
          <div className="text-[28px] font-bold text-white leading-[1.1]">
            {value.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

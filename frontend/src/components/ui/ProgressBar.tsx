interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'red' | 'yellow';
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorClasses = {
  indigo: 'bg-indigo-600',
  green: 'bg-green-600',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  red: 'bg-red-600',
  yellow: 'bg-yellow-600',
};

export default function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = 'indigo',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      <div className={`w-full rounded-full bg-gray-200 ${sizeClasses[size]}`}>
        <div
          className={`rounded-full transition-all ${sizeClasses[size]} ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-500">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

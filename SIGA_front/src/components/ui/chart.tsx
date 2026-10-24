import React from 'react';
import { ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactElement;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, children, config, ...props }, ref) => {
  const chartId = React.useId();
  const uniqueId = id || chartId;

  return (
    <div
      ref={ref}
      id={uniqueId}
      className={cn(
        'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-slate-500 [&_.recharts-cartesian-grid_line]:stroke-slate-200/60 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-slate-200 [&_.recharts-dot[stroke="#fff"]]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-slate-200 [&_.recharts-radial-bar-background-sector]:fill-slate-100 [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-slate-100/50 [&_.recharts-reference-line_[stroke="#ccc"]]:stroke-slate-200 [&_.recharts-sector[stroke="#fff"]]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none',
        className
      )}
      {...props}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
});
ChartContainer.displayName = 'ChartContainer';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
    payload?: Record<string, unknown>;
    color?: string;
  }>;
  label?: string;
}

export const ChartTooltipContent = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-md text-xs">
      {label && <p className="font-bold text-slate-800 mb-1">{label}</p>}
      <div className="space-y-1">
        {payload.map((item, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: item.color || '#10b981' }}
            />
            <span className="text-slate-500">{item.name}:</span>
            <span className="font-semibold text-slate-900 font-mono">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ChartTooltip = Tooltip;

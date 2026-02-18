// Activity Chart Component using Recharts

'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ActivityChartData } from '@/types';
import type { StatsPeriod } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ActivityChartProps {
  data: ActivityChartData[];
  period: StatsPeriod;
}

function formatChartDate(dateStr: string): string {
  const d = parseISO(dateStr);
  return format(d, 'MMM dd');
}

const PERIOD_DESCRIPTIONS: Record<StatsPeriod, string> = {
  '1d': 'Link detection and removal for the selected day',
  '7d': 'Link detection and removal over the last 7 days',
  '30d': 'Link detection and removal over the last 30 days',
};

export function ActivityChart({ data, period }: ActivityChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    displayDate: formatChartDate(item.date),
  }));

  const description = PERIOD_DESCRIPTIONS[period];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.18 0 0)" />
              <XAxis
                dataKey="displayDate"
                stroke="oklch(0.60 0 0)"
                fontSize={12}
              />
              <YAxis stroke="oklch(0.60 0 0)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'oklch(0.12 0 0)',
                  border: '1px solid oklch(0.18 0 0)',
                  borderRadius: '8px',
                  color: 'oklch(0.98 0 0)',
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="active"
                stroke="oklch(0.55 0.22 27.3)"
                strokeWidth={2}
                name="Active Links"
                dot={{ fill: 'oklch(0.55 0.22 27.3)' }}
              />
              <Line
                type="monotone"
                dataKey="removed"
                stroke="oklch(0.50 0 0)"
                strokeWidth={2}
                name="Removed Links"
                dot={{ fill: 'oklch(0.50 0 0)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

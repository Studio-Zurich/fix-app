"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/toggle-group";
const chartData = [
  { date: "2024-04-01", reports: 123 },
  { date: "2024-04-02", reports: 91 },
  { date: "2024-04-03", reports: 95 },
  { date: "2024-04-04", reports: 166 },
  { date: "2024-04-05", reports: 219 },
  { date: "2024-04-06", reports: 212 },
  { date: "2024-04-07", reports: 140 },
  { date: "2024-04-08", reports: 241 },
  { date: "2024-04-09", reports: 56 },
  { date: "2024-04-10", reports: 149 },
  { date: "2024-04-11", reports: 223 },
  { date: "2024-04-12", reports: 166 },
  { date: "2024-04-13", reports: 238 },
  { date: "2024-04-14", reports: 118 },
  { date: "2024-04-15", reports: 96 },
  { date: "2024-04-16", reports: 108 },
  { date: "2024-04-17", reports: 266 },
  { date: "2024-04-18", reports: 255 },
  { date: "2024-04-19", reports: 140 },
  { date: "2024-04-20", reports: 79 },
  { date: "2024-04-21", reports: 111 },
  { date: "2024-04-22", reports: 130 },
  { date: "2024-04-23", reports: 121 },
  { date: "2024-04-24", reports: 223 },
  { date: "2024-04-25", reports: 153 },
  { date: "2024-04-26", reports: 68 },
  { date: "2024-04-27", reports: 265 },
  { date: "2024-04-28", reports: 100 },
  { date: "2024-04-29", reports: 183 },
  { date: "2024-04-30", reports: 275 },
  { date: "2024-05-01", reports: 127 },
  { date: "2024-05-02", reports: 199 },
  { date: "2024-05-03", reports: 144 },
  { date: "2024-05-04", reports: 266 },
  { date: "2024-05-05", reports: 287 },
  { date: "2024-05-06", reports: 336 },
  { date: "2024-05-07", reports: 227 },
  { date: "2024-05-08", reports: 118 },
  { date: "2024-05-09", reports: 134 },
  { date: "2024-05-10", reports: 206 },
  { date: "2024-05-11", reports: 200 },
  { date: "2024-05-12", reports: 144 },
  { date: "2024-05-13", reports: 118 },
  { date: "2024-05-14", reports: 309 },
  { date: "2024-05-15", reports: 281 },
  { date: "2024-05-16", reports: 243 },
  { date: "2024-05-17", reports: 303 },
  { date: "2024-05-18", reports: 219 },
  { date: "2024-05-19", reports: 137 },
  { date: "2024-05-20", reports: 134 },
  { date: "2024-05-21", reports: 73 },
  { date: "2024-05-22", reports: 66 },
  { date: "2024-05-23", reports: 179 },
  { date: "2024-05-24", reports: 170 },
  { date: "2024-05-25", reports: 149 },
  { date: "2024-05-26", reports: 126 },
  { date: "2024-05-27", reports: 290 },
  { date: "2024-05-28", reports: 140 },
  { date: "2024-05-29", reports: 69 },
  { date: "2024-05-30", reports: 205 },
  { date: "2024-05-31", reports: 135 },
  { date: "2024-06-01", reports: 125 },
  { date: "2024-06-02", reports: 290 },
  { date: "2024-06-03", reports: 87 },
  { date: "2024-06-04", reports: 270 },
  { date: "2024-06-05", reports: 75 },
  { date: "2024-06-06", reports: 179 },
  { date: "2024-06-07", reports: 229 },
  { date: "2024-06-08", reports: 233 },
  { date: "2024-06-09", reports: 303 },
  { date: "2024-06-10", reports: 117 },
  { date: "2024-06-11", reports: 80 },
  { date: "2024-06-12", reports: 301 },
  { date: "2024-06-13", reports: 70 },
  { date: "2024-06-14", reports: 266 },
  { date: "2024-06-15", reports: 217 },
  { date: "2024-06-16", reports: 225 },
  { date: "2024-06-17", reports: 328 },
  { date: "2024-06-18", reports: 91 },
  { date: "2024-06-19", reports: 208 },
  { date: "2024-06-20", reports: 283 },
  { date: "2024-06-21", reports: 125 },
  { date: "2024-06-22", reports: 194 },
  { date: "2024-06-23", reports: 333 },
  { date: "2024-06-24", reports: 103 },
  { date: "2024-06-25", reports: 109 },
  { date: "2024-06-26", reports: 269 },
  { date: "2024-06-27", reports: 309 },
  { date: "2024-06-28", reports: 115 },
  { date: "2024-06-29", reports: 87 },
  { date: "2024-06-30", reports: 279 },
];

const chartConfig = {
  reports: {
    label: "Reports",
    color: "#ff781e",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card !p-0">
      <CardHeader className="relative">
        <CardTitle>Reports Gesamt</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">
            Gesamt für die letzten{" "}
            {timeRange === "7d"
              ? "7 Tage"
              : timeRange === "30d"
                ? "30 Tage"
                : "3 Monate"}
          </span>
          <span className="@[540px]/card:hidden">
            Letzte{" "}
            {timeRange === "7d"
              ? "7 Tage"
              : timeRange === "30d"
                ? "30 Tage"
                : "3 Monate"}
          </span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden [&_[data-state=on]]:bg-[#ff781e] [&_[data-state=on]]:text-white border-transparent shadow-md"
          >
            <ToggleGroupItem
              value="90d"
              className="h-8 px-2.5 border-transparent"
            >
              Letzte 3 Monate
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className="h-8 px-2.5 border-transparent"
            >
              Letzte 30 Tage
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              className="h-8 px-2.5 border-transparent"
            >
              Letzte 7 Tage
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="@[767px]/card:hidden flex w-40"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Letzte 3 Monate" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Letzte 3 Monate
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Letzte 30 Tage
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Letzte 7 Tage
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff781e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff781e" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("de-CH", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("de-CH", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="reports"
              type="natural"
              fill="url(#fillReports)"
              stroke="#ff781e"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { BarChart2 } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899", "#14b8a6"];

export default function Analytics() {
  const { data: byDept, isLoading: loadingDept } = useQuery({
    queryKey: ["analytics-by-dept"],
    queryFn: async () => {
      const res = await api.get<any>("/analytics/projects-by-department", false);
      return res.data ?? [];
    },
  });

  const { data: fundingTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ["analytics-funding-trend"],
    queryFn: async () => {
      const res = await api.get<any>("/analytics/funding-trend", false);
      return res.data ?? [];
    },
  });

  const { data: statusDist, isLoading: loadingStatus } = useQuery({
    queryKey: ["analytics-status-dist"],
    queryFn: async () => {
      const res = await api.get<any>("/analytics/status-distribution", false);
      return res.data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <BarChart2 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Research projects analytics and insights</p>
        </div>
      </div>

      {/* Projects by Department */}
      <Card>
        <CardHeader>
          <CardTitle>Projects by Department</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDept ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !byDept?.length ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byDept} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Projects" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Funding Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Trend by Year</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingTrend ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !fundingTrend?.length ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={fundingTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, "Total Funding"]} />
                <Legend />
                <Line type="monotone" dataKey="total_funding" name="Total Funding (₹)" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          {loadingStatus ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !statusDist?.length ? (
            <p className="text-muted-foreground text-sm">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ status, percent }) =>
                    `${status} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {statusDist.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

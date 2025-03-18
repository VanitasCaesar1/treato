"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Plus,
  Users,
  DollarSign,
  Activity,
  Target,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  MessageCircle,
} from "lucide-react";

// Static data
const analyticsData = [
  { month: "Jan", reaches: 30000, conversions: 280, spend: 1800 },
  { month: "Feb", reaches: 35000, conversions: 310, spend: 2100 },
  { month: "Mar", reaches: 45000, conversions: 420, spend: 2800 },
  { month: "Apr", reaches: 40000, conversions: 380, spend: 2500 },
];

const campaigns = [
  {
    id: 1,
    name: "Summer Sale 2024",
    status: "active",
    budget: 5000,
    spent: 2300,
    reaches: 45000,
    clicks: 2800,
    conversions: 320,
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    platform: "whatsapp",
  },
  {
    id: 2,
    name: "New Customer Promo",
    status: "scheduled",
    budget: 3000,
    spent: 0,
    reaches: 0,
    clicks: 0,
    conversions: 0,
    startDate: "2024-07-01",
    endDate: "2024-07-31",
    platform: "sms",
  },
];

const metrics = [
  {
    title: "Total Reach",
    value: "115K",
    change: "+12.5%",
    trend: "up",
    Icon: Users,
  },
  {
    title: "Conversion Rate",
    value: "8.2%",
    change: "+2.1%",
    trend: "up",
    Icon: Target,
  },
  {
    title: "Avg. Cost per Click",
    value: "$1.25",
    change: "-0.30",
    trend: "down",
    Icon: DollarSign,
  },
  {
    title: "Active Campaigns",
    value: "12",
    change: "+3",
    trend: "up",
    Icon: Activity,
  },
];

const PromotionsDashboard = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Promotions & Campaigns
        </h1>
        <Button className="rounded-xl bg-[#37AFE1] hover:bg-[#FFB347] hover:text-black">
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(({ title, value, change, trend, Icon }) => (
          <Card key={title} className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{title}</p>
                  <h3 className="text-2xl font-bold mt-2">{value}</h3>
                  <div className="flex items-center mt-2">
                    {trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm ${
                        trend === "up" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {change}
                    </span>
                  </div>
                </div>
                <Icon className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="reaches"
                    stroke="#2563eb"
                    name="Reaches"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversions"
                    stroke="#16a34a"
                    name="Conversions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Campaign Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="spend" fill="#3b82f6" name="Spend ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="rounded-xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Campaigns</CardTitle>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search campaigns..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Button variant="outline" className="rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          campaign.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {campaign.startDate} - {campaign.endDate}
                      </span>
                      <span className="text-sm flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {campaign.platform.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    View Details
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Budget Spent</p>
                    <p className="font-semibold">
                      ${campaign.spent.toLocaleString()} / $
                      {campaign.budget.toLocaleString()}
                    </p>
                    <Progress
                      value={(campaign.spent / campaign.budget) * 100}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Reaches</p>
                    <p className="font-semibold">
                      {campaign.reaches.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Clicks</p>
                    <p className="font-semibold">
                      {campaign.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Conversions</p>
                    <p className="font-semibold">
                      {campaign.conversions.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromotionsDashboard;

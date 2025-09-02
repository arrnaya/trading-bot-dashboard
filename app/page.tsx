"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Activity,
  Settings,
  RefreshCw,
  DollarSign,
  Target,
  Shield,
} from "lucide-react"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import "chartjs-adapter-date-fns"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
)

// Environment configuration
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.hostname === "localhost" ? "http://localhost:3011" : "https://ethbnb-botapi.arrnaya.com"
  }
  return "http://localhost:3011"
}

interface MetricsData {
  openPositions: number
  totalPnL: number
  winRate: number
  totalVolume: number
  last24hTrades: number
  peakPrice: number
  lastPrice: number
  pctChangePeak: number
  minutesSincePeak: number
  totalExposure: number
  exposurePercentage: number
  remainingCapacity: number
  activeTrailingDip: any
  baseTokenSymbol: string
  quoteTokenSymbol: string
}

interface BalanceData {
  baseToken: {
    symbol: string
    balance: number
    balanceUSD: number
    priceUSD: number
  }
  quoteToken: {
    symbol: string
    balance: number
    balanceUSD: number
    priceUSD: number
  }
  nativeToken: {
    symbol: string
    balance: number
    balanceUSD: number
    priceUSD: number
  }
  portfolio: {
    totalUSD: number
    lastUpdated: string
  }
}

interface Position {
  id: string
  buyPrice: number
  currentPrice: number
  amountOut: number
  amountIn: number
  currentValue: number
  pnlPercent: number
  pnlAbsolute: number
  ageHours: number
  trailingStopStatus: string
  dcaInfo?: {
    tranches?: any[]
  }
}

interface Trade {
  timestamp: string
  side: string
  amount_in: number
  amount_out: number
  profit: number
  profit_pct: number
  reason: string
  displayAmountIn: string
  displayAmountOut: string
  displayProfit: string
  displayProfitPct: string
  hasProfit: boolean
}

interface ChartData {
  labels: string[]
  datasets: any[]
}

interface VolumeChartData {
  success: boolean
  labels: string[]
  buyVolume: number[]
  sellVolume: number[]
  totalVolume: number
  avgTradeSize: number
}

interface TradesChartData {
  success: boolean
  labels: string[]
  successfulTrades: number[]
  failedTrades: number[]
  totalTrades: number
  winRate: number
}

interface PortfolioChartData {
  success: boolean
  labels: string[]
  totalValue: number[]
  baseTokenValue: number[]
  quoteTokenValue: number[]
  currentBalance: number
  change24h: number
}

interface PnLChartData {
  success: boolean
  labels: string[]
  cumulativePnL: number[]
  realizedPnL: number[]
  totalPnL: number
  unrealizedPnL: number
}

export default function TradingDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [balances, setBalances] = useState<BalanceData | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const [volumeData, setVolumeData] = useState<VolumeChartData | null>(null)
  const [tradesData, setTradesData] = useState<TradesChartData | null>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioChartData | null>(null)
  const [pnlData, setPnlData] = useState<PnLChartData | null>(null)
  const [volumeTimeframe, setVolumeTimeframe] = useState("24h")
  const [tradesTimeframe, setTradesTimeframe] = useState("24h")
  const [portfolioTimeframe, setPortfolioTimeframe] = useState("24h")
  const [pnlTimeframe, setPnlTimeframe] = useState("24h")

  const fetchChartData = async () => {
    try {
      const apiBase = getApiBaseUrl()

      const [volumeRes, tradesRes, portfolioRes, pnlRes] = await Promise.allSettled([
        fetch(`${apiBase}/api/charts/volume?timeframe=${volumeTimeframe}`),
        fetch(`${apiBase}/api/charts/trades?timeframe=${tradesTimeframe}`),
        fetch(`${apiBase}/api/charts/portfolio?timeframe=${portfolioTimeframe}`),
        fetch(`${apiBase}/api/charts/pnl?timeframe=${pnlTimeframe}`),
      ])

      if (volumeRes.status === "fulfilled" && volumeRes.value.ok) {
        const data = await volumeRes.value.json()
        setVolumeData(data)
      }

      if (tradesRes.status === "fulfilled" && tradesRes.value.ok) {
        const data = await tradesRes.value.json()
        setTradesData(data)
      }

      if (portfolioRes.status === "fulfilled" && portfolioRes.value.ok) {
        const data = await portfolioRes.value.json()
        setPortfolioData(data)
      }

      if (pnlRes.status === "fulfilled" && pnlRes.value.ok) {
        const data = await pnlRes.value.json()
        setPnlData(data)
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
    }
  }

  const fetchData = async () => {
    try {
      const apiBase = getApiBaseUrl()

      const [metricsRes, balancesRes, positionsRes, tradesRes] = await Promise.allSettled([
        fetch(`${apiBase}/api/metrics`),
        fetch(`${apiBase}/api/balances`),
        fetch(`${apiBase}/api/positions`),
        fetch(`${apiBase}/api/trades`),
      ])

      if (metricsRes.status === "fulfilled" && metricsRes.value.ok) {
        const metricsData = await metricsRes.value.json()
        setMetrics(metricsData)
      }

      if (balancesRes.status === "fulfilled" && balancesRes.value.ok) {
        const balancesData = await balancesRes.value.json()
        setBalances(balancesData)
      }

      if (positionsRes.status === "fulfilled" && positionsRes.value.ok) {
        const positionsData = await positionsRes.value.json()
        setPositions(positionsData.positions || [])
      }

      if (tradesRes.status === "fulfilled" && tradesRes.value.ok) {
        const tradesData = await tradesRes.value.json()
        setTrades(tradesData.slice(0, 20)) // Show last 20 trades
      }

      setLastUpdate(new Date())
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchChartData()
    const interval = setInterval(() => {
      fetchData()
      fetchChartData()
    }, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [volumeTimeframe, tradesTimeframe, portfolioTimeframe, pnlTimeframe])

  useEffect(() => {
    if (metrics && balances) {
      const totalValue = balances.portfolio.totalUSD || 0
      const pnl = metrics.totalPnL || 0
      const positions = metrics.openPositions || 0

      document.title = `$${totalValue.toFixed(0)} Portfolio | ${positions} Positions | ${pnl >= 0 ? "+" : ""}${pnl.toFixed(4)} P&L | Crypto Trading Bot Dashboard`
    }
  }, [metrics, balances])

  const getChartOptions = (title: string, yAxisLabel: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          color: "hsl(var(--foreground))",
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--border))",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: "hsl(var(--muted-foreground))",
        },
      },
    },
  })

  const getVolumeChartData = (): ChartData => {
    if (!volumeData) return { labels: [], datasets: [] }

    return {
      labels: volumeData.labels.map((label) => new Date(label).toLocaleTimeString()),
      datasets: [
        {
          label: "Buy Volume",
          data: volumeData.buyVolume,
          backgroundColor: "rgba(34, 197, 94, 0.7)",
          borderColor: "rgba(34, 197, 94, 1)",
          borderWidth: 1,
        },
        {
          label: "Sell Volume",
          data: volumeData.sellVolume,
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
      ],
    }
  }

  const getTradesChartData = (): ChartData => {
    if (!tradesData) return { labels: [], datasets: [] }

    return {
      labels: tradesData.labels.map((label) => new Date(label).toLocaleTimeString()),
      datasets: [
        {
          label: "Successful Trades",
          data: tradesData.successfulTrades,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Failed Trades",
          data: tradesData.failedTrades,
          borderColor: "rgba(239, 68, 68, 1)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  const getPortfolioChartData = (): ChartData => {
    if (!portfolioData) return { labels: [], datasets: [] }

    return {
      labels: portfolioData.labels.map((label) => new Date(label).toLocaleTimeString()),
      datasets: [
        {
          label: "Total Portfolio Value",
          data: portfolioData.totalValue,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Base Token Value",
          data: portfolioData.baseTokenValue,
          borderColor: "rgba(168, 85, 247, 1)",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Quote Token Value",
          data: portfolioData.quoteTokenValue,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }

  const getPnLChartData = (): ChartData => {
    if (!pnlData) return { labels: [], datasets: [] }

    return {
      labels: pnlData.labels.map((label) => new Date(label).toLocaleTimeString()),
      datasets: [
        {
          label: "Cumulative P&L",
          data: pnlData.cumulativePnL,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: true,
        },
        {
          label: "Realized P&L",
          data: pnlData.realizedPnL,
          borderColor: "rgba(59, 130, 246, 1)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    }
  }

  const formatNumber = (num: number, decimals = 4) => {
    return num?.toFixed(decimals) || "0.0000"
  }

  const formatPercent = (num: number) => {
    return `${num?.toFixed(2) || "0.00"}%`
  }

  const formatCurrency = (num: number) => {
    return `$${num?.toFixed(2) || "0.00"}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Trading Bot Dashboard</h1>
                  <p className="text-sm text-muted-foreground">
                    {metrics?.baseTokenSymbol || "ETH"}/{metrics?.quoteTokenSymbol || "WBNB"} •
                    <span className="text-chart-4 ml-1">● Live</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-xs">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </Badge>
                <Button
                  onClick={() => {
                    fetchData()
                    fetchChartData()
                  }}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <section aria-labelledby="key-metrics-heading">
                <h2 id="key-metrics-heading" className="sr-only">
                  Key Trading Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.openPositions || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
                      {(metrics?.totalPnL || 0) >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-chart-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-chart-2" />
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        className={`text-2xl font-bold ${(metrics?.totalPnL || 0) >= 0 ? "text-chart-4" : "text-chart-2"}`}
                      >
                        {formatNumber(metrics?.totalPnL || 0, 6)}
                      </div>
                      <p className="text-xs text-muted-foreground">{metrics?.baseTokenSymbol || "ETH"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPercent(metrics?.winRate || 0)}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">24h Trades</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{metrics?.last24hTrades || 0}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(metrics?.totalVolume || 0)}</div>
                      <p className="text-xs text-muted-foreground">{metrics?.baseTokenSymbol || "ETH"}</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Market Information */}
              <section aria-labelledby="market-info-heading">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" id="market-info-heading">
                      <BarChart3 className="h-5 w-5" />
                      Market Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-xl font-bold">{formatNumber(metrics?.lastPrice || 0, 8)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Peak Price</p>
                        <p className="text-xl font-bold">{formatNumber(metrics?.peakPrice || 0, 8)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Change from Peak</p>
                        <p
                          className={`text-xl font-bold ${(metrics?.pctChangePeak || 0) >= 0 ? "text-chart-4" : "text-chart-2"}`}
                        >
                          {formatPercent(metrics?.pctChangePeak || 0)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Minutes Since Peak</p>
                        <p className="text-xl font-bold">{formatNumber(metrics?.minutesSincePeak || 0, 1)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Risk Management */}
              <section aria-labelledby="risk-management-heading">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" id="risk-management-heading">
                      <Shield className="h-5 w-5" />
                      Risk Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Deployed</p>
                        <p className="text-xl font-bold">
                          {formatNumber(metrics?.totalExposure || 0)} {metrics?.baseTokenSymbol || "ETH"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Usage</p>
                        <p className="text-xl font-bold">{formatPercent(metrics?.exposurePercentage || 0)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Remaining Capacity</p>
                        <p className="text-xl font-bold">
                          {formatNumber(metrics?.remainingCapacity || 0)} {metrics?.baseTokenSymbol || "ETH"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Trailing DIP</p>
                        <Badge variant={metrics?.activeTrailingDip ? "default" : "secondary"}>
                          {metrics?.activeTrailingDip ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Token Balances */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {balances?.baseToken.symbol || "ETH"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{formatNumber(balances?.baseToken.balance || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(balances?.baseToken.balanceUSD || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Price: {formatCurrency(balances?.baseToken.priceUSD || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {balances?.quoteToken.symbol || "WBNB"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{formatNumber(balances?.quoteToken.balance || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(balances?.quoteToken.balanceUSD || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Price: {formatCurrency(balances?.quoteToken.priceUSD || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {balances?.nativeToken.symbol || "BNB"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">{formatNumber(balances?.nativeToken.balance || 0)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(balances?.nativeToken.balanceUSD || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Price: {formatCurrency(balances?.nativeToken.priceUSD || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Portfolio Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Portfolio Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                      <p className="text-3xl font-bold">{formatCurrency(balances?.portfolio.totalUSD || 0)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Last Updated</p>
                      <p className="text-lg">
                        {balances?.portfolio.lastUpdated
                          ? new Date(balances.portfolio.lastUpdated).toLocaleString()
                          : "--"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Network</p>
                      <Badge variant="outline">BSC</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Positions Tab */}
            <TabsContent value="positions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Open Positions ({positions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {positions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No open positions</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Buy Price</th>
                            <th className="text-left p-2">Current Price</th>
                            <th className="text-left p-2">Amount</th>
                            <th className="text-left p-2">Current Value</th>
                            <th className="text-left p-2">P&L %</th>
                            <th className="text-left p-2">P&L</th>
                            <th className="text-left p-2">Age</th>
                            <th className="text-left p-2">DCA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((position, index) => (
                            <tr key={position.id || index} className="border-b border-border/50">
                              <td className="p-2 font-mono text-xs">
                                {position.id?.substring(0, 8) || `#${index + 1}`}
                              </td>
                              <td className="p-2">{formatNumber(position.buyPrice, 8)}</td>
                              <td className="p-2">{formatNumber(position.currentPrice, 8)}</td>
                              <td className="p-2">{formatNumber(position.amountOut)}</td>
                              <td className="p-2">{formatNumber(position.currentValue)}</td>
                              <td
                                className={`p-2 font-bold ${position.pnlPercent >= 0 ? "text-chart-4" : "text-chart-2"}`}
                              >
                                {formatPercent(position.pnlPercent)}
                              </td>
                              <td
                                className={`p-2 font-bold ${position.pnlAbsolute >= 0 ? "text-chart-4" : "text-chart-2"}`}
                              >
                                {formatNumber(position.pnlAbsolute, 6)}
                              </td>
                              <td className="p-2">{formatNumber(position.ageHours, 1)}h</td>
                              <td className="p-2">{position.dcaInfo?.tranches?.length || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trades Tab */}
            <TabsContent value="trades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Trades ({trades.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trades.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No recent trades</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2">Time</th>
                            <th className="text-left p-2">Side</th>
                            <th className="text-left p-2">Amount In</th>
                            <th className="text-left p-2">Amount Out</th>
                            <th className="text-left p-2">Profit</th>
                            <th className="text-left p-2">Profit %</th>
                            <th className="text-left p-2">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trades.map((trade, index) => (
                            <tr key={index} className="border-b border-border/50">
                              <td className="p-2 text-xs">{new Date(trade.timestamp).toLocaleString()}</td>
                              <td className="p-2">
                                <Badge variant={trade.side === "BUY" ? "default" : "secondary"}>{trade.side}</Badge>
                              </td>
                              <td className="p-2">{trade.displayAmountIn}</td>
                              <td className="p-2">{trade.displayAmountOut}</td>
                              <td
                                className={`p-2 ${trade.hasProfit ? (trade.profit >= 0 ? "text-chart-4" : "text-chart-2") : "text-muted-foreground"}`}
                              >
                                {trade.displayProfit}
                              </td>
                              <td
                                className={`p-2 ${trade.hasProfit ? (trade.profit >= 0 ? "text-chart-4" : "text-chart-2") : "text-muted-foreground"}`}
                              >
                                {trade.displayProfitPct}
                              </td>
                              <td className="p-2 text-xs text-muted-foreground">{trade.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Trading Volume
                    </CardTitle>
                    <Select value={volumeTimeframe} onValueChange={setVolumeTimeframe}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="7d">7d</SelectItem>
                        <SelectItem value="30d">30d</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <Bar data={getVolumeChartData()} options={getChartOptions("Trading Volume", "Volume (ETH)")} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total Volume</p>
                        <p className="font-bold">{formatNumber(volumeData?.totalVolume || 0)} ETH</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Avg Trade Size</p>
                        <p className="font-bold">{formatNumber(volumeData?.avgTradeSize || 0)} ETH</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade Activity Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Trade Activity
                    </CardTitle>
                    <Select value={tradesTimeframe} onValueChange={setTradesTimeframe}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="7d">7d</SelectItem>
                        <SelectItem value="30d">30d</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <Line
                        data={getTradesChartData()}
                        options={getChartOptions("Trade Activity", "Number of Trades")}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total Trades</p>
                        <p className="font-bold">{tradesData?.totalTrades || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Win Rate</p>
                        <p className="font-bold">{formatPercent(tradesData?.winRate || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Portfolio Balance Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5" />
                      Portfolio Balance
                    </CardTitle>
                    <Select value={portfolioTimeframe} onValueChange={setPortfolioTimeframe}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="7d">7d</SelectItem>
                        <SelectItem value="30d">30d</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <Line
                        data={getPortfolioChartData()}
                        options={getChartOptions("Portfolio Balance", "Value (USD)")}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Current Balance</p>
                        <p className="font-bold">{formatCurrency(portfolioData?.currentBalance || 0)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">24h Change</p>
                        <p
                          className={`font-bold ${(portfolioData?.change24h || 0) >= 0 ? "text-chart-4" : "text-chart-2"}`}
                        >
                          {(portfolioData?.change24h || 0) >= 0 ? "+" : ""}
                          {formatPercent(portfolioData?.change24h || 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* P&L Chart */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Cumulative P&L
                    </CardTitle>
                    <Select value={pnlTimeframe} onValueChange={setPnlTimeframe}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24h</SelectItem>
                        <SelectItem value="7d">7d</SelectItem>
                        <SelectItem value="30d">30d</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 mb-4">
                      <Line data={getPnLChartData()} options={getChartOptions("Cumulative P&L", "P&L (ETH)")} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <div className="text-center">
                        <p className="text-muted-foreground">Total P&L</p>
                        <p className={`font-bold ${(pnlData?.totalPnL || 0) >= 0 ? "text-chart-4" : "text-chart-2"}`}>
                          {formatNumber(pnlData?.totalPnL || 0, 6)} ETH
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Unrealized P&L</p>
                        <p
                          className={`font-bold ${(pnlData?.unrealizedPnL || 0) >= 0 ? "text-chart-4" : "text-chart-2"}`}
                        >
                          {formatNumber(pnlData?.unrealizedPnL || 0, 6)} ETH
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Bot Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Dip Thresholds</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Dip:</span>
                          <span>8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Moderate Dip:</span>
                          <span>12%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Major Dip:</span>
                          <span>18%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Profit Targets</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Recovery Target:</span>
                          <span>6%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Profit:</span>
                          <span>8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stop Loss:</span>
                          <span>15%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Risk Management</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Positions:</span>
                          <span>2</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Exposure:</span>
                          <span>1.0 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base Order:</span>
                          <span>0.05 ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}

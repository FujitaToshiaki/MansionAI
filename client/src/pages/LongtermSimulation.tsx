import { useState, useMemo } from "react";
import { useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Info, LayoutDashboard, List, History, BarChart, AlertTriangle, CheckCircle, Plus, Trash2, ArrowUpCircle } from "lucide-react";
import { SubNav } from "@/components/SubNav";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
} from "recharts";

const PLAN_YEARS = 30;

const REPAIR_SCHEDULE: { year: number; cost: number; label: string }[] = [
  { year: 2025, cost: 1200, label: "屋上防水工事" },
  { year: 2026, cost: 850, label: "消防設備更新" },
  { year: 2028, cost: 12000, label: "第2回大規模修繕" },
  { year: 2030, cost: 600, label: "給水管更新" },
  { year: 2031, cost: 400, label: "排水管清掃・更新" },
  { year: 2035, cost: 1500, label: "EV設備更新" },
  { year: 2037, cost: 1200, label: "屋上防水（2回目）" },
  { year: 2038, cost: 850, label: "電気設備更新" },
  { year: 2040, cost: 14000, label: "第3回大規模修繕" },
  { year: 2043, cost: 700, label: "給水管2回目更新" },
  { year: 2045, cost: 1800, label: "EV設備2回目更新" },
  { year: 2050, cost: 1000, label: "外構改修" },
];

const INITIAL_BALANCE = 9600;

interface StepUp {
  yearsAfterStart: number;
  increaseAmount: number;
}

function calcSimulation(
  monthlyFeePerUnit: number,
  totalUnits: number,
  startYear: number,
  stepUps: StepUp[]
) {
  const results: {
    year: number;
    income: number;
    expense: number;
    netCashflow: number;
    balance: number;
    isNegative: boolean;
    monthlyFee: number;
  }[] = [];

  let balance = INITIAL_BALANCE;

  const validSteps = stepUps
    .filter((s) => s.yearsAfterStart > 0 && s.increaseAmount !== 0)
    .sort((a, b) => a.yearsAfterStart - b.yearsAfterStart);

  for (let i = 0; i < PLAN_YEARS; i++) {
    const year = startYear + i;

    let currentFee = monthlyFeePerUnit;
    for (const step of validSteps) {
      if (i >= step.yearsAfterStart) {
        currentFee += step.increaseAmount;
      }
    }

    const income = Math.round((currentFee * totalUnits * 12) / 10000);
    const repairItem = REPAIR_SCHEDULE.find((r) => r.year === year);
    const expense = repairItem ? repairItem.cost : 0;
    const netCashflow = income - expense;
    balance += netCashflow;
    results.push({
      year,
      income,
      expense,
      netCashflow,
      balance,
      isNegative: balance < 0,
      monthlyFee: currentFee,
    });
  }
  return results;
}

function formatManYen(val: number) {
  if (Math.abs(val) >= 10000) return `${(val / 10000).toFixed(1)}億円`;
  return `${val.toLocaleString()}万円`;
}

interface BalanceDotProps {
  cx?: number;
  cy?: number;
  payload?: { isNegative: boolean };
}

const CustomBalanceDot = ({ cx, cy, payload }: BalanceDotProps) => {
  if (cx === undefined || cy === undefined) return null;
  if (payload?.isNegative) {
    return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#ef4444" />;
  }
  return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="#3b82f6" />;
};

const MAX_STEP_UPS = 5;

export default function LongtermSimulation() {
  const params = new URLSearchParams(useSearch());
  const condominiumId = params.get("condominiumId") ?? "1";

  const [monthlyFeePerUnit, setMonthlyFeePerUnit] = useState(200);
  const [totalUnits] = useState(80);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [startYear, setStartYear] = useState(currentYear);
  const [startMonth, setStartMonth] = useState(currentMonth);

  const [stepUps, setStepUps] = useState<StepUp[]>([]);

  const addStepUp = () => {
    if (stepUps.length >= MAX_STEP_UPS) return;
    const nextYear = stepUps.length > 0 ? stepUps[stepUps.length - 1].yearsAfterStart + 3 : 3;
    setStepUps([...stepUps, { yearsAfterStart: nextYear, increaseAmount: 50 }]);
  };

  const removeStepUp = (index: number) => {
    setStepUps(stepUps.filter((_, i) => i !== index));
  };

  const updateStepUp = (index: number, field: keyof StepUp, value: number) => {
    const updated = [...stepUps];
    updated[index] = { ...updated[index], [field]: value };
    setStepUps(updated);
  };

  const simData = useMemo(
    () => calcSimulation(monthlyFeePerUnit, totalUnits, startYear, stepUps),
    [monthlyFeePerUnit, totalUnits, startYear, stepUps]
  );

  const totalIncome = simData.reduce((s, d) => s + d.income, 0);
  const totalExpense = simData.reduce((s, d) => s + d.expense, 0);
  const finalBalance = simData[simData.length - 1]?.balance ?? 0;
  const deficitYear = simData.find((d) => d.isNegative)?.year ?? null;

  const balanceData = simData.map((d) => ({
    ...d,
    balancePositive: d.balance >= 0 ? d.balance : null,
    balanceNegative: d.balance < 0 ? d.balance : null,
  }));

  const stepUpRefLines = stepUps
    .filter((s) => s.yearsAfterStart > 0 && s.increaseAmount !== 0)
    .sort((a, b) => a.yearsAfterStart - b.yearsAfterStart)
    .map((s) => ({ year: startYear + s.yearsAfterStart, amount: s.increaseAmount }));

  const existingData = [
    { year: "2024", current: 9600, level: 9600, stepwise: 9600 },
    { year: "2029", current: 11000, level: 12500, stepwise: 11500 },
    { year: "2034", current: 4500, level: 9500, stepwise: 7500 },
    { year: "2039", current: -2000, level: 8500, stepwise: 5000 },
    { year: "2044", current: -8500, level: 7500, stepwise: 2500 },
    { year: "2049", current: -12000, level: 6500, stepwise: -500 },
    { year: "2054", current: -15000, level: 5500, stepwise: -2000 },
  ];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500 flex items-center gap-1">
        <Link href={`/condominiums/${condominiumId}`} className="hover:text-gray-700 hover:underline">
          マンション詳細
        </Link>
        <span className="text-gray-300">/</span>
        <Link href={`/longterm/dashboard?condominiumId=${condominiumId}`} className="hover:text-gray-700 hover:underline">
          長期修繕計画
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">積立金シミュレーション</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">修繕積立金シミュレーション</h1>
        <SubNav
          items={[
            { label: "修繕計画ダッシュボード", path: `/longterm/dashboard?condominiumId=${condominiumId}`, icon: LayoutDashboard },
            { label: "修繕項目一覧", path: `/longterm/items?condominiumId=${condominiumId}`, icon: List },
            { label: "修繕履歴", path: `/longterm/history?condominiumId=${condominiumId}`, icon: History },
            { label: "積立金シミュレーション", path: `/longterm/simulation?condominiumId=${condominiumId}`, icon: TrendingUp },
            { label: "AI見直し分析", path: `/longterm/analysis?condominiumId=${condominiumId}`, icon: BarChart },
          ]}
        />
      </div>

      {/* Simulation Input Panel */}
      <Card className="bg-white border-blue-100 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            シミュレーション条件設定
          </CardTitle>
          <p className="text-sm text-gray-500">入力値を変更するとグラフと集計が自動的に更新されます</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Basic params + Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="input-monthly-fee" className="text-sm font-semibold text-gray-700">
                戸当たり月額積立金（円）
              </Label>
              <Input
                id="input-monthly-fee"
                data-testid="input-monthly-fee"
                type="number"
                min={100}
                max={500}
                step={10}
                value={monthlyFeePerUnit}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setMonthlyFeePerUnit(Math.max(100, Math.min(500, v)));
                }}
                className="w-36 text-right font-semibold"
              />
              <p className="text-xs text-gray-400">相場: 100円 〜 500円</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">総戸数（戸）</Label>
              <p data-testid="text-total-units" className="text-2xl font-bold text-gray-900 pt-1">
                {totalUnits}戸
              </p>
              <p className="text-xs text-gray-400">物件固有の固定値</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">シミュレーション開始年月</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="input-start-year"
                  data-testid="input-start-year"
                  type="number"
                  min={2020}
                  max={2040}
                  step={1}
                  value={startYear}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setStartYear(Math.max(2020, Math.min(2040, v)));
                  }}
                  className="w-24 text-right font-semibold"
                />
                <span className="text-sm text-gray-500">年</span>
                <Input
                  id="input-start-month"
                  data-testid="input-start-month"
                  type="number"
                  min={1}
                  max={12}
                  step={1}
                  value={startMonth}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setStartMonth(Math.max(1, Math.min(12, v)));
                  }}
                  className="w-16 text-right font-semibold"
                />
                <span className="text-sm text-gray-500">月</span>
              </div>
              <p className="text-xs text-gray-400">計算の基準年月</p>
            </div>
          </div>

          {/* Summary row */}
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            年間収入試算：
            <span className="font-bold">
              {formatManYen(Math.round((monthlyFeePerUnit * totalUnits * 12) / 10000))}
            </span>
            　（{monthlyFeePerUnit.toLocaleString()}円 × {totalUnits}戸 × 12ヶ月）　
            <span className="text-blue-500">
              　計算基準: {startYear}年{startMonth}月〜（{PLAN_YEARS}年間）
            </span>
          </div>

          {/* Step-up Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ArrowUpCircle className="w-4 h-4 text-amber-500" />
                  段階値上げ設定（最大{MAX_STEP_UPS}ステップ）
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  開始年月からN年後にX円/戸値上げ。グラフに縦線で表示されます。
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={addStepUp}
                disabled={stepUps.length >= MAX_STEP_UPS}
                data-testid="button-add-stepup"
                className="flex items-center gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <Plus className="w-4 h-4" />
                ステップを追加
              </Button>
            </div>

            {stepUps.length === 0 && (
              <div className="text-xs text-gray-400 italic py-2 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                段階値上げなし（現在の月額を{PLAN_YEARS}年間維持）
              </div>
            )}

            {stepUps.map((step, idx) => (
              <div
                key={idx}
                data-testid={`stepup-row-${idx}`}
                className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-100 rounded-lg"
              >
                <span className="text-xs font-bold text-amber-600 w-6 text-center">#{idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">開始から</span>
                  <Input
                    data-testid={`input-stepup-years-${idx}`}
                    type="number"
                    min={1}
                    max={29}
                    step={1}
                    value={step.yearsAfterStart}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) updateStepUp(idx, "yearsAfterStart", Math.max(1, Math.min(29, v)));
                    }}
                    className="w-16 text-right font-semibold text-sm"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">年後（{startYear + step.yearsAfterStart}年）に</span>
                  <Input
                    data-testid={`input-stepup-amount-${idx}`}
                    type="number"
                    min={-500}
                    max={500}
                    step={10}
                    value={step.increaseAmount}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!isNaN(v)) updateStepUp(idx, "increaseAmount", v);
                    }}
                    className="w-20 text-right font-semibold text-sm"
                  />
                  <span className="text-xs text-gray-500 whitespace-nowrap">円/戸 値上げ</span>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                    → {monthlyFeePerUnit + stepUps.slice(0, idx + 1).reduce((s, s2) => s + s2.increaseAmount, 0)}円/戸
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStepUp(idx)}
                    data-testid={`button-remove-stepup-${idx}`}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-1 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Annual Cashflow Bar Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">年間収支グラフ（{PLAN_YEARS}年間）</CardTitle>
          <p className="text-sm text-gray-500">
            青：積立金収入　オレンジ：修繕工事費支出　折れ線：純収支
            {stepUpRefLines.length > 0 && "　縦線：値上げタイミング"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full" data-testid="chart-annual-cashflow">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={simData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickFormatter={(y) => `'${String(y).slice(2)}`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v) => `${v.toLocaleString()}`}
                  tick={{ fontSize: 11 }}
                  unit="万"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()}万円`,
                    name,
                  ]}
                  labelFormatter={(label) => `${label}年度`}
                />
                <Legend />
                {stepUpRefLines.map((ref, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={ref.year}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: `+${ref.amount}円`, fill: "#b45309", fontSize: 10, position: "top" }}
                  />
                ))}
                <Bar dataKey="income" name="積立金収入" fill="#3b82f6" barSize={10} />
                <Bar dataKey="expense" name="修繕工事費支出" fill="#f97316" barSize={10} />
                <Line
                  type="monotone"
                  dataKey="netCashflow"
                  name="純収支"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Balance Line Chart */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">積立金残高推移グラフ（{PLAN_YEARS}年間）</CardTitle>
          <p className="text-sm text-gray-500">
            残高がマイナスになる年は赤色で表示されます
            {stepUpRefLines.length > 0 && "　縦線：値上げタイミング"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full" data-testid="chart-balance">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={balanceData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="year"
                  tickFormatter={(y) => `'${String(y).slice(2)}`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  tickFormatter={(v) => `${v.toLocaleString()}`}
                  tick={{ fontSize: 11 }}
                  unit="万"
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()}万円`,
                    name,
                  ]}
                  labelFormatter={(label) => `${label}年度`}
                />
                <Legend />
                <ReferenceLine
                  y={0}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: "残高 0", fill: "#ef4444", fontSize: 11 }}
                />
                {stepUpRefLines.map((ref, idx) => (
                  <ReferenceLine
                    key={idx}
                    x={ref.year}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: `+${ref.amount}円`, fill: "#b45309", fontSize: 10, position: "top" }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="balancePositive"
                  name="積立金残高（黒字）"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={<CustomBalanceDot />}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="balanceNegative"
                  name="積立金残高（赤字）"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={<CustomBalanceDot />}
                  connectNulls={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={finalBalance < 0 ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">30年後 最終残高</p>
            <p
              className={`text-xl font-bold mt-1 ${finalBalance < 0 ? "text-red-600" : "text-green-600"}`}
              data-testid="text-final-balance"
            >
              {finalBalance >= 0 ? "+" : ""}
              {formatManYen(finalBalance)}
            </p>
            {finalBalance < 0 ? (
              <Badge className="mt-2 bg-red-100 text-red-700 border-red-200 text-xs" data-testid="badge-deficit-warning">
                <AlertTriangle className="w-3 h-3 mr-1" />
                資金不足
              </Badge>
            ) : (
              <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-xs" data-testid="badge-surplus-ok">
                <CheckCircle className="w-3 h-3 mr-1" />
                健全運用
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className={deficitYear ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">資金不足転落年</p>
            <p
              className={`text-xl font-bold mt-1 ${deficitYear ? "text-red-600" : "text-green-600"}`}
              data-testid="text-deficit-year"
            >
              {deficitYear ? `${deficitYear}年` : "問題なし"}
            </p>
            {deficitYear && (
              <p className="text-xs text-red-500 mt-1">
                開始から {deficitYear - startYear}年目
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">30年間 総収入</p>
            <p className="text-xl font-bold text-blue-600 mt-1" data-testid="text-total-income">
              {formatManYen(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">30年間 総支出</p>
            <p className="text-xl font-bold text-orange-600 mt-1" data-testid="text-total-expense">
              {formatManYen(totalExpense)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Existing Comparison Section */}
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">30年間積立金残高推移予測（方式比較）</CardTitle>
          <p className="text-sm text-gray-500">現行方式では2039年頃に資金不足に陥る可能性があります</p>
        </CardHeader>
        <CardContent>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={existingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" />
                <YAxis unit="万円" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="現行方式（据置）"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  name="均等積立方式（推奨）"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="stepwise"
                  name="段階増額方式"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-red-700">現行方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">▲1.5億円</p>
            <p className="text-xs text-red-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-red-100 text-red-700 border-red-200">資金不足リスク高</Badge>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-green-700">均等積立方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">+5,500万円</p>
            <p className="text-xs text-green-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">健全・安定運用</Badge>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-blue-700">段階増額方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">▲2,000万円</p>
            <p className="text-xs text-blue-500 mt-1">30年後最終残高</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700 border-blue-200">将来の負担増大</Badge>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">5年ごとの推移予測（単位：万円）</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">年度</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">現行方式</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">均等積立</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500 text-right">段階増額</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {existingData.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.year}年度</td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${row.current < 0 ? "text-red-600" : "text-gray-700"}`}>
                    {row.current.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-right font-medium">
                    {row.level.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${row.stepwise < 0 ? "text-red-600" : "text-gray-700"}`}>
                    {row.stepwise.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

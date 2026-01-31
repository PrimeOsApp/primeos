import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import ExpenseCard from "@/components/costs/ExpenseCard";
import ExpenseForm from "@/components/costs/ExpenseForm";
import AssetForm from "@/components/costs/AssetForm";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, TrendingDown, Building2, Repeat, Search, Plus,
  MoreVertical, Laptop, Car, Home
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const assetTypeIcons = {
  equipment: "🔧",
  software: "💻",
  vehicle: "🚗",
  property: "🏢",
  intellectual_property: "💡",
  other: "📦"
};

const assetStatusColors = {
  active: "bg-emerald-100 text-emerald-700",
  maintenance: "bg-amber-100 text-amber-700",
  retired: "bg-slate-100 text-slate-600"
};

export default function CostStructure() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: () => base44.entities.Expense.list("-created_date")
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: () => base44.entities.Asset.list("-created_date")
  });

  // Expense mutations
  const createExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowExpenseForm(false);
      setEditingExpense(null);
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Expense.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowExpenseForm(false);
      setEditingExpense(null);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.Expense.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expenses"] })
  });

  // Asset mutations
  const createAssetMutation = useMutation({
    mutationFn: (data) => base44.entities.Asset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setShowAssetForm(false);
      setEditingAsset(null);
    }
  });

  const updateAssetMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Asset.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setShowAssetForm(false);
      setEditingAsset(null);
    }
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.Asset.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] })
  });

  const handleSaveExpense = (data) => {
    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, data });
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const handleSaveAsset = (data) => {
    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data });
    } else {
      createAssetMutation.mutate(data);
    }
  };

  const handleMarkPaid = (expense) => {
    updateExpenseMutation.mutate({
      id: expense.id,
      data: { ...expense, status: "paid" }
    });
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const paidExpenses = expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + (e.amount || 0), 0);
  const recurringExpenses = expenses.filter(e => e.frequency !== "one_time").reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalAssetValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Cost Structure & Infrastructure"
          subtitle="Track expenses, assets, and manage your cost structure"
          icon={DollarSign}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Expenses"
            value={`$${totalExpenses.toLocaleString()}`}
            icon={DollarSign}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
          />
          <StatCard
            title="Paid"
            value={`$${paidExpenses.toLocaleString()}`}
            icon={TrendingDown}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="Recurring"
            value={`$${recurringExpenses.toLocaleString()}`}
            icon={Repeat}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            title="Asset Value"
            value={`$${totalAssetValue.toLocaleString()}`}
            icon={Building2}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="assets">Assets & Infrastructure</TabsTrigger>
            </TabsList>
            <Button
              onClick={() => activeTab === "expenses" ? setShowExpenseForm(true) : setShowAssetForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add {activeTab === "expenses" ? "Expense" : "Asset"}
            </Button>
          </div>

          <TabsContent value="expenses">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fixed_costs">Fixed Costs</SelectItem>
                  <SelectItem value="variable_costs">Variable Costs</SelectItem>
                  <SelectItem value="salaries">Salaries</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="professional_services">Professional Services</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expense Grid */}
            {filteredExpenses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onEdit={(e) => {
                        setEditingExpense(e);
                        setShowExpenseForm(true);
                      }}
                      onDelete={(e) => deleteExpenseMutation.mutate(e.id)}
                      onMarkPaid={handleMarkPaid}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No expenses yet"
                description="Start tracking your business expenses and costs."
                actionLabel="Add Expense"
                onAction={() => setShowExpenseForm(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="assets">
            {assets.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {assets.map((asset) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{assetTypeIcons[asset.type]}</span>
                          <div>
                            <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                            <span className="text-xs text-slate-500 capitalize">{asset.type?.replace(/_/g, " ")}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingAsset(asset);
                              setShowAssetForm(true);
                            }}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteAssetMutation.mutate(asset.id)} className="text-rose-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="text-2xl font-bold text-slate-900 mb-3">${asset.value?.toLocaleString()}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={cn("text-xs border-0", assetStatusColors[asset.status])}>
                          {asset.status}
                        </Badge>
                        {asset.depreciation_years && (
                          <Badge variant="outline" className="text-xs">
                            {asset.depreciation_years}yr depreciation
                          </Badge>
                        )}
                      </div>

                      {(asset.location || asset.assigned_to) && (
                        <div className="text-xs text-slate-500 space-y-1">
                          {asset.location && <p>📍 {asset.location}</p>}
                          {asset.assigned_to && <p>👤 {asset.assigned_to}</p>}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState
                icon={Building2}
                title="No assets yet"
                description="Track your business assets and infrastructure."
                actionLabel="Add Asset"
                onAction={() => setShowAssetForm(true)}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Forms */}
        <ExpenseForm
          open={showExpenseForm}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          expense={editingExpense}
          isLoading={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        />

        <AssetForm
          open={showAssetForm}
          onClose={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
          onSave={handleSaveAsset}
          asset={editingAsset}
          isLoading={createAssetMutation.isPending || updateAssetMutation.isPending}
        />
      </div>
    </div>
  );
}
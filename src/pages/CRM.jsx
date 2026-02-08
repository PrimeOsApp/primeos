import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import CustomerCard from "@/components/crm/CustomerCard";
import CustomerForm from "@/components/crm/CustomerForm";
import InteractionForm from "@/components/crm/InteractionForm";
import QuickActions from "@/components/crm/QuickActions";
import PipelinePreview from "@/components/crm/PipelinePreview";
import ConversionMetrics from "@/components/crm/ConversionMetrics";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, UserCheck, Search, TrendingUp, MessageCircle } from "lucide-react";

export default function CRM() {
  const [showForm, setShowForm] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date")
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: () => base44.entities.Lead.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setEditingCustomer(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      setEditingCustomer(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Customer.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] })
  });

  const interactionMutation = useMutation({
    mutationFn: (data) => base44.entities.Interaction.create(data),
    onSuccess: () => {
      setShowInteraction(false);
      setSelectedCustomer(null);
    }
  });

  const handleSave = (data) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleInteraction = (customer) => {
    setSelectedCustomer(customer);
    setShowInteraction(true);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSegment = segmentFilter === "all" || c.segment === segmentFilter;
    return matchesSearch && matchesStatus && matchesSegment;
  });

  const activeCount = customers.filter(c => c.status === "active").length;
  const leadsCount = customers.filter(c => c.status === "lead").length;
  const totalValue = customers.reduce((sum, c) => sum + (c.lifetime_value || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Customer Relationships"
          subtitle="Manage your customer segments and relationships"
          icon={Users}
          actionLabel="Add Customer"
          onAction={() => setShowForm(true)}
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Customers"
            value={customers.length}
            icon={Users}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <StatCard
            title="Active Customers"
            value={activeCount}
            icon={UserCheck}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            title="New Leads"
            value={leadsCount}
            icon={UserPlus}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            title="Lifetime Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={TrendingUp}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* CRM Tools Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <QuickActions />
          <PipelinePreview leads={leads} />
          <ConversionMetrics leads={leads} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="small_business">Small Business</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Grid */}
        {filteredCustomers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={(c) => deleteMutation.mutate(c.id)}
                  onInteraction={handleInteraction}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Start building your customer relationships by adding your first customer."
            actionLabel="Add Customer"
            onAction={() => setShowForm(true)}
          />
        )}

        {/* Forms */}
        <CustomerForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={handleSave}
          customer={editingCustomer}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        <InteractionForm
          open={showInteraction}
          onClose={() => {
            setShowInteraction(false);
            setSelectedCustomer(null);
          }}
          onSave={(data) => interactionMutation.mutate(data)}
          customer={selectedCustomer}
          isLoading={interactionMutation.isPending}
        />
      </div>
    </div>
  );
}
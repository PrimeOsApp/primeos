import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, Users, FileText, Package, ArrowRight, 
  Phone, Mail, Building2, Plus, Send, Copy, ExternalLink,
  ChevronRight, Sparkles, Loader2, CheckCircle, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const pipelineStages = [
  { id: "whatsapp", label: "WhatsApp Contact", icon: MessageCircle, color: "bg-green-500" },
  { id: "crm", label: "CRM Entry", icon: Users, color: "bg-indigo-500" },
  { id: "script", label: "Sales Script", icon: FileText, color: "bg-purple-500" },
  { id: "catalog", label: "Product Catalog", icon: Package, color: "bg-emerald-500" }
];

export default function CustomerPipeline() {
  const [activeStage, setActiveStage] = useState("whatsapp");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [salesScript, setSalesScript] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => base44.entities.Customer.list("-created_date")
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => base44.entities.Product.filter({ status: "active" })
  });

  const { data: interactions = [] } = useQuery({
    queryKey: ["interactions", selectedCustomer?.id],
    queryFn: () => selectedCustomer ? base44.entities.Interaction.filter({ customer_id: selectedCustomer.id }) : [],
    enabled: !!selectedCustomer
  });

  const createCustomerMutation = useMutation({
    mutationFn: (data) => base44.entities.Customer.create(data),
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setSelectedCustomer(newCustomer);
      setShowNewCustomer(false);
      setActiveStage("crm");
      toast.success("Customer added to CRM!");
    }
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Customer.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const createInteractionMutation = useMutation({
    mutationFn: (data) => base44.entities.Interaction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interactions"] });
    }
  });

  const createSaleMutation = useMutation({
    mutationFn: (data) => base44.entities.Sale.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("Sale created successfully!");
      setSelectedProducts([]);
      // Update customer status to active
      if (selectedCustomer) {
        updateCustomerMutation.mutate({
          id: selectedCustomer.id,
          data: { ...selectedCustomer, status: "active" }
        });
      }
    }
  });

  const generateSalesScript = async () => {
    if (!selectedCustomer) return;
    setGeneratingScript(true);
    
    try {
      const productList = selectedProducts.length > 0 
        ? selectedProducts.map(p => `- ${p.name}: $${p.price} - ${p.description}`).join("\n")
        : products.slice(0, 4).map(p => `- ${p.name}: $${p.price} - ${p.description}`).join("\n");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a friendly WhatsApp sales script for a customer with these details:
          
Customer: ${selectedCustomer.name}
Company: ${selectedCustomer.company || "N/A"}
Segment: ${selectedCustomer.segment || "individual"}
Status: ${selectedCustomer.status}
Notes: ${selectedCustomer.notes || "No previous notes"}

Products to offer:
${productList}

Create a conversational, professional WhatsApp message script that:
1. Greets the customer personally
2. Briefly introduces the value proposition
3. Highlights 1-2 relevant products based on their segment
4. Includes a clear call-to-action
5. Is concise and mobile-friendly

Format it ready to copy and paste to WhatsApp.`,
        response_json_schema: {
          type: "object",
          properties: {
            greeting: { type: "string" },
            value_proposition: { type: "string" },
            product_pitch: { type: "string" },
            call_to_action: { type: "string" },
            full_script: { type: "string" }
          }
        }
      });
      
      setSalesScript(response.full_script || `Hi ${selectedCustomer.name}! 👋\n\n${response.greeting}\n\n${response.value_proposition}\n\n${response.product_pitch}\n\n${response.call_to_action}`);
    } catch (error) {
      console.error("Error generating script:", error);
      setSalesScript(`Hi ${selectedCustomer.name}! 👋\n\nI wanted to reach out regarding our products that might be perfect for your needs.\n\nWould you be interested in learning more? I'd love to schedule a quick call to discuss how we can help!`);
    }
    
    setGeneratingScript(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const openWhatsApp = (phone, message) => {
    const cleanPhone = phone?.replace(/\D/g, "") || "";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateProductQuantity = (productId, quantity) => {
    setSelectedProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, quantity: Math.max(1, quantity) } : p)
    );
  };

  const createSaleFromSelection = () => {
    if (!selectedCustomer || selectedProducts.length === 0) return;
    
    const saleProducts = selectedProducts.map(p => ({
      product_id: p.id,
      product_name: p.name,
      quantity: p.quantity,
      unit_price: p.price,
      total: p.price * p.quantity
    }));

    const totalAmount = saleProducts.reduce((sum, p) => sum + p.total, 0);

    createSaleMutation.mutate({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      products: saleProducts,
      total_amount: totalAmount,
      channel: "whatsapp",
      status: "pending",
      payment_status: "pending"
    });

    // Log interaction
    createInteractionMutation.mutate({
      customer_id: selectedCustomer.id,
      type: "whatsapp",
      subject: "WhatsApp Sale Created",
      description: `Created sale for ${selectedProducts.length} products totaling $${totalAmount}`,
      outcome: "positive"
    });
  };

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    segment: "individual",
    source: "whatsapp",
    status: "lead"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-600" />
            Customer Sales Pipeline
          </h1>
          <p className="text-slate-500 mt-1">WhatsApp → CRM → Sales Script → Product Catalog → Sale</p>
        </motion.div>

        {/* Pipeline Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-center justify-between relative">
            {pipelineStages.map((stage, idx) => (
              <div key={stage.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 transition-all z-10",
                    activeStage === stage.id ? "scale-110" : "opacity-60 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                    activeStage === stage.id ? stage.color + " text-white shadow-lg" : "bg-slate-100 text-slate-500"
                  )}>
                    <stage.icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium text-center",
                    activeStage === stage.id ? "text-slate-900" : "text-slate-500"
                  )}>
                    {stage.label}
                  </span>
                </button>
                {idx < pipelineStages.length - 1 && (
                  <div className="flex-1 flex items-center justify-center px-2">
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stage 1: WhatsApp Contact / Customer Selection */}
          <AnimatePresence mode="wait">
            {activeStage === "whatsapp" && (
              <motion.div
                key="whatsapp"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-3"
              >
                <Card className="border-0 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      Select or Add WhatsApp Customer
                    </CardTitle>
                    <Button onClick={() => setShowNewCustomer(true)} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      New Contact
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {customers.map((customer) => (
                        <motion.div
                          key={customer.id}
                          whileHover={{ y: -2 }}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setActiveStage("crm");
                          }}
                          className={cn(
                            "p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedCustomer?.id === customer.id
                              ? "border-green-500 bg-green-50"
                              : "border-slate-100 hover:border-green-200 bg-white"
                          )}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                              {customer.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{customer.name}</h3>
                              <p className="text-xs text-slate-500">{customer.company || customer.segment}</p>
                            </div>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-green-500" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <Badge variant="outline" className="text-xs">
                              {customer.status}
                            </Badge>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Stage 2: CRM Entry */}
            {activeStage === "crm" && selectedCustomer && (
              <motion.div
                key="crm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-3"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Customer Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                          {selectedCustomer.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                          {selectedCustomer.company && (
                            <p className="text-slate-500 flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {selectedCustomer.company}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Phone</p>
                          <p className="font-medium">{selectedCustomer.phone || "Not provided"}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Email</p>
                          <p className="font-medium truncate">{selectedCustomer.email || "Not provided"}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Segment</p>
                          <Badge className="bg-indigo-100 text-indigo-700">{selectedCustomer.segment || "individual"}</Badge>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Status</p>
                          <Badge className="bg-emerald-100 text-emerald-700">{selectedCustomer.status}</Badge>
                        </div>
                      </div>

                      {selectedCustomer.notes && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs text-amber-600 mb-1">Notes</p>
                          <p className="text-sm text-amber-900">{selectedCustomer.notes}</p>
                        </div>
                      )}

                      <Button
                        onClick={() => setActiveStage("script")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        Continue to Sales Script
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Interaction History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        {interactions.length > 0 ? (
                          <div className="space-y-3">
                            {interactions.map((interaction) => (
                              <div key={interaction.id} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant="outline" className="text-xs">{interaction.type}</Badge>
                                  <span className="text-xs text-slate-400">
                                    {new Date(interaction.created_date).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="font-medium text-sm">{interaction.subject}</p>
                                {interaction.description && (
                                  <p className="text-xs text-slate-500 mt-1">{interaction.description}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Clock className="w-8 h-8 mb-2" />
                            <p className="text-sm">No interactions yet</p>
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Stage 3: Sales Script */}
            {activeStage === "script" && selectedCustomer && (
              <motion.div
                key="script"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-3"
              >
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        AI Sales Script Generator
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-700 mb-2">
                          Generate a personalized WhatsApp sales script for <strong>{selectedCustomer.name}</strong>
                        </p>
                        <Button
                          onClick={generateSalesScript}
                          disabled={generatingScript}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          {generatingScript ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generate Script
                            </>
                          )}
                        </Button>
                      </div>

                      {salesScript && (
                        <div className="space-y-3">
                          <Label>Generated Script</Label>
                          <Textarea
                            value={salesScript}
                            onChange={(e) => setSalesScript(e.target.value)}
                            rows={10}
                            className="font-mono text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => copyToClipboard(salesScript)}
                              className="flex-1"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </Button>
                            {selectedCustomer.phone && (
                              <Button
                                onClick={() => openWhatsApp(selectedCustomer.phone, salesScript)}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send via WhatsApp
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => setActiveStage("catalog")}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                      >
                        Continue to Product Catalog
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Quick Product References</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {products.slice(0, 4).map((product) => (
                          <div
                            key={product.id}
                            className="p-3 bg-slate-50 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-slate-500">{product.description?.slice(0, 50)}...</p>
                            </div>
                            <span className="font-bold text-indigo-600">${product.price}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {/* Stage 4: Product Catalog & Sale */}
            {activeStage === "catalog" && selectedCustomer && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:col-span-3"
              >
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-emerald-600" />
                          Product Catalog
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {products.map((product) => {
                            const isSelected = selectedProducts.find(p => p.id === product.id);
                            return (
                              <motion.div
                                key={product.id}
                                whileHover={{ y: -2 }}
                                onClick={() => toggleProductSelection(product)}
                                className={cn(
                                  "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-slate-100 hover:border-emerald-200 bg-white"
                                )}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-slate-900">{product.name}</h3>
                                    <p className="text-xs text-slate-500">{product.category}</p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{product.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xl font-bold text-emerald-600">${product.price}</span>
                                  {product.whatsapp_enabled && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">
                                      <MessageCircle className="w-3 h-3 mr-1" />
                                      WhatsApp
                                    </Badge>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card className="border-0 shadow-sm sticky top-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-indigo-600" />
                          Order Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Customer</p>
                          <p className="font-medium">{selectedCustomer.name}</p>
                        </div>

                        {selectedProducts.length > 0 ? (
                          <>
                            <div className="space-y-2">
                              {selectedProducts.map((product) => (
                                <div key={product.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-slate-500">${product.price} each</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="1"
                                      value={product.quantity}
                                      onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 1)}
                                      className="w-16 h-8 text-center"
                                    />
                                    <span className="font-medium w-16 text-right">
                                      ${(product.price * product.quantity).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-emerald-600">
                                  ${selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={createSaleFromSelection}
                              disabled={createSaleMutation.isPending}
                              className="w-full bg-emerald-600 hover:bg-emerald-700"
                            >
                              {createSaleMutation.isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Create Sale
                            </Button>

                            {selectedCustomer.phone && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  const message = `Hi ${selectedCustomer.name}! Here's your order summary:\n\n${selectedProducts.map(p => `• ${p.name} x${p.quantity} - $${(p.price * p.quantity).toFixed(2)}`).join("\n")}\n\nTotal: $${selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}\n\nPlease confirm to proceed!`;
                                  openWhatsApp(selectedCustomer.phone, message);
                                }}
                                className="w-full"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Send Order via WhatsApp
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <Package className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Select products to create an order</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Customer Dialog */}
        <Dialog open={showNewCustomer} onOpenChange={setShowNewCustomer}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                New WhatsApp Contact
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div>
                <Label>WhatsApp Number *</Label>
                <Input
                  value={newCustomerForm.phone}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  value={newCustomerForm.company}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, company: e.target.value })}
                  placeholder="Company name"
                />
              </div>
              <div>
                <Label>Segment</Label>
                <Select
                  value={newCustomerForm.segment}
                  onValueChange={(v) => setNewCustomerForm({ ...newCustomerForm, segment: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="small_business">Small Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => createCustomerMutation.mutate(newCustomerForm)}
                disabled={!newCustomerForm.name || !newCustomerForm.phone || createCustomerMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createCustomerMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add to CRM
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const ShoppingCart = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
  </svg>
);
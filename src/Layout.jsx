import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  MessageCircle,
  Heart,
  ClipboardList,
  Calendar,
  TrendingUp,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Pipeline Pacientes", href: "PatientPipeline", icon: Heart },
  { name: "Agenda", href: "Agenda", icon: Calendar },
  { name: "Prontuários", href: "Prontuarios", icon: ClipboardList },
  { name: "Canais", href: "Canais", icon: Inbox },
  { name: "Jornada Cliente", href: "JornadaCliente", icon: TrendingUp },
  { name: "CRM", href: "CRM", icon: Users },
  { name: "Atividades", href: "Activities", icon: Activity },
  { name: "Custos", href: "CostStructure", icon: DollarSign },
  { name: "Receitas", href: "Revenue", icon: ShoppingCart },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NavItem = ({ item }) => {
    const isActive = currentPageName === item.href;
    return (
      <Link
        to={createPageUrl(item.href)}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
          isActive
            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
            : "text-slate-600 hover:bg-slate-100"
        )}
      >
        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600")} />
        <span className="font-medium">{item.name}</span>
        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Prime Odontologia</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Prime Odontologia</h1>
              <p className="text-xs text-slate-500">Sistema de Gestão</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
            <p className="text-sm font-medium text-indigo-900">primeodontologia.com.br</p>
            <p className="text-xs text-indigo-600 mt-1">Sistema completo de gestão</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
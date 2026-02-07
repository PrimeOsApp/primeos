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
  Inbox,
  Zap,
  Brain,
  FileText,
  Megaphone,
  BarChart3,
  BookOpen,
  Target,
  Puzzle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Marketing OS", href: "MarketingOS", icon: Zap, isNew: true },
  { name: "Pipeline Pacientes", href: "PatientPipeline", icon: Heart },
  { name: "Agenda", href: "Agenda", icon: Calendar },
  { name: "Prontuários", href: "Prontuarios", icon: ClipboardList },
  { name: "Canais Atendimento", href: "Canais", icon: Inbox },
  { name: "Jornada Cliente", href: "JornadaCliente", icon: TrendingUp },
  { name: "CRM", href: "CRM", icon: Users },
  { name: "CRM Avançado", href: "CRMAvancado", icon: Target },
  { name: "Estratégias", href: "Estrategias", icon: Brain },
  { name: "Conteúdos", href: "Conteudos", icon: FileText },
  { name: "Campanhas", href: "Campanhas", icon: Megaphone },
  { name: "Leads", href: "LeadsPipeline", icon: Users },
  { name: "Métricas", href: "Metricas", icon: BarChart3 },
  { name: "Sales", href: "Sales", icon: DollarSign },
  { name: "Scripts Vendas", href: "ScriptsVendas", icon: BookOpen },
  { name: "SOPs", href: "SOPs", icon: FileText },
  { name: "Business Model", href: "BusinessModelCanvas", icon: Puzzle },
  { name: "Estratégia", href: "Strategy", icon: Target },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const navRef = useState(null)[0];

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollTop(scrollTop > 20);
    setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 20);
  };

  const scrollNav = (direction) => {
    const container = document.getElementById('nav-container');
    if (container) {
      const scrollAmount = direction === 'up' ? -200 : 200;
      container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

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
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex-shrink-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Prime Odontologia</h1>
              <p className="text-xs text-slate-500">Sistema de Gestão</p>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {showScrollTop && (
              <div className="absolute top-0 left-0 right-0 z-10 flex justify-center py-2 bg-gradient-to-b from-white to-transparent">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollNav('up')}
                  className="h-6 w-full mx-4 bg-white/80 hover:bg-white border border-slate-200"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <nav 
              id="nav-container"
              className="space-y-2 overflow-y-auto h-full pr-2 py-2"
              onScroll={handleScroll}
            >
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {showScrollBottom && (
              <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center py-2 bg-gradient-to-t from-white to-transparent">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollNav('down')}
                  className="h-6 w-full mx-4 bg-white/80 hover:bg-white border border-slate-200"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 flex-shrink-0 border-t border-slate-200">
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
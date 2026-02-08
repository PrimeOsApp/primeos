import { useState, useEffect } from "react";
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
  ChevronUp,
  ListChecks,
  Sparkles,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import WhatsNewModal, { LATEST_VERSION } from "@/components/shared/WhatsNewModal";
import GlobalSearch from "@/components/shared/GlobalSearch";

const navigation = [
  { name: "Dashboard", href: "Dashboard", icon: LayoutDashboard },
  { name: "Portal Cliente", href: "ClientPortal", icon: Users, isNew: true },
  { name: "Analytics", href: "Analytics", icon: BarChart3, isNew: true },
  { name: "AI Content Creator", href: "ContentCreator", icon: Sparkles, isNew: true },
  { name: "Tarefas", href: "Tasks", icon: ListChecks, isNew: true },
  { name: "Calendário de Tarefas", href: "TaskCalendar", icon: Calendar, isNew: true },
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
  { name: "POPs", href: "POPs", icon: FileText, isNew: true },
  { name: "Business Model", href: "BusinessModelCanvas", icon: Puzzle },
  { name: "Estratégia", href: "Strategy", icon: Target },
  { name: "AI Insights", href: "AIInsights", icon: Brain, isNew: true },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(true);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("last_seen_version");
    if (lastSeenVersion !== LATEST_VERSION) {
      setShowWhatsNew(true);
      localStorage.setItem("last_seen_version", LATEST_VERSION);
    }

    // Global keyboard shortcut for search (Cmd+K or Ctrl+K)
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollTop(scrollTop > 10);
    setShowScrollBottom(scrollTop + clientHeight < scrollHeight - 10);
  };

  const scrollNav = (direction) => {
    const container = document.getElementById('nav-container');
    if (container) {
      const scrollAmount = direction === 'up' ? -250 : 250;
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
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e811fd4fc2230311435d7/183f985ca_icon.jpg" 
              alt="Prime Odontologia" 
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="font-bold text-slate-900">Prime Odontologia</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="relative"
            >
              <Search className="w-5 h-5 text-slate-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWhatsNew(true)}
              className="relative"
              data-tour="whats-new"
            >
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
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
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 flex flex-col overflow-hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex-shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e811fd4fc2230311435d7/183f985ca_icon.jpg" 
              alt="Prime Odontologia" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h1 className="font-bold text-slate-900">Prime Odontologia</h1>
              <p className="text-xs text-slate-500">Sistema de Gestão</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="w-full justify-start gap-2 text-slate-500 hover:text-slate-900"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Buscar...</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 rounded border border-slate-200">
              ⌘K
            </kbd>
          </Button>
        </div>

        <div className="relative flex-1 overflow-hidden min-h-0">
            {showScrollTop && (
              <div className="sticky top-0 z-10 flex justify-center py-1.5 bg-gradient-to-b from-white via-white to-transparent pointer-events-none">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollNav('up')}
                  className="h-7 w-full mx-6 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm pointer-events-auto"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <nav 
              id="nav-container"
              className="space-y-2 overflow-y-auto h-full px-6 py-3"
              onScroll={handleScroll}
              data-tour="navigation"
            >
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </nav>

            {showScrollBottom && (
              <div className="sticky bottom-0 z-10 flex justify-center py-1.5 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollNav('down')}
                  className="h-7 w-full mx-6 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm pointer-events-auto"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowWhatsNew(true)}
              className="w-full justify-start gap-2 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            >
              <Sparkles className="w-4 h-4" />
              Novidades & Dicas
            </Button>
          </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>

      <WhatsNewModal open={showWhatsNew} onClose={() => setShowWhatsNew(false)} />
      <GlobalSearch open={showSearch} onClose={() => setShowSearch(false)} />
    </div>
  );
}
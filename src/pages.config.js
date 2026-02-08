/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIInsights from './pages/AIInsights';
import Activities from './pages/Activities';
import Agenda from './pages/Agenda';
import Analytics from './pages/Analytics';
import AppointmentReports from './pages/AppointmentReports';
import BusinessModelCanvas from './pages/BusinessModelCanvas';
import CRM from './pages/CRM';
import CRMAvancado from './pages/CRMAvancado';
import Campanhas from './pages/Campanhas';
import Canais from './pages/Canais';
import Channels from './pages/Channels';
import ClientPortal from './pages/ClientPortal';
import ContentCreator from './pages/ContentCreator';
import Conteudos from './pages/Conteudos';
import CostStructure from './pages/CostStructure';
import CustomerPipeline from './pages/CustomerPipeline';
import CustomerRelationships from './pages/CustomerRelationships';
import CustomerSegments from './pages/CustomerSegments';
import Dashboard from './pages/Dashboard';
import Estrategias from './pages/Estrategias';
import JornadaCliente from './pages/JornadaCliente';
import KeyActivities from './pages/KeyActivities';
import KeyPartnerships from './pages/KeyPartnerships';
import KeyResources from './pages/KeyResources';
import LeadsPipeline from './pages/LeadsPipeline';
import MarketingOS from './pages/MarketingOS';
import Metricas from './pages/Metricas';
import OnlineBooking from './pages/OnlineBooking';
import POPs from './pages/POPs';
import PatientPipeline from './pages/PatientPipeline';
import Prontuarios from './pages/Prontuarios';
import Revenue from './pages/Revenue';
import RevenueStreams from './pages/RevenueStreams';
import SOPs from './pages/SOPs';
import Sales from './pages/Sales';
import ScriptsVendas from './pages/ScriptsVendas';
import Strategy from './pages/Strategy';
import TaskCalendar from './pages/TaskCalendar';
import Tasks from './pages/Tasks';
import ValueProposition from './pages/ValueProposition';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIInsights": AIInsights,
    "Activities": Activities,
    "Agenda": Agenda,
    "Analytics": Analytics,
    "AppointmentReports": AppointmentReports,
    "BusinessModelCanvas": BusinessModelCanvas,
    "CRM": CRM,
    "CRMAvancado": CRMAvancado,
    "Campanhas": Campanhas,
    "Canais": Canais,
    "Channels": Channels,
    "ClientPortal": ClientPortal,
    "ContentCreator": ContentCreator,
    "Conteudos": Conteudos,
    "CostStructure": CostStructure,
    "CustomerPipeline": CustomerPipeline,
    "CustomerRelationships": CustomerRelationships,
    "CustomerSegments": CustomerSegments,
    "Dashboard": Dashboard,
    "Estrategias": Estrategias,
    "JornadaCliente": JornadaCliente,
    "KeyActivities": KeyActivities,
    "KeyPartnerships": KeyPartnerships,
    "KeyResources": KeyResources,
    "LeadsPipeline": LeadsPipeline,
    "MarketingOS": MarketingOS,
    "Metricas": Metricas,
    "OnlineBooking": OnlineBooking,
    "POPs": POPs,
    "PatientPipeline": PatientPipeline,
    "Prontuarios": Prontuarios,
    "Revenue": Revenue,
    "RevenueStreams": RevenueStreams,
    "SOPs": SOPs,
    "Sales": Sales,
    "ScriptsVendas": ScriptsVendas,
    "Strategy": Strategy,
    "TaskCalendar": TaskCalendar,
    "Tasks": Tasks,
    "ValueProposition": ValueProposition,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
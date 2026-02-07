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
import Activities from './pages/Activities';
import Agenda from './pages/Agenda';
import CRM from './pages/CRM';
import CRMAvancado from './pages/CRMAvancado';
import Campanhas from './pages/Campanhas';
import Canais from './pages/Canais';
import Conteudos from './pages/Conteudos';
import CostStructure from './pages/CostStructure';
import CustomerPipeline from './pages/CustomerPipeline';
import Dashboard from './pages/Dashboard';
import Estrategias from './pages/Estrategias';
import JornadaCliente from './pages/JornadaCliente';
import LeadsPipeline from './pages/LeadsPipeline';
import MarketingOS from './pages/MarketingOS';
import Metricas from './pages/Metricas';
import PatientPipeline from './pages/PatientPipeline';
import Prontuarios from './pages/Prontuarios';
import Revenue from './pages/Revenue';
import SOPs from './pages/SOPs';
import ScriptsVendas from './pages/ScriptsVendas';
import BusinessModelCanvas from './pages/BusinessModelCanvas';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activities": Activities,
    "Agenda": Agenda,
    "CRM": CRM,
    "CRMAvancado": CRMAvancado,
    "Campanhas": Campanhas,
    "Canais": Canais,
    "Conteudos": Conteudos,
    "CostStructure": CostStructure,
    "CustomerPipeline": CustomerPipeline,
    "Dashboard": Dashboard,
    "Estrategias": Estrategias,
    "JornadaCliente": JornadaCliente,
    "LeadsPipeline": LeadsPipeline,
    "MarketingOS": MarketingOS,
    "Metricas": Metricas,
    "PatientPipeline": PatientPipeline,
    "Prontuarios": Prontuarios,
    "Revenue": Revenue,
    "SOPs": SOPs,
    "ScriptsVendas": ScriptsVendas,
    "BusinessModelCanvas": BusinessModelCanvas,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
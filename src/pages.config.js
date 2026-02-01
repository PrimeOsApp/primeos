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
import Canais from './pages/Canais';
import CostStructure from './pages/CostStructure';
import CustomerPipeline from './pages/CustomerPipeline';
import Dashboard from './pages/Dashboard';
import JornadaCliente from './pages/JornadaCliente';
import PatientPipeline from './pages/PatientPipeline';
import Prontuarios from './pages/Prontuarios';
import Revenue from './pages/Revenue';
import MarketingOS from './pages/MarketingOS';
import Estrategias from './pages/Estrategias';
import Conteudos from './pages/Conteudos';
import Campanhas from './pages/Campanhas';
import LeadsPipeline from './pages/LeadsPipeline';
import Metricas from './pages/Metricas';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Activities": Activities,
    "Agenda": Agenda,
    "CRM": CRM,
    "Canais": Canais,
    "CostStructure": CostStructure,
    "CustomerPipeline": CustomerPipeline,
    "Dashboard": Dashboard,
    "JornadaCliente": JornadaCliente,
    "PatientPipeline": PatientPipeline,
    "Prontuarios": Prontuarios,
    "Revenue": Revenue,
    "MarketingOS": MarketingOS,
    "Estrategias": Estrategias,
    "Conteudos": Conteudos,
    "Campanhas": Campanhas,
    "LeadsPipeline": LeadsPipeline,
    "Metricas": Metricas,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
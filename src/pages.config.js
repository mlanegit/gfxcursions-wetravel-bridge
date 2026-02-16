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
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import EmailSettings from './pages/EmailSettings';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import GuestPortal from './pages/GuestPortal';
import Home from './pages/Home';
import Packages from './pages/Packages';
import TripPaymentAdmin from './pages/TripPaymentAdmin';
import TripPaymentSettings from './pages/TripPaymentSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "AdminDashboard": AdminDashboard,
    "Contact": Contact,
    "EmailSettings": EmailSettings,
    "Events": Events,
    "Gallery": Gallery,
    "GuestPortal": GuestPortal,
    "Home": Home,
    "Packages": Packages,
    "TripPaymentAdmin": TripPaymentAdmin,
    "TripPaymentSettings": TripPaymentSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
import { Layers, ShoppingBag, Tag, User, TrendingUp,  LogOut, LogIn } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext.tsx";

interface NavbarProps {
  onLogout: () => void;
  onOpenAuth: () => void;
  onNavigate?: () => void;
}

export default function Navbar({
  onLogout,
  onOpenAuth,
  onNavigate,
}: NavbarProps) {
  const { user } = useAuthContext()

  const navItems = [
    { path: "/", label: "Marketplace", icon: ShoppingBag },
    { path: "/sell", label: "Sell Item", icon: Tag },
    { path: "/categories", label: "Categories", icon: Layers },
    { path: "/dashboard", label: "Sales Dashboard", icon: TrendingUp },
    { path: "/profile", label: "My Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* eBay Styled Logo */}
        <Link
          to="/"
          onClick={onNavigate}
          className="flex cursor-pointer items-center space-x-1"
        >
          <span className="text-3xl font-extrabold tracking-tight select-none">
            <span className="text-[#e53238]">e</span>
            <span className="text-[#0064d2]">b</span>
            <span className="text-[#f5af02]">a</span>
            <span className="text-[#86b817]">y</span>
          </span>
          <span className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-widest pl-1 border-l border-gray-300 ml-2">
            Clone
          </span>
        </Link>

        {/* Route navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === "/"}
                onClick={onNavigate}
                className={({ isActive }) => `relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-150 rounded-lg ${
                  isActive
                    ? "bg-[#0064d2]/10 text-[#0064d2]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
              </NavLink>
            );
          })}
        </nav>

        {/* User Session Area */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                onClick={onNavigate}
                className="hidden lg:flex flex-col text-right cursor-pointer"
              >
                <span className="text-xs font-semibold text-gray-400">Signed in as</span>
                <span className="text-sm font-bold text-gray-800 hover:underline">{user.FullName}</span>
              </Link>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-xs cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-lg bg-[#0064d2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0051ab] hover:shadow-md transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile route navigation */}
      <div className="md:hidden flex border-t border-gray-100 bg-gray-50 justify-around py-2">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) => `relative flex flex-col items-center gap-0.5 text-[9px] font-semibold transition-colors duration-150 py-1 px-3 ${
                isActive ? "text-[#0064d2]" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label.split(" ")[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}

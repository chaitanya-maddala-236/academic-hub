import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Lightbulb,
  Banknote,
  FlaskConical,
  Users,
  Package,
  LogIn,
  LogOut,
  Microscope,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Research", url: "/research", icon: Microscope },
  { title: "Publications", url: "/publications", icon: BookOpen },
  { title: "Academic Projects", url: "/academic-projects", icon: GraduationCap, placeholder: true },
  { title: "Patents", url: "/patents", icon: ShieldCheck, placeholder: true },
  { title: "IP Assets", url: "/ip-assets", icon: Lightbulb, placeholder: true },
  { title: "Consultancy Works", url: "/consultancy", icon: Banknote, placeholder: true },
  { title: "Research Labs", url: "/research-labs", icon: FlaskConical, placeholder: true },
  { title: "Faculty Profiles", url: "/faculty", icon: Users, placeholder: true },
  { title: "Materials", url: "/materials", icon: Package, placeholder: true },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  return (
    <div
      className="flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? 64 : 280,
        backgroundColor: "#1E3A8A",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.1)" }}
      >
        <div
          className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 36, height: 36, backgroundColor: "#2563EB" }}
        >
          <GraduationCap size={20} color="white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-tight">AcademicHub</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              Research Portal
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-white opacity-60 hover:opacity-100"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navItems.map((item) => {
          const active = isActive(item.url);
          return (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-150 no-underline"
              style={{
                backgroundColor: active ? "#2563EB" : "transparent",
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.75)",
                borderLeft: active ? "3px solid #DBEAFE" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(37,99,235,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
                }
              }}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.title}
                  {item.placeholder && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(255,255,255,0.15)", fontSize: "10px" }}
                    >
                      Soon
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        {user ? (
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all"
            style={{ color: "rgba(255,255,255,0.75)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(37,99,235,0.3)";
              (e.currentTarget as HTMLElement).style.color = "#FFFFFF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
            }}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg no-underline"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            <LogIn size={18} />
            {!collapsed && <span className="text-sm font-medium">Sign In</span>}
          </NavLink>
        )}
      </div>
    </div>
  );
}


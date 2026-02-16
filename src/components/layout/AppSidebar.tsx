import {
  Home,
  FolderOpen,
  BookOpen,
  Users,
  Shield,
  LogIn,
  LogOut,
  GraduationCap,
  BookMarked,
  ShieldCheck,
  Lightbulb,
  Banknote,
  FlaskConical,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const publicItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderOpen },
  { title: "Publications", url: "/publications", icon: BookOpen },
  { title: "Patents", url: "/patents", icon: ShieldCheck },
  { title: "IP Assets", url: "/ip-assets", icon: Lightbulb },
  { title: "Funded Projects", url: "/funded-projects", icon: Banknote },
  { title: "Research Labs", url: "/research-labs", icon: FlaskConical },
  { title: "Faculty Profiles", url: "/faculty", icon: Users },
];

export function AppSidebar() {
  const { user, hasRole, signOut } = useAuth();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-sidebar-primary" />
          <div>
            <h2 className="text-base font-bold text-sidebar-primary font-sans">
              AcademicArchives
            </h2>
            <p className="text-xs text-sidebar-foreground/70">Research Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
            Browse
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (hasRole("student") || hasRole("faculty")) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
              My Work
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {hasRole("student") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/student-dashboard"
                        className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <BookMarked className="mr-2 h-4 w-4" />
                        <span>My Submissions</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {hasRole("faculty") && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/faculty-dashboard"
                        className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <BookMarked className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {user && hasRole("admin") && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs uppercase tracking-wider">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user ? (
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <SidebarMenuButton asChild>
            <NavLink
              to="/login"
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Sign In</span>
            </NavLink>
          </SidebarMenuButton>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

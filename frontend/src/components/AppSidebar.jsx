import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { AiOutlineDashboard, AiFillProject } from "react-icons/ai";
import { RiTeamFill } from "react-icons/ri";
import { MdTask } from "react-icons/md";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "../context/AuthContext";

const allLinks = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <AiOutlineDashboard className="text-xl" />,
    roles: ["manager", "teamLead", "developer"],
  },
  {
    path: "/projects",
    label: "Projects",
    icon: <AiFillProject className="text-xl" />,
    roles: ["manager", "teamLead"],
  },
  // {
  //   path: "/teams",
  //   label: "Teams",
  //   icon: <RiTeamFill className="text-xl" />,
  //   roles: ["manager"],
  // },
  {
    path: "/tasks",
    label: "Tasks",
    icon: <MdTask className="text-xl" />,
    roles: ["teamLead", "developer"],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const navigationLinks = allLinks.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <SidebarHeader className="h- flex items-center justify-start px-6">
        <div className="flex items-center gap-3 p-2">
          <span className="font-bold text-gray-900 dark:text-gray-100 text-lg tracking-tight">
            My App
          </span>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-0 opacity-60" />
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarMenu className="px-2 gap-1.5">
            {navigationLinks.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    className={`
                      w-full py-6 px-4 rounded-xl font-medium transition-all duration-200 ease-in-out
                      ${
                        isActive
                          ? "bg-gray-800 text-white dark:bg-blue-950/50 dark:text-blue-400 shadow-sm"
                          : "text-gray-600 hover:text-white hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-900"
                      }
                    `}
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-3.5 w-full"
                    >
                      <span
                        className={`transition-colors ${isActive ? "text-white dark:text-blue-400" : "text-black group-hover:text-gray-600"}`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[15px]">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

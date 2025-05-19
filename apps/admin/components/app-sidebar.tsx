"use client";

import {
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/sidebar";

const data = {
  user: {
    name: "FIX App",
    email: "info@fixapp.ch",
    avatar: "/",
  },
  navMain: [
    {
      title: "Übersicht",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Meldungen",
      url: "#",
      icon: ListIcon,
    },
    {
      title: "Statistik",
      url: "#",
      icon: BarChartIcon,
    },
    {
      title: "Projekte",
      url: "#",
      icon: FolderIcon,
    },
    {
      title: "Abteilungen",
      url: "#",
      icon: UsersIcon,
    },
  ],
  navClouds: [
    {
      title: "Erfassung",
      icon: CameraIcon,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Neue Meldungen",
          url: "#",
        },
        {
          title: "Archiviert",
          url: "#",
        },
      ],
    },
    {
      title: "Anträge",
      icon: FileTextIcon,
      url: "#",
      items: [
        {
          title: "Laufende Anträge",
          url: "#",
        },
        {
          title: "Abgeschlossen",
          url: "#",
        },
      ],
    },
    {
      title: "Formulare",
      icon: FileCodeIcon,
      url: "#",
      items: [
        {
          title: "Infrastruktur",
          url: "#",
        },
        {
          title: "Wartung",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Einstellungen",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Hilfe",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Suche",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Datenbank",
      url: "#",
      icon: DatabaseIcon,
    },
    {
      name: "Berichte",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Vorlagen",
      url: "#",
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <span className="text-base font-semibold">FIX App</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

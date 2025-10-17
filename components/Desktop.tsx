/*
 * @Author: 严钦蓝
 * @Date: 2025-09-23 17:40:40
 * @FilePath: \pixel\components\Desktop.tsx
 * @LastEditors: 严钦蓝
 * @LastEditTime: 2025-10-11 16:28:50
 * @Description: 桌面
 */
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { IconBrandGithub, IconHome, IconTerminal2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { AVAILABLE_PROJECTS, AVAILABLE_ROUTES } from "@/lib/commands";

const Desktop = () => {
  console.log("可用项目：", AVAILABLE_PROJECTS);
  console.log("可用路由：", AVAILABLE_ROUTES);
  const router = useRouter();

  // 悬浮导航栏
  const dockItem = [
    {
      title: "主页",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => {
        router.push("/home");
      },
    },
    {
      title: "终端",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => {
        router.push("/terminal");
      },
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/magicyan418/pixel",
    },
  ];

  // 路由
  const routerItem = AVAILABLE_ROUTES.map((route) => ({
    icon: (
      <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
    ),
    title: route.description,
    url: route.url,
  }));

  // 项目
  const projectItem = AVAILABLE_PROJECTS.map((project) => ({
    icon: project.url,
    title: project.description,
    url: project.url,
  }));
  
  return (
    <div className="flex items-center justify-center h-[35rem] w-full">
      <FloatingDock desktopClassName="absolute bottom-10" items={dockItem} />
    </div>
  );
};

export default Desktop;

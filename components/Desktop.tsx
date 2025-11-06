/*
 * @Author: 严钦蓝
 * @Date: 2025-09-23 17:40:40
 * @FilePath: \pixel\components\Desktop.tsx
 * @LastEditors: 严钦蓝
 * @LastEditTime: 2025-11-06 11:22:50
 * @Description: 桌面
 */
"use client";

import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import { Card, CardContent } from "@/components/ui/card";
import { 
  IconBrandGithub, 
  IconHome, 
  IconTerminal2,
  IconPhoto,
  IconMessage,
  IconUserCircle,
  IconShare,
  IconClock,
  IconMessage2,
  IconDeviceTv,
  IconFileText,
  IconArrowRight,
  IconExternalLink,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { AVAILABLE_PROJECTS, AVAILABLE_ROUTES } from "@/lib/commands";
import { cn } from "@/lib/utils";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconHome,
  IconTerminal2,
  IconPhoto,
  IconMessage,
  IconUserCircle,
  IconShare,
  IconClock,
  IconMessage2,
  IconDeviceTv,
  IconFileText,
};

interface DesktopProps {
  onClose?: () => void;
}

const Desktop: React.FC<DesktopProps> = ({ onClose }) => {
  const router = useRouter();

  // 处理路由跳转并关闭modal
  const handleRouteClick = (url: string) => {
    router.push(url);
    onClose?.();
  };

  // 悬浮导航栏
  const dockItem = [
    {
      title: "主页",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => {
        handleRouteClick("/home");
      },
    },
    {
      title: "终端",
      icon: (
        <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
      onClick: () => {
        handleRouteClick("/terminal");
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

  // 获取网站的 favicon
  const [faviconUrls, setFaviconUrls] = React.useState<Record<string, string>>({});

  // 尝试加载图片
  const tryLoadImage = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // 从网站获取真实的 favicon
  const fetchRealFavicon = async (url: string): Promise<string> => {
    try {
      const urlObj = new URL(url);
      const origin = urlObj.origin;
      const domain = urlObj.hostname;
      
      // 定义多个可能的 favicon 位置（按优先级排序）
      const possiblePaths = [
        `${origin}/favicon.ico`,
        `${origin}/favicon.png`,
        `${origin}/favicon.svg`,
        `${origin}/apple-touch-icon.png`,
        `${origin}/apple-touch-icon-precomposed.png`,
        `${origin}/assets/favicon.ico`,
        `${origin}/static/favicon.ico`,
        `${origin}/public/favicon.ico`,
      ];
      
      // 依次尝试每个路径
      for (const path of possiblePaths) {
        const isLoaded = await tryLoadImage(path);
        if (isLoaded) {
          return path;
        }
      }
      
      // 如果所有路径都失败，使用 Google API 作为最后备选
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch {
      return "";
    }
  };

  // 在组件挂载时获取所有项目的 favicon
  React.useEffect(() => {
    const loadFavicons = async () => {
      const urls: Record<string, string> = {};
      
      // 并发加载所有 favicon，提高速度
      await Promise.all(
        AVAILABLE_PROJECTS.map(async (project) => {
          const faviconUrl = await fetchRealFavicon(project.url);
          urls[project.name] = faviconUrl;
        })
      );
      
      setFaviconUrls(urls);
    };
    
    loadFavicons();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-auto pb-32 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* 主内容区域 */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">

        {/* 路由区域 */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
              <IconHome className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">快速导航</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AVAILABLE_ROUTES.map((route) => {
              const IconComponent = iconMap[route.icon];
              return (
                <Card
                  key={route.name}
                  className="group relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden h-full"
                  onClick={() => handleRouteClick(route.url)}
                >
                  {/* 悬停光晕效果 */}
                  <div className={cn(
                    "absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br rounded-xl blur-xl",
                    route.color
                  )} />
                  
                  <CardContent className="relative p-6 h-full flex flex-col items-center justify-center text-center gap-4">
                    {/* 图标 */}
                    <div className={cn(
                      "p-4 rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                      route.color
                    )}>
                      {IconComponent && <IconComponent className="w-8 h-8 text-white" />}
                    </div>
                    
                    {/* 标题 */}
                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {route.description}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {route.name}
                      </p>
                    </div>

                    {/* 箭头指示 - 使用绝对定位不占据布局空间 */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <IconArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* 项目区域 */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <IconDeviceTv className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-3xl font-bold">我的项目</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {AVAILABLE_PROJECTS.map((project) => {
              return (
                <Card
                  key={project.name}
                  className="group relative cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
                  onClick={() => {
                    window.open(project.url, "_blank");
                  }}
                >
                  {/* 悬停光晕效果 */}
                  <div className={cn(
                    "absolute -inset-1 opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-br rounded-xl blur-xl",
                    project.color
                  )} />
                  
                  <CardContent className="relative p-6">
                    <div className="flex items-start gap-4">
                      {/* Favicon */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white dark:bg-slate-700 shadow-md p-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {faviconUrls[project.name] ? (
                          <img 
                            src={faviconUrls[project.name]} 
                            alt={project.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              // 如果图片加载失败，显示占位符
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239ca3af' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          // 加载中的占位符
                          <div className="w-full h-full rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 animate-pulse" />
                        )}
                      </div>
                      
                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                            {project.description}
                          </h3>
                          <IconExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors duration-300" />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {project.name}
                        </p>
                        
                        {/* 装饰性渐变条 */}
                        <div className={cn(
                          "h-1 w-0 group-hover:w-full transition-all duration-500 rounded-full mt-3 bg-gradient-to-r",
                          project.color
                        )} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      {/* 底部悬浮导航栏 */}
      <FloatingDock desktopClassName="fixed bottom-10 left-1/2 -translate-x-1/2" items={dockItem} />
    </div>
  );
};

export default Desktop;

"use client";

import React from "react";
import {
  IconArrowUpRight,
  IconBrandGithub,
  IconCommand,
  IconHome,
  IconMessage,
  IconPhoto,
  IconSparkles,
  IconTerminal2,
  IconX,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { AVAILABLE_PROJECTS, AVAILABLE_ROUTES } from "@/lib/commands";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconHome,
  IconTerminal2,
  IconPhoto,
  IconMessage,
};

const projectAccents = [
  "from-violet-500/25 to-fuchsia-400/5 text-violet-300",
  "from-cyan-500/25 to-blue-400/5 text-cyan-300",
  "from-amber-500/25 to-orange-400/5 text-amber-300",
  "from-pink-500/25 to-rose-400/5 text-pink-300",
  "from-blue-500/25 to-indigo-400/5 text-blue-300",
  "from-emerald-500/25 to-teal-400/5 text-emerald-300",
];

const fallbackIcon =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x2='1' y2='1'%3E%3Cstop stop-color='%238b5cf6'/%3E%3Cstop offset='1' stop-color='%2306b6d4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='18' fill='url(%23g)'/%3E%3Cpath d='M19 21h26v6H25v10h20v6H19z' fill='white'/%3E%3C/svg%3E";

interface DesktopProps {
  onClose?: () => void;
}

const ProjectFavicon = ({ url }: { url: string }) => {
  const [loaded, setLoaded] = React.useState(false);
  const [source, setSource] = React.useState(
    `/api/favicon?url=${encodeURIComponent(url)}`
  );

  return (
    <span className="relative block h-full w-full">
      <img
        src={fallbackIcon}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-200",
          loaded && "opacity-0"
        )}
      />
      <img
        src={source}
        alt=""
        loading="eager"
        className={cn(
          "absolute inset-0 h-full w-full object-contain opacity-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)] transition-opacity duration-200",
          loaded && "opacity-100"
        )}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!source.startsWith("https://www.google.com/")) {
            setSource(
              `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(url)}&sz=128`
            );
            return;
          }
          setSource(fallbackIcon);
        }}
      />
    </span>
  );
};

const Desktop: React.FC<DesktopProps> = ({ onClose }) => {
  const router = useRouter();
  const pathname = usePathname();

  const openRoute = (url: string) => {
    router.push(url);
    onClose?.();
  };

  return (
    <main className="relative h-full w-full overflow-hidden rounded-t-[26px] bg-[#090817] font-sans text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,58,237,0.22),transparent_30%),radial-gradient(circle_at_88%_90%,rgba(6,182,212,0.16),transparent_34%),linear-gradient(145deg,#0b0a1c_0%,#070b18_55%,#07131a_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.8%22_numOctaves=%224%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.7%22/%3E%3C/svg%3E')]" />

      <header className="relative z-10 flex h-[68px] items-center justify-between px-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-[0_10px_30px_rgba(124,58,237,0.35)]">
            <IconSparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Magicyan Space</p>
            <p className="text-[11px] text-white/40">个人数字空间 · {AVAILABLE_PROJECTS.length} 个应用</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://github.com/magicyan418/pixel" target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-white/55 transition hover:bg-white/[0.11] hover:text-white" aria-label="GitHub">
            <IconBrandGithub className="h-[18px] w-[18px]" />
          </a>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06] text-white/55 transition hover:bg-rose-500/20 hover:text-rose-200" aria-label="关闭">
            <IconX className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      <div className="relative z-10 grid h-[calc(100%-68px)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden px-5 pb-6 lg:flex lg:flex-col">
          <p className="mb-3 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-white/30">Navigation</p>
          <nav className="space-y-1">
            {AVAILABLE_ROUTES.map((route) => {
              const Icon = iconMap[route.icon] ?? IconCommand;
              const isActive =
                pathname === route.url || pathname.startsWith(`${route.url}/`);
              return (
                <button key={route.name} type="button" onClick={() => openRoute(route.url)} aria-current={isActive ? "page" : undefined} className={cn("group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white/55 transition hover:bg-white/[0.07] hover:text-white", isActive && "bg-white/[0.075] text-white")}>
                  <span className={cn("grid h-9 w-9 place-items-center rounded-xl transition-colors", isActive ? "bg-violet-500/25 text-violet-300" : "bg-white/[0.05] text-white/45 group-hover:bg-cyan-400/10 group-hover:text-cyan-300")}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block font-medium">{route.description}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-white/25">{route.name}</span>
                  </span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl bg-gradient-to-br from-violet-500/15 to-cyan-400/10 p-4">
            <IconSparkles className="mb-3 h-5 w-5 text-violet-300" />
            <p className="text-xs font-medium text-white/80">Keep exploring.</p>
            <p className="mt-1 text-[11px] leading-5 text-white/35">每个小项目，都是一次有趣的实验。</p>
          </div>
        </aside>

        <section className="desktop-scrollbar min-h-0 overflow-y-auto px-4 pb-8 sm:px-6 lg:rounded-tl-[28px] lg:bg-white/[0.025] lg:px-7 lg:pt-1">
          <div className="mb-5 grid grid-cols-4 gap-2 lg:hidden">
            {AVAILABLE_ROUTES.map((route) => {
              const Icon = iconMap[route.icon] ?? IconCommand;
              const isActive =
                pathname === route.url || pathname.startsWith(`${route.url}/`);
              return (
                <button key={route.name} type="button" onClick={() => openRoute(route.url)} aria-current={isActive ? "page" : undefined} className={cn("flex flex-col items-center gap-2 rounded-2xl bg-white/[0.055] px-2 py-3 text-[11px] text-white/55 transition hover:bg-white/10 hover:text-white", isActive && "bg-violet-500/20 text-white")}>
                  <Icon className={cn("h-5 w-5 text-cyan-300", isActive && "text-violet-300")} />
                  <span>{route.description}</span>
                </button>
              );
            })}
          </div>

          <div className="mb-5 flex items-end justify-between pt-1 sm:pt-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-violet-300/70">Launchpad</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">想去哪里？</h1>
            </div>
            <p className="hidden text-xs text-white/30 sm:block">选择一个项目，开启新的标签页</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {AVAILABLE_PROJECTS.map((project, index) => (
              <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="group relative overflow-hidden rounded-[22px] bg-white/[0.055] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.09] hover:shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-70 transition group-hover:opacity-100", projectAccents[index % projectAccents.length])} />
                <div className="relative flex items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(145deg,#ffffff,#e8edf7)] p-2.5 shadow-[0_6px_18px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(255,255,255,0.8)] transition-transform duration-300 group-hover:scale-105">
                    <ProjectFavicon url={project.url} />
                  </span>
                  <IconArrowUpRight className="h-4 w-4 text-white/25 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/75" />
                </div>
                <div className="relative mt-5">
                  <h2 className="truncate text-sm font-semibold text-white/90">{project.description}</h2>
                  <p className="mt-1 truncate text-[10px] uppercase tracking-wider text-white/30">{new URL(project.url).hostname}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

    </main>
  );
};

export default Desktop;

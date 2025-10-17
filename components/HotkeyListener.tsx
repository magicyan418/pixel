"use client";

import { useEffect } from "react";

const HotkeyListener = () => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // 兼容 mac 与 windows: metaKey(⌘) 或 ctrlKey
      const isPrimaryModifier = event.ctrlKey || event.metaKey;
      if (isPrimaryModifier && (event.key === "k" || event.key === "K")) {
        // 阻止默认浏览器/页面快捷键（如焦点搜索）
        event.preventDefault();
        // 触发打印
        // eslint-disable-next-line no-console
        console.log("已触发快捷键: Ctrl+K");
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return null;
};

export default HotkeyListener;



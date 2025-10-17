/*
 * @Author: 严钦蓝
 * @Date: 2025-10-11 16:51:42
 * @FilePath: \pixel\components\Favicon.tsx
 * @LastEditors: 严钦蓝
 * @LastEditTime: 2025-10-11 16:51:58
 * @Description: favicon 组件 展示网站图标
 */
import React from "react";

interface FaviconProps {
  url: string;          // 任意网站 URL 或域名
  size?: number;        // 图标大小，默认 32
  fallbackUrl?: string; // 可选，自定义回退 URL
}

const Favicon: React.FC<FaviconProps> = ({ url, size = 32, fallbackUrl }) => {
  const baseGoogle = "https://www.google.com/s2/favicons";

  // 解析 URL 并生成 favicon URL
  let imgUrl: string;
  let fallback: string | undefined;

  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const parsed = new URL(normalized);
    const origin = parsed.origin;
    const hostname = parsed.hostname;

    if (hostname.endsWith("magicyan418.com")) {
      // 自己的主/子域优先用 /favicon.ico
      imgUrl = `${origin}/favicon.ico`;
      // 默认回退到主域
      const rootDomain = hostname.split(".").slice(-2).join(".");
      fallback = fallbackUrl ?? `https://${rootDomain}/favicon.ico`;
    } else {
      // 其他网站用 Google Favicon API
      imgUrl = `${baseGoogle}?sz=${size}&domain_url=${origin}`;
      fallback = fallbackUrl;
    }
  } catch {
    // URL 解析失败时用 Google 默认
    imgUrl = `${baseGoogle}?sz=${size}&domain_url=https://www.google.com`;
    fallback = fallbackUrl;
  }

  return (
    <img
      src={imgUrl}
      width={size}
      height={size}
      alt="favicon"
      onError={(e) => {
        if (fallback) e.currentTarget.src = fallback;
      }}
      style={{ display: "inline-block" }}
    />
  );
};

export default Favicon;


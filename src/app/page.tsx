"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return null; // 或者返回一个加载动画
}
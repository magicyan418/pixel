import { create } from "zustand";

interface PhotoState {
  q: string; // 搜索关键词
  /** 语言代码（默认 en） */
  lang:
    | "cs"
    | "da"
    | "de"
    | "en"
    | "es"
    | "fr"
    | "id"
    | "it"
    | "hu"
    | "nl"
    | "no"
    | "pl"
    | "pt"
    | "ro"
    | "sk"
    | "fi"
    | "sv"
    | "tr"
    | "vi"
    | "th"
    | "bg"
    | "ru"
    | "el"
    | "ja"
    | "ko"
    | "zh";

  /** 图片类别 */
  category:
    | "backgrounds"
    | "fashion"
    | "nature"
    | "science"
    | "education"
    | "feelings"
    | "health"
    | "people"
    | "religion"
    | "places"
    | "animals"
    | "industry"
    | "computer"
    | "food"
    | "sports"
    | "transportation"
    | "travel"
    | "buildings"
    | "business"
    | "music";

  /** 主色调 */
  colors:
    | "grayscale"
    | "transparent"
    | "red"
    | "orange"
    | "yellow"
    | "green"
    | "turquoise"
    | "blue"
    | "lilac"
    | "pink"
    | "white"
    | "gray"
    | "black"
    | "brown";

  /** 是否开启安全搜索 */
  safesearch: boolean;

  /** 排序方式 */
  order: "popular" | "latest";

  /** 当前页码 */
  page: number;

  /** 每页结果数量（3~200） */
  per_page: number;

  /** 更新单个参数 */
  setParam: <K extends keyof PhotoState>(key: K, value: PhotoState[K]) => void;

  /** 重置所有参数为默认值 */
  resetParams: () => void;
}

/** 默认状态 */
const defaultState: Omit<PhotoState, "setParam" | "resetParams"> = {
  q: "", // 搜索关键词
  lang: "en", // 语言
  category: "animals", // 类别
  colors: "turquoise", // 主色调
  safesearch: false, // 18+
  order: "latest", // 排序
  page: 1, // 页码
  per_page: 30, // 每页数量
};

export const usePhotoStore = create<PhotoState>((set) => ({
  ...defaultState,

  setParam: (key, value) =>
    set((state) => ({
      ...state,
      [key]: value,
    })),

  resetParams: () =>
    set({
      ...defaultState,
    }),
}));

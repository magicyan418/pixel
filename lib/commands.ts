// 可用命令
const COMMANDS = {
  HELP: "help",
  CLEAR: "clear",
  ROUTES: "routes",
  GOTO: "goto",
  IPCARD: "ipcard",
  PROJECTS: "projects",
  RICKROLL: "rickroll",
  MATRIX: "matrix",
  COFFEE: "coffee",
};

// 命令描述
const COMMAND_DESCRIPTIONS = {
  [COMMANDS.HELP]: "显示可用命令",
  [COMMANDS.CLEAR]: "清除终端屏幕",
  [COMMANDS.ROUTES]: "显示所有可用路由",
  [COMMANDS.GOTO]: "跳转到指定路由 (用法: goto <路由名称>)",
  [COMMANDS.IPCARD]: "显示IP签名档",
  [COMMANDS.PROJECTS]: "显示所有可用项目",
  [COMMANDS.RICKROLL]: "观看Rick Roll视频(彩蛋)",
  [COMMANDS.MATRIX]: "开启黑客帝国",
  [COMMANDS.COFFEE]: "煮个咖啡",
};

// 可用路由
export const AVAILABLE_ROUTES = [
  {
    name: "home",
    url: "/home",
    description: "首页",
    icon: "IconHome",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "terminal",
    url: "/terminal",
    description: "终端",
    icon: "IconTerminal2",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "photo",
    url: "/photo",
    description: "照片墙",
    icon: "IconPhoto",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "discussions",
    url: "/discussions",
    description: "评论区",
    icon: "IconMessage",
    color: "from-orange-500 to-red-500",
  },
];

// 可用工具
export const AVAILABLE_PROJECTS = [
  {
    name: "uuavatar",
    description: "生成属于你的唯一头像",
    url: "https://uuavatar.magicyan418.com",
    icon: "IconUserCircle",
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "fileshare",
    description: "WebRTC文件共享",
    url: "https://fileshare.magicyan418.com",
    icon: "IconShare",
    color: "from-cyan-500 to-blue-500",
  },
  {
    name: "countdown",
    description: "下班倒计时",
    url: "https://countdown.magicyan418.com",
    icon: "IconClock",
    color: "from-yellow-500 to-orange-500",
  },
  {
    name: "chatlive2d",
    description: "与可爱的纸片人互动",
    url: "https://live2d.magicyan418.com",
    icon: "IconMessage2",
    color: "from-pink-500 to-rose-500",
  },
  {
    name: "moontv",
    description: "电影/电视剧聚合站",
    url: "https://tv.magicyan418.com",
    icon: "IconDeviceTv",
    color: "from-red-500 to-pink-500",
  },
  {
    name: "resume-builder",
    description: "简历生成器",
    url: "https://resume.magicyan418.com",
    icon: "IconFileText",
    color: "from-green-500 to-teal-500",
  },
];

/**
 * 执行命令并返回结果
 */
export function executeCommand(commandInput: string): string {
  const args = commandInput.trim().split(" ");
  const command = args[0].toLowerCase();
  const params = args.slice(1);

  switch (command) {
    case COMMANDS.HELP:
      return getHelpText();

    case COMMANDS.CLEAR:
      if (typeof window !== "undefined" && window.clearTerminal) {
        window.clearTerminal();
      }
      return "";

    case COMMANDS.ROUTES:
      return listRoutes();

    case COMMANDS.GOTO:
      return gotoRoute(params[0]);

    case COMMANDS.IPCARD:
      return showIpCard();

    case COMMANDS.PROJECTS:
      return listProjects();

    case COMMANDS.RICKROLL:
      return rickRoll();

    case COMMANDS.MATRIX:
      return matrixEffect();

    case COMMANDS.COFFEE:
      return brewCoffee();

    default:
      if (command === "") {
        return "";
      }
      return `命令未找到: ${command}. 输入 'help' 查看可用命令.`;
  }
}

/**
 * 生成可用命令的帮助文本
 */
function getHelpText(): string {
  let helpText = "可用命令:\n\n";

  Object.entries(COMMAND_DESCRIPTIONS).forEach(([command, description]) => {
    helpText += `${command.padEnd(10)} - ${description}\n`;
  });

  return helpText;
}

/**
 * 显示所有可用路由
 */
function listRoutes(): string {
  let routesText = "可用路由:\n\n";

  // 计算最长的名称长度，用于对齐
  const maxNameLength = AVAILABLE_ROUTES.reduce(
    (max, route) => Math.max(max, route.name.length),
    0
  );

  AVAILABLE_ROUTES.forEach((route) => {
    routesText += `${route.name.padEnd(maxNameLength + 2)} - ${
      route.description
    }\n`;
  });

  return routesText;
}

/**
 * 跳转到指定路由
 */
function gotoRoute(routeName: string): string {
  if (!routeName) {
    return `错误: 需要路由名称 (用法: goto <路由名称>)\n可用路由: ${AVAILABLE_ROUTES.map(
      (r) => r.name
    ).join(", ")}`;
  }

  const route = AVAILABLE_ROUTES.find((r) => r.name === routeName);

  if (!route) {
    return `错误: 路由 '${routeName}' 不存在\n可用路由: ${AVAILABLE_ROUTES.map(
      (r) => r.name
    ).join(", ")}`;
  }

  // 返回一个特殊的标记，让前端组件知道需要进行路由跳转
  const params = {
    routeName: route.name,
    routerUrl: route.url,
    type: "SPECIAL_COMMAND_GOTO",
  };
  return JSON.stringify(params);
}

/**
 * 显示IP签名档
 */
function showIpCard(): string {
  // 返回一个特殊标记，让页面组件处理
  return "SPECIAL_COMMAND_IPCARD";
}

/**
 * 显示所有项目
 */
function listProjects(): string {
  let projectsText =
    "<span class='gradient-text-gold'>可用项目: (Ctrl+点击名称访问)</span>\n\n";

  // 计算最长的名称长度，用于对齐
  const maxNameLength = AVAILABLE_PROJECTS.reduce(
    (max, project) => Math.max(max, project.name.length),
    0
  );

  // 使用等宽字符确保对齐
  AVAILABLE_PROJECTS.forEach((project) => {
    // 将下划线只应用于名称本身
    projectsText += `<a href="${project.url}" target="_blank"><u>${
      project.name
    }</u></a>${" ".repeat(
      maxNameLength - project.name.length + 2
    )}  <span class="gradient-text-gold">-  ${project.description}</span>\n`;
  });

  return projectsText;
}

/**
 *  跳转到 Rick Roll 视频
 */
function rickRoll(): string {
  if (typeof window !== "undefined") {
    // 打开一个新的标签
    window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
    return "正在加载惊喜...";
  }

  return "无法执行命令 (浏览器环境不可用)";
}

/**
 * 黑客帝国效果 -- 数字雨
 */
function matrixEffect(): string {
  if (typeof window !== "undefined") {
    // 返回特殊标记，让页面组件处理
    return "SPECIAL_COMMAND_MATRIX";
  }

  return "无法执行命令 (浏览器环境不可用)";
}

/**
 * 煮咖啡
 */
function brewCoffee(): string {
  return `
<span class="gradient-text-gold">正在煮咖啡...</span>

      ( (
       ) )
    .______.
    |      |]
    \\      /
     \`----'

<span style="color: #ff6b6b;">错误：我是终端，不是咖啡机</span>
`;
}

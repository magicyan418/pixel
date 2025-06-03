// 可用命令
const COMMANDS = {
  HELP: "help",
  CLEAR: "clear",
  ROUTES: "routes",
  GOTO: "goto",
  IPCARD: "ipcard",
  TOOLS: "tools",
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
  [COMMANDS.TOOLS]: "显示所有可用工具",
  [COMMANDS.RICKROLL]: "观看Rick Roll视频(彩蛋)",
  [COMMANDS.MATRIX]: "开启黑客帝国",
  [COMMANDS.COFFEE]: "煮个咖啡",
};

// 可用路由
const AVAILABLE_ROUTES = [
  {
    name: "home",
    url: "/home",
    description: "首页"
  },
  {
    name: "terminal",
    url: "/terminal",
    description: "终端"
  },
  {
    name: "photo",
    url: "/photo",
    description: "照片墙"
  }
];

// 可用工具
const AVAILABLE_TOOLS = [
  {
    name: "uuavatar",
    description: "唯一头像",
    url: "https://uuavatar.magicyan418.com",
  },
  {
    name: "fileshare",
    description: "文件共享",
    url: "https://www.wenshushu.cn",
  },
  {
    name: "countdown",
    description: "下班倒计时",
    url: "https://xiaban.vercel.app",
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

    case COMMANDS.TOOLS:
      return listTools();

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
  const maxNameLength = AVAILABLE_ROUTES.reduce((max, route) => 
    Math.max(max, route.name.length), 0);
  
  AVAILABLE_ROUTES.forEach((route) => {
    routesText += `${route.name.padEnd(maxNameLength + 2)} - ${route.description}\n`;
  });
  
  return routesText;
}

/**
 * 跳转到指定路由
 */
function gotoRoute(routeName: string): string {
  if (!routeName) {
    return `错误: 需要路由名称 (用法: goto <路由名称>)\n可用路由: ${AVAILABLE_ROUTES.map(r => r.name).join(", ")}`;
  }

  const route = AVAILABLE_ROUTES.find(r => r.name === routeName);

  if (!route) {
    return `错误: 路由 '${routeName}' 不存在\n可用路由: ${AVAILABLE_ROUTES.map(r => r.name).join(", ")}`;
  }

  if (typeof window !== "undefined") {
    window.location.href = route.url;
    return `正在跳转到 ${route.name} (${route.url})...`;
  }

  return `无法跳转到 ${route.url} (浏览器环境不可用)`;
}

/**
 * 显示IP签名档
 */
function showIpCard(): string {
  // 返回一个特殊标记，让页面组件处理
  return "SPECIAL_COMMAND_IPCARD";
}

/**
 * 显示所有可用工具
 */
function listTools(): string {
  let toolsText =
    "<span class='gradient-text-gold'>可用工具: (Ctrl+点击名称访问)</span>\n\n";

  // 计算最长的名称长度，用于对齐
  const maxNameLength = AVAILABLE_TOOLS.reduce(
    (max, tool) => Math.max(max, tool.name.length),
    0
  );

  // 使用等宽字符确保对齐
  AVAILABLE_TOOLS.forEach((tool) => {
    // 将下划线只应用于名称本身
    toolsText += `<a href="${tool.url}" target="_blank"><u>${
      tool.name
    }</u></a>${" ".repeat(
      maxNameLength - tool.name.length + 2
    )}  <span class="gradient-text-gold">-  ${tool.description}</span>\n`;
  });

  return toolsText;
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

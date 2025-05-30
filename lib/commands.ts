// Available commands
const COMMANDS = {
  HELP: "help",
  CLEAR: "clear",
  SHOWIMAGE: "showimage",
  ROUTES: "routes",
  GOTO: "goto",
  IPCARD: "ipcard",
}

// Command descriptions for help
const COMMAND_DESCRIPTIONS = {
  [COMMANDS.HELP]: "显示可用命令",
  [COMMANDS.CLEAR]: "清除终端屏幕",
  [COMMANDS.SHOWIMAGE]: "显示图片 (用法: showimage <图片名称>)",
  [COMMANDS.ROUTES]: "显示所有可用路由",
  [COMMANDS.GOTO]: "跳转到指定路由 (用法: goto <路由名称>)",
  [COMMANDS.IPCARD]: "显示IP签名档",
}

// 可用路由
const AVAILABLE_ROUTES = {
  "home": "/home",
  "terminal": "/terminal",
  "photo": "/photo",
}

// 可用图片
const AVAILABLE_IMAGES = {
  "robot": "https://images.unsplash.com/photo-1535378917042-10a22c95931a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80",
  "terminal": "https://images.unsplash.com/photo-1629654297299-c8506221ca97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
  "pixel": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
}

/**
 * Execute a command and return the result
 */
export function executeCommand(commandInput: string): string {
  const args = commandInput.trim().split(" ")
  const command = args[0].toLowerCase()
  const params = args.slice(1)

  switch (command) {
    case COMMANDS.HELP:
      return getHelpText()

    case COMMANDS.CLEAR:
      if (typeof window !== "undefined" && window.clearTerminal) {
        window.clearTerminal()
      }
      return ""

    case COMMANDS.SHOWIMAGE:
      return showImage(params[0])

    case COMMANDS.ROUTES:
      return listRoutes()

    case COMMANDS.GOTO:
      return gotoRoute(params[0])
      
    case COMMANDS.IPCARD:
      return showIpCard()

    default:
      if (command === "") {
        return ""
      }
      return `命令未找到: ${command}. 输入 'help' 查看可用命令.`
  }
}

/**
 * Generate help text with available commands
 */
function getHelpText(): string {
  let helpText = "可用命令:\n\n"

  Object.entries(COMMAND_DESCRIPTIONS).forEach(([command, description]) => {
    helpText += `${command.padEnd(10)} - ${description}\n`
  })

  return helpText
}

/**
 * Show an image
 */
function showImage(imageName: string): string {
  if (!imageName) {
    return `错误: 需要图片名称 (用法: showimage <图片名称>)\n可用图片: ${Object.keys(AVAILABLE_IMAGES).join(", ")}`
  }

  const imageUrl = AVAILABLE_IMAGES[imageName as keyof typeof AVAILABLE_IMAGES]
  
  if (!imageUrl) {
    return `错误: 图片 '${imageName}' 不存在\n可用图片: ${Object.keys(AVAILABLE_IMAGES).join(", ")}`
  }

  // 返回HTML图片标签，Terminal组件需要支持HTML渲染
  return `<img src="${imageUrl}" alt="${imageName}" style="max-width: 100%; max-height: 300px; margin: 10px 0;" />`
}

/**
 * List all available routes
 */
function listRoutes(): string {
  let routesText = "可用路由:\n\n"
  
  Object.entries(AVAILABLE_ROUTES).forEach(([name, path]) => {
    routesText += `${name.padEnd(10)} - ${path}\n`
  })
  
  return routesText
}

/**
 * Navigate to a route
 */
function gotoRoute(routeName: string): string {
  if (!routeName) {
    return `错误: 需要路由名称 (用法: goto <路由名称>)\n可用路由: ${Object.keys(AVAILABLE_ROUTES).join(", ")}`
  }

  const routePath = AVAILABLE_ROUTES[routeName as keyof typeof AVAILABLE_ROUTES]
  
  if (!routePath) {
    return `错误: 路由 '${routeName}' 不存在\n可用路由: ${Object.keys(AVAILABLE_ROUTES).join(", ")}`
  }

  if (typeof window !== "undefined") {
    window.location.href = routePath
    return `正在跳转到 ${routePath}...`
  }
  
  return `无法跳转到 ${routePath} (浏览器环境不可用)`
}

/**
 * Show IP card
 */
function showIpCard(): string {
  // 返回一个特殊标记，让页面组件处理
  return "SPECIAL_COMMAND_IPCARD";
}

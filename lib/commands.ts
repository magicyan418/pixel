// Available commands
const COMMANDS = {
  HELP: "help",
  CLEAR: "clear",
  OPEN: "open",
  ECHO: "echo",
  DATE: "date",
  HISTORY: "history",
  ABOUT: "about",
  LS: "ls",
  CD: "cd",
  PWD: "pwd",
  WHOAMI: "whoami",
  GITHUB: "github",
  LINKEDIN: "linkedin",
  PORTFOLIO: "portfolio",
}

// Command descriptions for help
const COMMAND_DESCRIPTIONS = {
  [COMMANDS.HELP]: "Show available commands",
  [COMMANDS.CLEAR]: "Clear the terminal screen",
  [COMMANDS.OPEN]: "Open a URL in a new tab (usage: open https://example.com)",
  [COMMANDS.ECHO]: "Display a line of text (usage: echo Hello World)",
  [COMMANDS.DATE]: "Display the current date and time",
  [COMMANDS.HISTORY]: "Show command history (not implemented yet)",
  [COMMANDS.ABOUT]: "About this terminal",
  [COMMANDS.LS]: "List directory contents (simulated)",
  [COMMANDS.CD]: "Change directory (simulated)",
  [COMMANDS.PWD]: "Print working directory (simulated)",
  [COMMANDS.WHOAMI]: "Display current user",
  [COMMANDS.GITHUB]: "Open GitHub profile",
  [COMMANDS.LINKEDIN]: "Open LinkedIn profile",
  [COMMANDS.PORTFOLIO]: "Open portfolio website",
}

// Simulated file system
const FILE_SYSTEM = {
  "/": ["home", "projects", "about.txt"],
  "/home": ["documents", "pictures"],
  "/projects": ["web-terminal", "portfolio", "blog"],
  "/home/documents": ["resume.pdf", "notes.txt"],
}

// Current directory (simulated)
let currentDir = "/"

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

    case COMMANDS.OPEN:
      return openUrl(params[0])

    case COMMANDS.ECHO:
      return params.join(" ")

    case COMMANDS.DATE:
      return new Date().toString()

    case COMMANDS.ABOUT:
      return "Web Terminal v1.0.0\nA Next.js project that simulates a Linux terminal.\nYou can use it to navigate to websites or execute commands."

    case COMMANDS.LS:
      return listDirectory(params[0])

    case COMMANDS.CD:
      return changeDirectory(params[0])

    case COMMANDS.PWD:
      return currentDir

    case COMMANDS.WHOAMI:
      return "user"

    case COMMANDS.GITHUB:
      return openUrl("https://github.com")

    case COMMANDS.LINKEDIN:
      return openUrl("https://linkedin.com")

    case COMMANDS.PORTFOLIO:
      return openUrl("https://example.com/portfolio")

    default:
      if (command === "") {
        return ""
      }
      return `Command not found: ${command}. Type 'help' to see available commands.`
  }
}

/**
 * Generate help text with available commands
 */
function getHelpText(): string {
  let helpText = "Available commands:\n\n"

  Object.entries(COMMAND_DESCRIPTIONS).forEach(([command, description]) => {
    helpText += `${command.padEnd(10)} - ${description}\n`
  })

  return helpText
}

/**
 * Open a URL in a new tab
 */
function openUrl(url: string): string {
  if (!url) {
    return "Error: URL is required (usage: open https://example.com)"
  }

  // Add https:// if not present
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url
  }

  try {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
      return `Opening ${url} in a new tab...`
    }
    return `Cannot open ${url} (browser environment not available)`
  } catch (error) {
    return `Error opening ${url}: ${error}`
  }
}

/**
 * List directory contents (simulated)
 */
function listDirectory(path?: string): string {
  const targetPath = path ? resolvePath(path) : currentDir

  if (!FILE_SYSTEM[targetPath]) {
    return `ls: cannot access '${targetPath}': No such file or directory`
  }

  return FILE_SYSTEM[targetPath].join("  ")
}

/**
 * Change directory (simulated)
 */
function changeDirectory(path?: string): string {
  if (!path) {
    currentDir = "/"
    return ""
  }

  const targetPath = resolvePath(path)

  if (!FILE_SYSTEM[targetPath] && targetPath !== "/") {
    return `cd: no such directory: ${path}`
  }

  currentDir = targetPath
  return ""
}

/**
 * Resolve a path (simulated)
 */
function resolvePath(path: string): string {
  if (path.startsWith("/")) {
    return path
  }

  if (path === "..") {
    const parts = currentDir.split("/").filter(Boolean)
    if (parts.length === 0) {
      return "/"
    }
    parts.pop()
    return "/" + parts.join("/")
  }

  if (path === ".") {
    return currentDir
  }

  return currentDir === "/" ? `/${path}` : `${currentDir}/${path}`
}

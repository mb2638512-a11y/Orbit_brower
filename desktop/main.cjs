const { app, BrowserWindow, session, shell } = require("electron");
const path = require("path");
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 850, minWidth: 800, minHeight: 600,
    title: "Orbit Browser",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { try { const target = new URL(url); if (target.protocol === "https:" || target.protocol === "http:") shell.openExternal(target.href); } catch {} return { action: "deny" }; });
  win.webContents.on("will-navigate", (event, targetUrl) => { if (targetUrl.startsWith("file://")) return; if (!(targetUrl.startsWith("https://") || targetUrl.startsWith("http://"))) event.preventDefault(); });
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}
app.whenReady().then(() => {
  // Deny website permissions by default until a user-visible per-site consent flow exists.
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => { callback(permission === "fullscreen"); });
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === "fullscreen");
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

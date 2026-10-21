const { app, BrowserWindow, session } = require("electron");
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
  win.loadFile(path.join(__dirname, "renderer", "index.html"));
}
app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(["fullscreen"].includes(permission));
  });
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });

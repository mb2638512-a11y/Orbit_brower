const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("orbitDesktop", { platform: process.platform });

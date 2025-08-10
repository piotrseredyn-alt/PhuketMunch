const { app, BrowserWindow } = require('electron');const path=require('path');
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
function createWindow(){const win=new BrowserWindow({width:1024,height:1024,backgroundColor:'#062a2e',webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true,nodeIntegration:false}});win.removeMenu();win.loadFile('index.html');}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow();});});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
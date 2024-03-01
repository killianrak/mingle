import { app, BrowserWindow } from 'electron';
import url from 'url';
import path from 'path';

function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title: 'Electron',
            })
    
    const startUrl = url.format({
        pathname: "http://localhost:8080"
    })

    mainWindow.loadURL(startUrl)
    mainWindow.maximize();
}

app.whenReady().then(createMainWindow)

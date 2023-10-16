const {
    app,
    BrowserWindow,
    desktopCapturer,
    ipcMain,
    Menu,
} = require('electron');
const path = require('path');

let availableScreens;
let mainWindow;

const sendSelectedScreen = (item) => {
    mainWindow.webContents.send('SET_SOURCE_ID', item.id); 
};

const createTray = () => {
    const screensMenu = availableScreens.map(item => {
        return {
            label: item.name,
            click: () => {
                sendSelectedScreen(item);
            } 
        };
    });

    const menu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                { role: 'quit' },
            ]
        },
        {
            label: 'Screens',
            submenu: screensMenu  
        }
    ]);

    Menu.setApplicationMenu(menu);
};




const createWindow = () => {
    mainWindow = new BrowserWindow({
        show: false,
        width: 1920,
        height: 1080,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // nodeIntegration: false,
            // contextIsolation: true
        }
    });

    ipcMain.on('set-size', (event, size) => {
        const {width, height} = size;
        try {
             mainWindow.setSize(width, height, true);
        } catch (e) {
            console.log("Error", e);
        }
    });
     
    mainWindow.loadURL("http://localhost:3000");

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.setPosition(0, 0);
        
        desktopCapturer.getSources({ 
            types: ['screen']  //'window', 
        }).then(async sources => {
            availableScreens = sources;
            createTray();
            //console.log("[sources]", sources);
            for (const source of sources) {
                console.log("[source]", source.name);
                if (source.name === 'Entire screen') {
                    console.log("[source.id]", source.id);
                    mainWindow.webContents.send('SET_SOURCE_ID', source.id); 
                    return;
                }
            }
        });

        mainWindow.webContents.send('SET_BUTTONS');

    });

    mainWindow.webContents.openDevTools();
}

app.on('ready', () => {
    createWindow();
});


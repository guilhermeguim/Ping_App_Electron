const {app, BrowserWindow, ipcMain} = require('electron');
const cron = require('node-cron');
const PromiseLimit = require('promise-limit');
const ping = require('ping');

const { getAddressesFromDB,
        getCurrentStatusData,
        getHistoryData,
        cleanOldRecords } = require('./database'); // Importe o módulo do banco de dados

const { restartStatus,
        addAddressToDB,
        deleteAddressFromDB,
        addResultsToDB} = require('./utils'); 

let addresses = [];
let mainWindow;
let isPinging = false;
let pingInterval = 10000;

cron.schedule('0 0 * * *', () => {
  cleanOldRecords();
});

function getStatusAndSendUpdateTable(){
  getCurrentStatusData((err, data) => {
    if (err) {
      console.error('Erro ao buscar dados da tabela Current_Status:', err);
      mainWindow.webContents.send('update-status-table', []); // Envie uma lista vazia em caso de erro
    } else {
      mainWindow.webContents.send('update-status-table', data);
      console.log('update-status-table');
    }
  });
}

function getAddressesAndUpdateIpOptions(){
  getAddressesFromDB((err, result) => {
    if (err) {
      console.error('Erro ao buscar endereços do banco de dados:', err);
      
      mainWindow.webContents.send('ip-options', []);
      try{
      deleteWindow.webContents.send('ip-options-to-del', []);
      }catch{
      }
    } else {
      addresses = result;
      
      mainWindow.webContents.send('ip-options', addresses);
      try{
        deleteWindow.webContents.send('ip-options-to-del', addresses);
      }catch{
      }
      console.log('Endereços carregados do banco de dados:', addresses);
    }
  });
}

app.on('ready', () => {
  console.log('Started');
  mainWindow = new BrowserWindow({
    width: 850,
    height: 630,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModules: true,
    },
    autoHideMenuBar: true,
    icon: `${__dirname}/app/img/icon.ico`,
  });
  mainWindow.on('closed', () => {
    app.quit();
  });

  mainWindow.loadURL(`file://${__dirname}/app/index.html`);

  restartStatus();

  getStatusAndSendUpdateTable();

  getAddressesAndUpdateIpOptions();

  if (!isPinging) {
    console.log('INITIAL START PING');
    isPinging = true;
    pingAddressesAndRepeat();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

let graphWindow = null;
ipcMain.on('open-graph-window', (event, data_parameters) => {
  console.log('OPEN GRAPH SIGNAL RECEIVED');
    if(graphWindow == null){
        graphWindow = new BrowserWindow({
            width: 1000,
            height: 500,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                },
            autoHideMenuBar: true,
            alwaysOnTop: true,
            icon: `${__dirname}/app/img/icon.ico`,
        });
        graphWindow.on('closed', () => {
          graphWindow = null;
        });
    }
    graphWindow.loadURL(`file://${__dirname}/app/graph.html?data_parameters=${JSON.stringify(data_parameters)}`);
});

let addWindow = null;
ipcMain.on('open-add-address-window', () => {
  console.log('OPEN add SIGNAL RECEIVED');
    if(addWindow == null){
      addWindow = new BrowserWindow({
            width: 400,
            height: 350,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                },
            autoHideMenuBar: true,
            alwaysOnTop: true,
            icon: `${__dirname}/app/img/icon.ico`,
        });
        addWindow.on('closed', () => {
          addWindow = null;
        });
    }
    addWindow.loadURL(`file://${__dirname}/app/add.html`);
});

let deleteWindow = null;
ipcMain.on('open-delete-address-window', () => {
  console.log('OPEN delete SIGNAL RECEIVED');
    if(deleteWindow == null){
      deleteWindow = new BrowserWindow({
            width: 400,
            height: 230,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                },
            autoHideMenuBar: true,
            alwaysOnTop: true,
            icon: `${__dirname}/app/img/icon.ico`,
        });
        deleteWindow.on('closed', () => {
          deleteWindow = null;
        });
    }

    deleteWindow.loadURL(`file://${__dirname}/app/delete.html`);

    console.log('PASSEI AQUI');
});

ipcMain.on('del-ip-list-request', () => {
  getAddressesAndUpdateIpOptions();
});

ipcMain.on('form-submission', (event, formData) => {

  const ipAddress = formData.ipAddress;
  const name = formData.name;

  addAddressToDB(name, ipAddress);
  getAddressesAndUpdateIpOptions();
  getStatusAndSendUpdateTable();
});

ipcMain.on('delete-request', (event, ipAddress) => {
  deleteAddressFromDB(ipAddress);
  getAddressesAndUpdateIpOptions();
  getStatusAndSendUpdateTable();
});

ipcMain.on('history-request', (event, parameters) => {
  console.log('PARAMETERS RECEIVED');
  console.log(parameters);
  getHistoryData(parameters, (err, data) => {
    if (err) {
      console.error('Erro ao buscar dados de histórico:', err);
      graphWindow.webContents.send('history-response', []);
    } else {
      console.log(data);
      graphWindow.webContents.send('history-response', data);
    }
  });
});

ipcMain.on('close-graph-window', () => {
  graphWindow.close();
});

ipcMain.on('start-ping', () => {
  if (!isPinging) {
    console.log('STARTED PING');
    isPinging = true;
  }
});

ipcMain.on('stop-ping', () => {
  console.log('STOPPING PING');
  isPinging = false;
});

ipcMain.on('update-interval', (event, data) => {
  console.log('INTERVAL UPDATE');
  pingInterval = data.interval; // Atualize o valor do intervalo com o valor recebido do renderer
  getStatusAndSendUpdateTable();
});

async function pingAddress(address) {
  try {
    if (isPinging) {
      const response = await ping.promise.probe(address);
      return response;
    }
    else{
      console.log('response: ', response);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao pingar o endereço ${address}: ${error.message}`);
    return null;
  }
}

async function pingAllAddresses() {
  console.log('TENTANDO NOVAMENTE, isPinging: ' + isPinging);

  const promises = addresses.map((address) => pingAddress(address));
  const results = await Promise.all(promises);

  addResultsToDB(results,isPinging);

  console.log('####################');
  return results;
}

async function pingAddressesAndRepeat() {
  const results = await pingAllAddresses();
  const allResponded = results.every((result) => result !== null);

  console.log('all Responded:', allResponded);

  setTimeout(() => { 
    if (allResponded) {
      console.log('Todos os pings foram concluídos. Aguardando  '+ pingInterval +' ms antes de rodar novamente.');
      getStatusAndSendUpdateTable();

      //getAddressesAndUpdateIpOptions();

      setTimeout(() => { 
          pingAddressesAndRepeat();
      }, pingInterval);

    } else {
      console.log('Alguns pings falharam, aguardando '+ pingInterval +' ms antes de tentar novamente.');
      getStatusAndSendUpdateTable();

      //getAddressesAndUpdateIpOptions();
      setTimeout(() => {
          pingAddressesAndRepeat();
      }, pingInterval);
    }
  }, 500);
}




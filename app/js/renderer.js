
const {ipcRenderer} = require('electron');
const playPause = require('./playPause');
const updateTable = require('./updateTable');
const flatpickr = require('flatpickr');
const cron = require('node-cron');

let startButton = document.querySelector('#startButton');
let stopButton = document.querySelector('#stopButton');
let updateButton = document.querySelector('#updateButton');
let addButton = document.querySelector('#addButton');
let deleteButton = document.querySelector('#deleteButton');
let plotButton = document.querySelector('#plotButton');
let ipSelect = document.getElementById('ip-select');
let typeSelect = document.getElementById("type-select");
let datePicker = document.getElementById("datePicker");
let formTime = document.getElementById("form-time");

ipcRenderer.send('get-ip-options');

let minimal_date = new Date().fp_incr(-14);

cron.schedule('0 0 * * *', () => {
    minimal_date = new Date().fp_incr(-14);
    flatpickr("#datePicker", {
        mode: 'range',
        dateFormat: 'Y-m-d',
        minDate: minimal_date,
      });
});

startButton.addEventListener('click', function() {
    playPause.startPing();
    const runningStatus = document.querySelector(".running-status");
    const statusBar = document.querySelector(".status-bar");
    runningStatus.textContent = 'Status: Running';
    statusBar.style.backgroundColor = 'green';
});

stopButton.addEventListener('click', function() {
    playPause.stopPing();
    const runningStatus = document.querySelector(".running-status");
    const statusBar = document.querySelector(".status-bar");
    runningStatus.textContent = 'Status: Stopped';
    statusBar.style.backgroundColor = 'red';
});

addButton.addEventListener('click', function() {
    ipcRenderer.send('open-add-address-window');
});

deleteButton.addEventListener('click', function() {
    ipcRenderer.send('open-delete-address-window');
});

updateButton.addEventListener('click', () => {
    const pingIntervalInSeconds = document.getElementById('pingInterval').value;
    const feedbackNegativeDiv = document.querySelector(".feedback-negative");
    const feedbackPositiveDiv = document.querySelector(".feedback-positive");

    if (pingIntervalInSeconds >= 5) {
        const pingIntervalInMillis = pingIntervalInSeconds * 1000;
        const updateStatus = document.querySelector(".update-status");

        ipcRenderer.send('update-interval', { interval: pingIntervalInMillis });

        updateStatus.textContent = '| Update Rate: ' + pingIntervalInSeconds + 's';
        feedbackNegativeDiv.style.display = "none";
        feedbackPositiveDiv.style.display = "block";
        // Usando setTimeout para ocultar feedbackPositiveDiv após 5 segundos
        setTimeout(() => {
            feedbackPositiveDiv.style.display = "none";
        }, 5000); // 5000 milissegundos = 5 segundos
    }else{
        feedbackNegativeDiv.style.display = "block";
        feedbackPositiveDiv.style.display = "none";
        setTimeout(() => {
            feedbackNegativeDiv.style.display = "none";
        }, 5000); // 5000 milissegundos = 5 segundos
    }
});

plotButton.addEventListener('click', () => {
    const ip_address = ipSelect.value;
    const var_type = typeSelect.value;
    const dateValues = datePicker.value.split(" to ");

    let min_date;
    let max_date;

    if (dateValues.length === 2) {
        // Se houver dois valores, atribua o primeiro a "min_date" e o segundo a "max_date"
        min_date = dateValues[0];
        max_date = dateValues[1];
    }else if (dateValues.length === 1) {
        // Se houver apenas um valor, atribua o mesmo valor a "min_date" e "max_date"
        min_date = dateValues[0];
        max_date = dateValues[0];
    }


    ipcRenderer.send('open-graph-window', { ip_address, var_type, min_date, max_date });
});

ipcRenderer.on('update-status-table', (event, data) => {
    updateTable.updateTable(data);
});

flatpickr("#datePicker", {
    mode: 'range',
    dateFormat: 'Y-m-d',
    minDate: minimal_date,
  });

ipcRenderer.on('ip-options', (event, options) => {
    console.log(options);
    ipSelect.innerHTML = '';
    // Preencha o campo de seleção com as opções
    options.forEach((ip) => {
        const optionElement = document.createElement('option');
        optionElement.value = ip;
        optionElement.text = ip;
        ipSelect.appendChild(optionElement);
    });
});

// $(".selector").flatpickr(optional_config);
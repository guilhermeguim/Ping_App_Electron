const {ipcRenderer} = require('electron');

let ipSelectDel = document.getElementById('ip-select-del');
let form = document.querySelector('form');
let deleteButton  = document.getElementById('deleteButton');

ipcRenderer.send('del-ip-list-request');

ipcRenderer.on('ip-options-to-del', (event, options) => {
    console.log('ESCUTEI');
    console.log(options);
    ipSelectDel.innerHTML = '';
    // Preencha o campo de seleção com as opções
    options.forEach((ip) => {
        const optionElement = document.createElement('option');
        optionElement.value = ip;
        optionElement.text = ip;
        ipSelectDel.appendChild(optionElement);
    });
});

form.addEventListener('submit', (event) => {

    console.log('clicked');
    event.preventDefault(); // Impede o envio padrão do formulário

    const ipAddress = document.getElementById('ip-select-del').value;

      // Envie os dados para o processo principal
    ipcRenderer.send('delete-request', ipAddress);

});
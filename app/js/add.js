const {ipcRenderer} = require('electron');

let form = document.querySelector('form');
let saveButton  = document.getElementById('saveButton');

form.addEventListener('submit', (event) => {

  console.log('clicked');

  if (form.checkValidity()) {

    const ipAddress = document.getElementById('inputIP').value;
    const name = document.getElementById('inputName').value;

    const formData = {
        ipAddress,
        name,
    };

      // Envie os dados para o processo principal
    ipcRenderer.send('form-submission', formData);
  }
});
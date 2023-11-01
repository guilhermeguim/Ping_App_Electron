const { getAddressesFromDB,
    insertPingRecord,
    insertAddress,
    deleteAddress,
    updateCurrentStatus,
    getCurrentStatusData,
    getHistoryData,
    startAddresses } = require('./database');

function restartStatus(){
    startAddresses((err) => {
        if (err) {
            console.error('ERRO AO REINICIAR OS STATUS', err);
        } else {
        }
    });
}

function addAddressToDB(name, ipAddress){
    insertAddress(name, ipAddress, (err) => {
        if (err) {
          console.error('Erro ao inserir registro de ping no banco de dados:', err);
        } else {
        }
      });
}

function deleteAddressFromDB(ipAddress){
    deleteAddress(ipAddress, (err) => {
        if (err) {
            console.error('Erro ao deletar registro no banco de dados:', err);
        } else {
        }
    });
}

function addResultsToDB(results,isPinging) {
    if (isPinging) {
        results.forEach((result) => {
          let status = result.alive ? 1 : 0
          let latency = result.time
          address = result.host
          if (latency === 'unknown') {
            latency = 0;
          }
          console.log(`Address: ${address}, Status: ${status}, Latency: ${latency} ms`);
          insertPingRecord(address, status, latency, (err) => {
            if (err) {
              console.error('Erro ao inserir registro de ping no banco de dados:', err);
            } else {
            }
          });
          updateCurrentStatus(address, status, latency, (err) => {
            if (err) {
              console.error('Erro ao atualizar o registro de status atual:', err);
            } else {
            }
          });
      
        });
        }
}

module.exports = {
    restartStatus,
    addAddressToDB,
    deleteAddressFromDB,
    addResultsToDB,
    };
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(`${__dirname}/data/ping_data.db`);

function getAddressesFromDB(callback) {
    const query = 'SELECT ip_address FROM current_status';
    db.all(query, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            const addresses = rows.map((row) => row.ip_address);
            callback(null, addresses);
        }
    });
}

function insertPingRecord(address, status, latency, callback) {
    const query = 'INSERT INTO ping_history (ip_address, status, latency, date_time) VALUES (?, ?, ?, datetime("now", "localtime"))';
    db.run(query, [address, status, latency], (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function insertAddress(name, ipAddress, callback) {
    const query = "INSERT INTO current_status (name, ip_address, status, latency, last_loss) VALUES (?, ?, '2','0', '-')";
    db.run(query, [name, ipAddress], (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function startAddresses(callback) {
    const query = "UPDATE current_status SET status = 2, latency = 0";
    db.run(query, (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function deleteAddress(ipAddress, callback) {
    const query = "DELETE FROM current_status WHERE ip_address = ?";
    db.run(query, [ipAddress], (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function updateCurrentStatus(address, status, latency, callback) {
    let query = ''
    if(status == 0){
        query = 'UPDATE current_status SET status = ?, latency = ?, last_loss = datetime("now", "localtime") WHERE ip_address = ?';
    }else{
        query = 'UPDATE current_status SET status = ?, latency = ? WHERE ip_address = ?';
    }
    
    db.run(query, [status, latency, address], (err) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function getCurrentStatusData(callback) {
    const query = 'SELECT * FROM current_status';
    db.all(query, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

function getHistoryData(parameters, callback) {

    const ip_address = parameters.ip_address;
    const var_type = parameters.var_type;
    const min_date = parameters.min_date;
    const max_date = parameters.max_date;

    console.log('QUERY PARAMETERS: ' + JSON.stringify(parameters));

    let queryHist = ''
    if(var_type == 'status'){
        queryHist = "SELECT status, date_time FROM ping_history WHERE ip_address = ? AND date_time BETWEEN ? || ' 00:00:00' AND ? || ' 23:59:59'";
    }else{
        queryHist = "SELECT latency, date_time FROM ping_history WHERE ip_address = ? AND date_time BETWEEN ? || ' 00:00:00' AND ? || ' 23:59:59'";
    }
    
    db.all(queryHist, [ip_address,min_date,max_date], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        //console.log(rows)
        callback(null, rows);
      }
    });
  }


function cleanOldRecords() {
    // Calcular a data atual menos 90 dias
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    ninetyDaysAgo.setHours(-3, 0, 0, 0);

    // Formatar a data no formato 'YYYY-MM-DD HH:mm:ss'
    const formattedDate = ninetyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');

    console.log("Excluindo dados anteriores a:",formattedDate);

    const query = 'DELETE FROM ping_history WHERE date_time < ?';

    // Executar a consulta para excluir registros mais antigos
    db.run(query, [formattedDate], (err) => {
        if (err) {
            console.error('Erro ao limpar registros antigos:', err);
            console.log(query);
        } else {
            console.log('Registros antigos excluídos com sucesso.');
            console.log(query);
        }
    });
}

module.exports = {
    getAddressesFromDB,
    insertPingRecord,
    insertAddress,
    deleteAddress,
    updateCurrentStatus,
    getCurrentStatusData,
    getHistoryData,
    startAddresses,
    cleanOldRecords

};
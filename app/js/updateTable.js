

function getStatusIcon(status) {
    // Define a classe CSS e a imagem com base no valor de status
    if (status === 0) {
        return '<img class="status-icon" src="./img/x-circle.png" alt="Offline">';
    } else if (status === 1) {
        return '<img class="status-icon" src="./img/check-circle.png" alt="Online">';
    } else if (status === 2) {
        return '<img class="status-icon" src="./img/reading-circle.png" alt="Reading">';
    } else {
        // Se o status não for 0, 1 ou 2, você pode lidar com isso como quiser,
        // aqui estou retornando uma imagem padrão para outros valores de status.
        return '<img class="status-icon" src="./img/error-circle.png" alt="Unknown">';
    }
}

function getStatusText(status) {
    // Define o texto com base no valor de status
    if (status === 0) {
        return 'OFFLINE';
    } else if (status === 1) {
        return 'ONLINE';
    } else if (status === 2) {
        return 'STARTING';
    } else {
        // Tratamento para outros valores de status
        return 'ERROR';
    }
}

module.exports = {

    updateTable(data){
        const statusTableBody = document.getElementById('status-table-body');
        statusTableBody.innerHTML = '';
        
        data.forEach((row) => {
            const newRow = document.createElement('tr');
            
            newRow.innerHTML = `
                <td class="table-dark text-center">${row.ip_address}</td>
                <td class="table-dark text-center">${row.name}</td>
                <td class="table-dark text-center status-cell">${getStatusIcon(row.status)} ${getStatusText(row.status)}</td>
                <td class="table-dark text-center">${row.latency}</td>
                <td class="table-dark text-center">${row.last_loss}</td>
                `;
            statusTableBody.appendChild(newRow);
        });

        //completa as linhas vazias da tabela
        const sizeLimit = 9;
        if(data.length <= sizeLimit) {
            for(let i = 1; i < (sizeLimit - data.length); i++) {
                const newRow = document.createElement('tr');
            
                newRow.innerHTML = `
                    <td class="table-dark text-center">-</td>
                    <td class="table-dark text-center">-</td>
                    <td class="table-dark text-center status-cell">-</td>
                    <td class="table-dark text-center">-</td>
                    <td class="table-dark text-center">-</td>
                    `;
                statusTableBody.appendChild(newRow);
            };
        }
    }
}

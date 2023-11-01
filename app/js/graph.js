const {ipcRenderer} = require('electron');
const queryParams = new URLSearchParams(window.location.search);
const data_parameters = JSON.parse(queryParams.get('data_parameters'));
const var_type = data_parameters.var_type;

ipcRenderer.send('history-request', data_parameters);

graph = document.getElementById('graph-area');


ipcRenderer.on('history-response', (event, data) => {
    // Transforme os dados recebidos em listas separadas para o eixo X e Y.
    const xData = data.map((entry) => entry.date_time);
    
    //console.log(JSON.stringify(data));

    var yData = ''
    if(var_type == 'status'){
      yData = data.map((entry) => entry.status);
    }else{
      yData = data.map((entry) => entry.latency);
    }

    // Calcule a média dos valores em yData.
    const media = yData.reduce((acc, val) => acc + val, 0) / yData.length;
  
    // Crie um objeto de dados Plotly com as listas de dados.
    const plotlyData = [{
      x: xData,
      y: yData,
      type: 'scatter',
      mode: 'lines+markers',
      marker: { color: '#012C5E' },
      line: { color: '#012C5E' },
      name: var_type,
    }, {
      x: xData, // Usamos os mesmos valores de xData
      y: Array(xData.length).fill(media), // Crie um array com valores da média para y
      type: 'scatter',
      mode: 'lines', // Define o modo como linhas (não marcadores)
      line: { color: 'orange', dash: 'dash' }, // Define a cor como amarela e traço tracejado
      name: 'average'
    }];
  
    // Configurações de layout do gráfico.
    const layout = {
      title: {
        text: data_parameters.ip_address.toUpperCase() + ' ' + var_type.toUpperCase() + ' GRAPH',
        font: {
          family: 'Montserrat', // Use a fonte Montserrat
          size: 20, // Tamanho do título principal
          color: 'black', // Cor do título principal
          weight: 'bold' // Título principal em negrito
        },
        class: 'main-title'
      },
      xaxis: {
        title: 'datetime',
        gridcolor: 'darkgray',
        titlefont: {
          family: 'Montserrat' // Fonte "Montserrat" para o título do eixo X
        },
        tickfont: {
          family: 'Montserrat' // Fonte "Montserrat" para os rótulos do eixo X
        }
      },
      yaxis: {
        title: var_type,
        gridcolor: 'darkgray',
        titlefont: {
          family: 'Montserrat' // Fonte "Montserrat" para o título do eixo Y
        },
        tickfont: {
          family: 'Montserrat' // Fonte "Montserrat" para os rótulos do eixo Y
        }
      },
      // Defina o fundo como transparente (rgba(0,0,0,0)).
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      margin: {
        l: 50, // Margem esquerda
        r: 20, // Margem direita
        b: 40, // Margem inferior
        t: 40, // Margem superior
        pad: 0 // Preenchimento interno entre o gráfico e as margens
      },

      annotations: [{
        x: xData[xData.length - 1], // Posição X da anotação (último ponto no gráfico)
        y: media, // Posição Y da anotação (valor da média)
        xref: 'x', // Referência X da posição (neste caso, eixo X)
        yref: 'y', // Referência Y da posição (neste caso, eixo Y)
        text: 'Average: ' + media.toFixed(2), // Texto a ser exibido
        showarrow: true, // Exibir seta de anotação
        arrowhead: 7, // Estilo da seta
        ax: 0, // Ajuste X da seta
        ay: -40, // Ajuste Y da seta
        font: {
          family: 'Montserrat' // Fonte "Montserrat" para a anotação
        }
      }],

      legend: {
        x: 0.7, // Posição horizontal da legenda (1 = extremidade direita)
        xanchor: 'left', // Ancoragem horizontal da legenda
        y: 1.15, // Ajuste vertical para posicionar acima do gráfico
        yanchor: 'top', // Ancoragem vertical da legenda
        orientation: 'h', // Orientação horizontal da legenda (horizontal)
        
      }

    };
  
    // Renderize o gráfico usando Plotly.
    Plotly.newPlot(graph, plotlyData, layout);
  });


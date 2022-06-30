export const chartOptions = {
    chart: {
      type: 'pie',
      options3d: {
        enabled: true,
        alpha: 45,
        beta: 0
      },
      backgroundColor: '#000000'
    },
    title: {
      text: ''
    },
    credits: {
      enabled: false
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    tooltip: {
      pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        depth: 50,
        dataLabels: {
          enabled: false
        },
        showInLegend: true
      }
    },
    legend: {
      backgroundColor: '#000000',
      itemStyle: {
        fontFamily: 'Rubik',
        color: '#a0a0a0'
    }
    },
    series: [{
      type: 'pie',
      name: 'Token share',
      data: [
        {
          name: 'Ecosystem',
          y: 410000000,
          sliced: true,
          selected: true
        },
        {
          name: 'Team/Advisory',
          y: 150000000
        },
        {
          name: 'Marketing',
          y: 196000000
        },
        {
          name: 'Private sale',
          y: 80000000
        },
        {
          name: 'Public sale',
          y: 50000000
        },
        {
          name: 'Initial swap',
          y: 50000000
        },
        {
          name: 'Reserve',
          y: 60000000
        }
      ]
    }]
};

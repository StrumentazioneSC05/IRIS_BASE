//graph_data = <?php echo json_encode($data_array); ?>;
//cod_pozzo = <?php echo json_encode($cod_pozzo); ?>;
//chart.setSize(width, height, doAnimation = true);
$(function () {
$('#container').highcharts({
chart: {
type: 'column'
},
title: {
text: 'Serie misure pozzo'
},

xAxis: {
type: 'Data della misura',
labels: {
rotation: -45,
style: {
fontSize: '13px',
fontFamily: 'Verdana, sans-serif'
}
}
},
yAxis: {
min: 0,
title: {
text: 'Soggiacenza (m)'
}
},
legend: {
enabled: false
},
tooltip: {
pointFormat: 'Population in 2008: <b>{point.y:.1f} millions</b>'
},
series: [{
name: 'Codice pozzo: ',
data: [['2012-05-11',14.25],['2012-09-26',13.65],['2013-07-08',13.44],['2013-10-15',13.53],['2014-04-10',13.42],['2014-10-01',13.74],['2015-09-28',13.45],]
,
dataLabels: {
enabled: true,
rotation: -90,
color: '#FFFFFF',
align: 'right',
format: '{point.y:.1f}', // one decimal
y: 10, // 10 pixels down from the top
style: {
fontSize: '13px',
fontFamily: 'Verdana, sans-serif'
}
}
}]
//, function (chart) { // on complete
//chart.renderer.image('./logoarpa.png', 0, 0, 132, 50)
//.add();
});
});


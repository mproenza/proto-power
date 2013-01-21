function parseDate(dateString) {            
    var dt = dateString.split(" ");
    var date = dt[0];
    var time = dt[1];
           
    var dateArray = date.split("-");
    var timeArray = time.split(":");    
                        
    var date = new Date(Number(dateArray[0]) , Number(dateArray[1]) - 1 , Number(dateArray[2]) , Number(timeArray[0]), Number(timeArray[1]), Number(timeArray[2]));
    return date;
}


function ChartBuilder2(o) {
	this._colors = ["#d1655d", "#339900", "#3399ff", "#FF3600", "#FF6600", "#FCD202", "#B0DE09", "0D8ECF", "#FF0000", "3300FF",
					"#2A0CD0", "#CD0D74", "#CC0000", "#00CC00", "#0000CC", "#DDDDDD", "#999999", "#333333", "#990000"];
	

	this._pathConfigs = {
		pathToImages: "../common/js/etc/amcharts/amstockchart_2.8.4/amcharts/images/",// TODO: change
	};
}

ChartBuilder2.prototype = {
	multiDatasetStockChart:
		function(chartData, options) {
			var where = options["where"];// The id of the element where the chart will be drawn
			var minTime = options["min_time"]; // The minimum time expression as specified in AmCharts
			var indicators = options["indicators"];// The name of the fields in chartData to extract the values from
			
			var extras = options.extras;
			var fillAlphas = options.fillAlphas;
			
			// Create timeline using DATE and TIME tags (if 'DATETIME' tag doesn't exist)
			if(!chartData[0]["DATETIME"]) {
				for(var i=0;i<chartData.length;i++) {
					chartData[i]["DATETIME"] = parseDate(chartData[i]["DATE"] + " " + chartData[i]["TIME"])
				}
			}
			
			var chart = new ExtendedStockChart();
			chart.pathToImages = this._pathConfigs.pathToImages;
			
			var categoryAxesSettings = new AmCharts.CategoryAxesSettings();
			categoryAxesSettings.minPeriod = minTime;
			categoryAxesSettings.maxSeries = 0;
			chart.categoryAxesSettings = categoryAxesSettings;
			
			// DATASETS
			var colorIdx = 0;
			for(ind in indicators) {
				var dataSet = new ExtendedDataSet();
				dataSet.title = indicators[ind];
				dataSet.color = this._colors[colorIdx];
				dataSet.dataProvider = chartData;
				dataSet.fieldMappings = [{fromField:indicators[ind], toField:"INDICATOR"}];
				dataSet.categoryField = "DATETIME";
				chart.dataSets.push(dataSet);
				colorIdx++;
			}
			var nDataSets = chart.dataSets.length;
			
			var stockPanel = new AmCharts.StockPanel();
			stockPanel.recalculateToPercents = "never";
			
			var panelsSettings = new AmCharts.PanelsSettings();
			panelsSettings.startDuration = 1;
			chart.panelsSettings = panelsSettings;   
			
			var graph = new AmCharts.StockGraph();
			graph.comparable = true;
			graph.compareField = "INDICATOR";
			graph.valueField = "INDICATOR";
			graph.type = "line";
			graph.bullet = "round";
			graph.bulletSize = 3;
			graph.lineThickness = 1;
			graph.negativeLineColor = "#d1655d";
			graph.negativeBase = 100000; // A big value to ensure that the graph is regularly under the negative base
			if(fillAlphas) graph.fillAlphas = fillAlphas;
			stockPanel.addStockGraph(graph);
			
			chart.panels = [stockPanel];
			
			var sbsettings = new AmCharts.ChartScrollbarSettings();
			sbsettings.graph = graph;
			sbsettings.graphType = "line";
			chart.chartScrollbarSettings = sbsettings;
			
			// Add DATASET SELECTOR only if chart has more than one dataset
			if(nDataSets > 1) {
				var dataSetSelector = new AmCharts.DataSetSelector();
				dataSetSelector.position = "left";
				chart.dataSetSelector = dataSetSelector;
			}
			
			// PERIOD SELECTOR
			var periodSelector = new AmCharts.PeriodSelector();
			nDataSets > 1? periodSelector.position = "left":periodSelector.position = "bottom";
			periodSelector.periods = [{
				period: "hh",
				count: 1,
				label: "1 hour"
			}, {
				period: "hh",
				count: 12,
				label: "12 hours"
			}, {
				period: "hh",
				//selected: true,
				count: 24,
				label: "1 day"
			}, {
				period: "MAX",
				label: "MAX"
			}];
			chart.periodSelector = periodSelector;
			
			//chart.chartCursorSettings.bulletsEnabled = true;
			chart.chartCursorSettings.valueBalloonsEnabled = true;
			chart.chartCursorSettings.categoryBalloonDateFormats = [{period:"mm", format:"MMM DD (HH:NN)"}, {period:"ss", format:"MMM DD (HH:NN:SS)"}];
			
			/*var chartCursor = new AmCharts.ChartCursor();
			chartCursor.selectWithoutZooming = true;
			chart.chartCursors.push(chartCursor);*/
			
			// -----------Testing extras
			if(extras) {
				guideDef = extras[0];
				var valueAxis = new AmCharts.ValueAxis();

				// GUIDE
				var guide = new AmCharts.Guide();
				guide.value = guideDef.value;
				guide.lineColor = "#000000";
				guide.dashLength = 0;
				guide.label = guideDef.label;
				guide.inside = true;
				guide.lineAlpha = 1;
				guide.lineThickness = 2;
				valueAxis.addGuide(guide);
				
				// Change graph color above guide
				chart.dataSets[0].color = "#000000"; // Change color over the threshold
				graph.negativeBase = guideDef.value;
				
				stockPanel.addValueAxis(valueAxis);
			}
			//----------------------------
			
			//chart.maxPlots = 500;
			
			chart.addPanSelectSwitch();
			chart.draw(where);
			chart.animationPlayed = true; // animate only on first drawing
			
			return chart;
		},
	
	multiGraphStockChart:
		function(chartData, options) {
			var where = options["where"];// The id of the element where the chart will be drawn
			var minTime = options["min_time"]; // The minimum time expression as specified in AmCharts
			var indicators = options["indicators"];// The name of the fields in chartData to extract the values from
			
			var extras = options.extras;
			var disabledGraphs = options.disabled;
			
			// Create timeline using DATE and TIME tags (if 'DATETIME' tag doesn't exist)
			if(!chartData[0]["DATETIME"]) {
				for(var i=0;i<chartData.length;i++) {
					chartData[i]["DATETIME"] = parseDate(chartData[i]["DATE"] + " " + chartData[i]["TIME"])
				}
			}
			
			var chart = new ExtendedStockChart();
			chart.pathToImages = this._pathConfigs.pathToImages;
			
			var categoryAxesSettings = new AmCharts.CategoryAxesSettings();
			categoryAxesSettings.minPeriod = minTime;
			categoryAxesSettings.maxSeries = 0;
			chart.categoryAxesSettings = categoryAxesSettings;
			
			var stockPanel = new AmCharts.StockPanel();
			//stockPanel.recalculateToPercents = "never";
			
			var dataSet = new ExtendedDataSet();
			dataSet.dataProvider = chartData;
			dataSet.categoryField = "DATETIME";
			
			var c=0;// to select colors
			var nCharts = 0;
			for(var ind in indicators) {
				dataSet.fieldMappings.push({fromField:indicators[ind], toField:indicators[ind]});
			
				var graph = new AmCharts.StockGraph();
				graph.title = indicators[ind];
				//graph.comparable = true;
				//graph.compareField = indicators[ind];
				graph.valueField = indicators[ind];
				graph.useDataSetColors = false;
				graph.lineColor = this._colors[c];
				graph.type = "line";
				graph.bullet = "round";
				graph.bulletSize = 3;
				graph.balloonText = "[[title]]: [[value]]";
				graph.lineThickness = 1;
				graph.hidden = indicators[ind].hidden;
				
				if(disabledGraphs && $.inArray(c, disabledGraphs) != -1) graph.hidden = true;//initially hide some graphs
				
				stockPanel.addStockGraph(graph);
				c++;
				nCharts++;
			}
			chart.dataSets.push(dataSet);
			
			/*var panelsSettings = new AmCharts.PanelsSettings();
			panelsSettings.startDuration = 1;
			chart.panelsSettings = panelsSettings;*/   
			
			chart.panels = [stockPanel];
			
			var sbsettings = new AmCharts.ChartScrollbarSettings();
			sbsettings.graph = graph;
			sbsettings.graphType = "line";
			chart.chartScrollbarSettings = sbsettings;
			
			// Add LEGEND only if chart has more than one graph
			if(nCharts > 1) {
				/*var legendSettings = new AmCharts.LegendSettings();
				legendSettings.events["rollOverItem"] = [];
				legendSettings.addListener("rollOverItem", function(e) {
					alert("OK");
				});
				chart.legendSettings = legendSettings;*/
					
				var stockLegend = new AmCharts.StockLegend();
				stockLegend.valueTextRegular = "[[title]]";
				stockLegend.valueText = "";
				stockLegend.equalWidths = true;
				//stockLegend.rollOverGraphAlpha = 0.3;
				stockPanel.stockLegend = stockLegend;
			}
			
			// PERIOD SELECTOR
			var periodSelector = new AmCharts.PeriodSelector();
			periodSelector.position = "bottom";
			periodSelector.periods = [{
				period: "hh",
				count: 1,
				label: "1 hour"
			}, {
				period: "hh",
				count: 12,
				label: "12 hours"
			}, {
				period: "hh",
				//selected: true,
				count: 24,
				label: "1 day"
			}, {
				period: "MAX",
				label: "MAX"
			}];
			chart.periodSelector = periodSelector;
			
			//chart.chartCursorSettings.bulletsEnabled = true;
			chart.chartCursorSettings.valueBalloonsEnabled = true;
			chart.chartCursorSettings.categoryBalloonDateFormats = [{period:"mm", format:"MMM DD (HH:NN)"}, {period:"ss", format:"MMM DD (HH:NN:SS)"}];
			
			/*var chartCursor = new AmCharts.ChartCursor();
			chartCursor.selectWithoutZooming = true;
			chart.chartCursors.push(chartCursor);*/
			
			// -----------Testing extras
			if(extras) {
				guideDef = extras[0];
				var valueAxis = new AmCharts.ValueAxis();

				// GUIDE
				var guide = new AmCharts.Guide();
				guide.value = guideDef.value;
				guide.lineColor = "#000000";
				guide.dashLength = 0;
				guide.label = guideDef.label;
				guide.inside = true;
				guide.lineAlpha = 1;
				guide.lineThickness = 2;
				valueAxis.addGuide(guide);
				
				stockPanel.addValueAxis(valueAxis);
			}
			//----------------------------
			
			//chart.maxPlots = 500;
			
			//chart.addPanSelectSwitch();
			chart.draw(where);
			chart.animationPlayed = true; // animate only on first drawing
			
			return chart;
		},
	
	/*multiDatasetAndGraphStockChart:
		function(chartData, options) {
			var where = options["where"];// The id of the element where the chart will be drawn
			var minTime = options["min_time"]; // The minimum time expression as specified in AmCharts
			var indicators = options["indicators"];// The name of the fields in chartData to extract the values from
			
			var extras = options.extras;
			var disabledGraphs = options.disabled;
			
			// Create timeline using DATE and TIME tags (if 'DATETIME' tag doesn't exist)
			if(!chartData[0]["DATETIME"]) {
				for(var i=0;i<chartData.length;i++) {
					chartData[i]["DATETIME"] = parseDate(chartData[i]["DATE"] + " " + chartData[i]["TIME"])
				}
			}
			
			var chart = new ExtendedStockChart();
			chart.pathToImages = this._pathConfigs.pathToImages;
			
			var categoryAxesSettings = new AmCharts.CategoryAxesSettings();
			categoryAxesSettings.minPeriod = minTime;
			categoryAxesSettings.maxSeries = 0;
			chart.categoryAxesSettings = categoryAxesSettings;
			
			var stockPanel = new AmCharts.StockPanel();
			stockPanel.recalculateToPercents = "never";
			
			var panelsSettings = new AmCharts.PanelsSettings();
			panelsSettings.startDuration = 1;
			chart.panelsSettings = panelsSettings;
			
			// DATASETS
			var colorIdx = 0;
			for(ind in indicators) {
				var dataSet = new ExtendedDataSet();
				dataSet.title = indicators[ind];
				dataSet.color = this._colors[colorIdx];
				dataSet.dataProvider = chartData;
				dataSet.fieldMappings = [{fromField:indicators[ind], toField:indicators[ind]}];
				dataSet.categoryField = "DATETIME";
				
				var graph = new AmCharts.StockGraph();
				graph.title = indicators[ind];
				//graph.comparable = true;
				//graph.compareField = indicators[ind];
				graph.valueField = indicators[ind];
				graph.useDataSetColors = false;
				graph.lineColor = this._colors[colorIdx];
				graph.type = "line";
				graph.bullet = "round";
				graph.bulletSize = 3;
				graph.balloonText = "[[title]]: [[value]]";
				graph.lineThickness = 1;
				
				if(disabledGraphs && $.inArray(colorIdx, disabledGraphs) != -1) graph.hidden = true;//initially hide some graphs
				
				stockPanel.addStockGraph(graph);
				
				chart.dataSets.push(dataSet);
				colorIdx++;
			}
			var nDataSets = chart.dataSets.length;
		
			chart.panels = [stockPanel];
			
			var sbsettings = new AmCharts.ChartScrollbarSettings();
			sbsettings.graph = graph;
			sbsettings.graphType = "line";
			chart.chartScrollbarSettings = sbsettings;
			
			// Add LEGEND only if chart has more than one graph
			if(nDataSets > 1) {
				var stockLegend = new AmCharts.StockLegend();
				stockLegend.valueTextRegular = "[[title]]";
				stockLegend.valueText = "";
				stockPanel.stockLegend = stockLegend;
			}
			
			// PERIOD SELECTOR
			var periodSelector = new AmCharts.PeriodSelector();
			periodSelector.position = "bottom";
			periodSelector.periods = [{
				period: "hh",
				count: 1,
				label: "1 hour"
			}, {
				period: "hh",
				count: 12,
				label: "12 hours"
			}, {
				period: "hh",
				//selected: true,
				count: 24,
				label: "1 day"
			}, {
				period: "MAX",
				label: "MAX"
			}];
			chart.periodSelector = periodSelector;
			
			//chart.chartCursorSettings.bulletsEnabled = true;
			chart.chartCursorSettings.valueBalloonsEnabled = true;
			chart.chartCursorSettings.categoryBalloonDateFormats = [{period:"mm", format:"MMM DD (HH:NN)"}, {period:"ss", format:"MMM DD (HH:NN:SS)"}];
			
			// -----------Testing extras
			if(extras) {
				guideDef = extras[0];
				var valueAxis = new AmCharts.ValueAxis();

				// GUIDE
				var guide = new AmCharts.Guide();
				guide.value = guideDef.value;
				guide.lineColor = "#999999";
				guide.dashLength = 0;
				guide.label = guideDef.label;
				guide.inside = true;
				guide.lineAlpha = 1;
				guide.lineThickness = 2;
				valueAxis.addGuide(guide);
				
				stockPanel.addValueAxis(valueAxis);
			}
			//----------------------------
			
			//chart.adjustPlotCount(500 , 200);
			
			chart.addPanSelectSwitch();
			chart.draw(where);
			chart.animationPlayed = true; // animate only on first drawing
			
			return chart;
		},*/
};
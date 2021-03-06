MareFrame.DST.GUIHandler = function () {
	var editorMode = true;
	var canvas = new createjs.Stage("MCATool");
	var valueFnCanvas = new createjs.Stage("valueFn_canvas");
	var controlP = new createjs.Shape();
	var valueFnStage = new createjs.Container();
	var valueFnLineCont = new createjs.Container();
	var valueFnSize = 100;
	var stage = new createjs.Container();
	var googleColors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
	var hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, canvas.canvas.width, canvas.canvas.height));
	var valFnBkGr = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, valueFnSize, valueFnSize));

	hitArea.name = "hitarea";
	if (editorMode)
		hitArea.addEventListener("pressmove", pressMove);

	hitArea.addEventListener("mousedown", mouseDown);


	controlP.graphics.f("#615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
	valFnBkGr.addEventListener("pressmove", moveValFnCP);
	valFnBkGr.addEventListener("mousedown", downValFnCP);
	controlP.mouseChildren = false;


	canvas.addChild(hitArea);
	canvas.addChild(stage);
	valueFnCanvas.addChild(valFnBkGr);
	valueFnCanvas.addChild(valueFnLineCont);
	valueFnCanvas.addChild(valueFnStage);
	valueFnCanvas.addChild(controlP);
	h.setGUI(this);


	var update = true;
	var chartsLoaded = false;
	var oldX = 0;
	var oldY = 0;
	var selectedItems = [];


	var finalScoreChart = new google.visualization.ColumnChart(document.getElementById('finalScore_div'));
	var finalScoreChartOptions = {
		width: 1024,
		height: 400,
		vAxis: { minValue: 0 },
		legend: { position: 'top', maxLines: 3 },
		bar: { groupWidth: '75%' },
		animation: { duration: 500, easing: "out" },
		isStacked: true,
		focusTarget: 'category'

	};
	if (editorMode) {
		$(".header-bar").show();
		$("#editableDataTable").on('focusout', function () {
			// lame that we're hooking the blur event
			console.log(this.innerHTML);
			//document.designMode = 'off';
		});
	}
	var elementColors = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];


	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(60);

	//modify element and connection classes to contain createjs.Container object
	MareFrame.DST.Element.easelElmt = 0;
	MareFrame.DST.Element.prototype.setID = function (i) {
		this.setId(i);
		this.easelElmt.name = i;
		update = true;
	};

	this.setSize = function (x, y) {
		canvas.canvas.width = x;
		canvas.canvas.height = y;
		//$("#MCATool").width(x);
		//$("#MCATool").height(y);
	};

	this.updateElement = function (elmt) {
		elmt.easelElmt.removeAllChildren();

		var rect = new createjs.Shape();
		rect.graphics.f(elementColors[elmt.getType()][0]).s(elementColors[elmt.getType()][1]).rr(0, 0, 150, 30, 4);

		var label = new createjs.Text(elmt.getName().substr(0, 24), "1em trebuchet", elementColors[elmt.getType()][1]);
		label.textAlign = "center";
		label.textBaseline = "middle";
		label.maxWidth = 145;
		label.x = 75;
		label.y = 15;

		elmt.easelElmt.addChild(rect);
		elmt.easelElmt.addChild(label);
	};

	this.addElementToStage = function () {

		console.log("adding element to stage");
		var elmt = h.getActiveModel().CreateNewElement();

		elmt.easelElmt = new createjs.Container();

		this.updateElement(elmt);


		elmt.easelElmt.regX = 75;
		elmt.easelElmt.regY = 15;
		elmt.easelElmt.x = 225;
		elmt.easelElmt.y = 125;
		if (editorMode)
			elmt.easelElmt.addEventListener("pressmove", pressMove);

		elmt.easelElmt.addEventListener("mousedown", mouseDown);
		elmt.easelElmt.on("dblclick", dblClick);
		elmt.easelElmt.mouseChildren = false;
		elmt.easelElmt.name = elmt.getID();

		stage.addChild(elmt.easelElmt);

		pause(1);
		update = true;
		return elmt;
	};

	function dblClick(e) {
		if (e.target.name.substr(0, 4) === "elmt") {
			h.gui.populateElmtDetails(e.target.name);
			$("#detailsDialog").dialog("open");

		}
	}


	this.populateElmtDetails = function (elmtID) {

		var elmt = h.getActiveModel().getElement(elmtID);

		//console.log(elmt)
		//set dialog title
		$("#detailsDialog").dialog({
			title: elmt.getName()
		});


		//console.log(tableMat);
		var chartOptions = {
			width: 700,
			height: 400,
			vAxis: { minValue: 0 },
			legend: { position: 'none', maxLines: 3 },
			bar: { groupWidth: '60%' }

		};
		switch (elmt.getType()) {
			case 2://scenario
				//show: tabledata,description
				$("#description_div").show();
				break;

			case 0://attribute
				//show: valueFn,direct(sliders),ahp
				$("#weightingMethodSelector").show();
				$("#datatable_div").show();
				$("#chart_div").show();
				// Create the data table.
				// Instantiate and draw our chart, passing in some options.
				var chartData = new google.visualization.arrayToDataTable(h.getActiveModel().getWeightedData(elmt, true));
				var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
				chart.draw(chartData, chartOptions);

				break;

			case 3://objective
			case 1://sub objective
				//show: swing(sliders),direct(sliders),ahp
				$("#weightingMethodSelector").show();
				break;



		}
		switch (elmt.getMethod()) {
			case 0://direct or undefined
				break;
			case 1://swing
				var sliderHtml = "";
				$("#sliders_div").empty();

				for (var i = 0; i < elmt.getData()[0].length; i++) {
					var childEl = h.getActiveModel().getConnection(elmt.getData()[0][i]).getInput();
					sliderHtml = "<div><p>" + childEl.getName() + ":<input id=\"inp_" + childEl.getID() + "\"type=\"number\" min=\"0\" max=\"100\"></p><div style=\"margin-top:5px ;margin-bottom:10px\"class =\"slider\"id=\"slid_" + childEl.getID() + "\"></div></div>";
					$("#sliders_div").append(sliderHtml);

					function makeSlider(count, id) {
						$("#slid_" + id).slider({
							min: 0,
							max: 100,
							value: elmt.getData()[1][count],
							slide: function (event, ui) {
								elmt.getData()[1][count] = ui.value;
								$("#inp_" + id).val(ui.value);
								h.gui.updateFinalScores();
							}

						});
						$("#inp_" + id).val(elmt.getData()[1][count]);

						$("#inp_" + id).on("input", function () {
							var val = parseInt(this.value);
							if (val <= 100 && val >= 0) {
								elmt.getData()[1][count] = val;
								$("#slid_" + id).slider("option", "value", val);
								h.gui.updateFinalScores();
							} else if (val > 100) {
								val = 100;
							} else {
								val = 0;
							}

							console.log(elmt.getData()[1]);
						});
					}
					makeSlider(i, childEl.getID());

				}
				$("#sliders_div").show();

				break;
			case 2://valueFn
				var tableMat = h.getActiveModel().getWeightedData(elmt, false);
				cPX = elmt.getData()[1];
				cPY = elmt.getData()[2];
				console.log("draw line");
				valueFnLineCont.removeAllChildren();


				controlP.regX = 3;
				controlP.regY = 3;
				controlP.x = cPX;
				controlP.y = cPY;
				valFnBkGr.name = elmt.getID();
				$("#valueFn_Flip").data("name",elmt.getID());
				$("#valueFn_Linear").data("name", elmt.getID());
				var maxVal = 0;
				for (var i = 1; i < tableMat.length; i++) {
					if (tableMat[i][1] > maxVal)
						maxVal = tableMat[i][1];
				}

				//set minimum and maximum values
				var maxVal = elmt.getData()[5];
				var minVal = elmt.getData()[4];

				//check if data is within min-max values, and expand as necessary
				for (var i = 1; i < tableMat.length - 1; i++) {
					if (tableMat[i][1] > maxVal) {
						maxVal = tableMat[i][1];
					}
				}

				for (var i = 1; i < tableMat.length - 1; i++) {
					if (tableMat[i][1] < minVal) {
						minVal = tableMat[i][1];
					}
				}


				for (var i = 1; i < tableMat.length; i++) {
					console.log(tableMat[i][1]);
					var vertLine = new createjs.Shape(getValueFnLine((tableMat[i][1] - minVal) / (maxVal - minVal) * valueFnSize, googleColors[i - 1]));

					valueFnLineCont.addChild(vertLine);
				}


				updateValFnCP(cPX, cPY, elmt.getData()[3]);
				updateDataTableDiv(elmt);



				break;
			case 3://ahp
		}










		//set description
		document.getElementById("description_div").innerHTML = elmt.getDescription();
	};

	function updateValFnCP(cPX, cPY, flipped_numBool) {
		//var functionSegments = 10;
		
		console.log("(" + cPX + "," + cPY + ")");
		valueFnStage.removeAllChildren();
		var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(0, valueFnSize - (valueFnSize * flipped_numBool)).bt(cPX, cPY,cPX, cPY, valueFnSize, 0 + (valueFnSize * flipped_numBool));
		//for (var i = 1; i <= functionSegments; i++)
		//{
		//	line.lt(i * (valueFnSize / functionSegments), valueFnSize - (valueFnSize * getValueFn(i * (100 / functionSegments), cPX, valueFnSize-cPY)));
		//}
		var plot = new createjs.Shape(line);
		valueFnStage.addChild(plot);
		valueFnCanvas.update();
		//update = true;
		$("#valueFn_div").show();
	}

	function updateDataTableDiv(elmt) {
		var tableMat = h.getActiveModel().getWeightedData(elmt, false);
		tableMat.splice(0, 0, ["Scenario", "Value", "Weight"]);

		var tableData = new google.visualization.arrayToDataTable(tableMat);
		var table = new google.visualization.Table(document.getElementById('datatable_div'));

		table.draw(tableData, { 'allowHtml': true, 'alternatingRowStyle': true, 'width': '100%', 'height': '100%' });
		$('.google-visualization-table-table').width("100%");
	}

	function downValFnCP(e) {
		oldX = e.stageX;
		oldY = e.stageY;
	}

	function moveValFnCP(e) {
		var elmt = h.getActiveModel().getElement(e.target.name);
		controlP.x = e.stageX;
		controlP.y = e.stageY;
		elmt.getData()[1] = e.stageX;
		elmt.getData()[2] = e.stageY;
		updateValFnCP(e.stageX, e.stageY,elmt.getData()[3]);
		updateDataTableDiv(elmt);

		//update = true;
		h.gui.updateFinalScores();
	}

	this.linearizeValFn = function () {
		
		moveValFnCP({ stageX: 50, stageY: 50, target: { name: $("#valueFn_Linear").data("name") } });
		
	}

	this.flipValFn = function () {
	

		var elmt = h.getActiveModel().getElement($("#valueFn_Flip").data("name"));

		elmt.getData()[3] = Math.abs(elmt.getData()[3] - 1);
		updateValFnCP(elmt.getData()[1], elmt.getData()[2], elmt.getData()[3]);
		updateDataTableDiv(elmt);
		//update = true;
		h.gui.updateFinalScores();
	}

	function getValueFnLine(xValue, color) {
		return new createjs.Graphics().beginStroke(color).mt(xValue, 0).lt(xValue, valueFnSize);
	}






	this.updateFinalScores = function () {
		var data = new google.visualization.arrayToDataTable(h.getActiveModel().getFinalScore());
		data.removeRow(data.getNumberOfRows() - 1);
		finalScoreChart.draw(data, finalScoreChartOptions);
	};


	this.updateTable = function (matrix) {
		var tableHTML = "";

		var topRow = true;
		matrix.forEach(function (row) {
			tableHTML = tableHTML + "<tr style=\"border:1px solid black;height:64px\">";
			for (var i = 1; i < row.length; i++) {
				if (topRow) {
					console.log(row[i]);
					console.log(h.getActiveModel().getElement(row[i]));
					tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + h.getActiveModel().getElement(row[i]).getName() + "</td>";
				}
				else
					tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + row[i] + "</td>";
			}
			tableHTML = tableHTML + "</tr>";
			topRow = false;
		});


		$("#editableDataTable").html(tableHTML);

		console.log("original datamatrix");
		console.log(h.getActiveModel().getDataMatrix());




	};

	function mouseDown(e) {
		//console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
		oldX = e.stageX;
		oldY = e.stageY;
		console.log(h.getActiveModel().getElement(e.target.name));
		//console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
		if (e.target.name.substr(0, 4) === "elmt") {
			if (document.getElementById("cnctTool").checked) //check if connect tool is enabled
			{
				console.log("cnctTool enabled");
				h.gui.connectTo(e);
			} else {
				h.gui.select(e);
			}
		} else {
			h.gui.clearSelection();
		}
	}

	this.select = function (e) {
		//console.log("ctrl key: " + e.nativeEvent.ctrlKey);
		if (!e.nativeEvent.ctrlKey && selectedItems.indexOf(e.target) === -1) {
			h.gui.clearSelection();
		}
		//console.log("adding to selection");
		h.gui.addToSelection(e.target);
	};

	function pressMove(e) {
		//console.log("press move");

		if (e.target.name === "hitarea") {
			//console.log("panning");
			stage.x += e.stageX - oldX;
			stage.y += e.stageY - oldY;
		} else if (e.target.name.substr(0, 4) === "elmt") {
			selectedItems.forEach(function (elmt) {
				elmt.x += e.stageX - oldX;
				elmt.y += e.stageY - oldY;
				h.getActiveModel().getElement(elmt.name).getConnections().forEach(function (c) {
					h.gui.updateConnection(c);
				});
			});

		}
		oldX = e.stageX;
		oldY = e.stageY;
		update = true;
	}

	function tick() {
		if (update) {
			update = false;
			canvas.update();
			valueFnCanvas.update();
		}
	}

	this.clear = function () {
		stage.removeAllChildren();
		update = true;
	};

	this.importStage = function () {
		stage.removeAllChildren();
		this.importStageElements();
		this.importStageConnections();
	};
	this.importStageElements = function () {
		h.getActiveModel().getElementArr().forEach(function (e) {
			stage.addChild(e.easelElmt);
		});
		update = true;
	};
	this.importStageConnections = function () {
		//TODO: make this.
		update = true;
	};

	this.connectTo = function (evt) {
		var elmtIdent = evt.target.name;
		var connected = false;
		//console.log("attempting connection "+elmtIdent);
		h.gui.getSelected().forEach(function (e) {
			if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {

				var c = new MareFrame.DST.Connection(h.getActiveModel().getElement(e.name), h.getActiveModel().getElement(elmtIdent));
				//console.log("connection: " + c);
				if (h.getActiveModel().addConnection(c)) {
					h.gui.addConnectionToStage(c);
					connected = true;
				}
				pause(1);

			}
		});
		if (!connected) {
			h.gui.select(evt);
		}
		//this.select(elmtIdent);
	};

	this.addConnectionToStage = function (c) {
		var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		var conn = new createjs.Shape(line);
		var arrow = new createjs.Graphics().beginFill("#0f0f0f").mt(-5, 0).lt(5, 5).lt(5, -5).cp();
		var arrowCont = new createjs.Shape(arrow);
		var cont = new createjs.Container();
		//console.log(arrowCont);
		arrowCont.x = ((c.getInput().easelElmt.x - c.getOutput().easelElmt.x) / 2) + c.getOutput().easelElmt.x;
		arrowCont.y = ((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / 2) + c.getOutput().easelElmt.y;
		arrowCont.rotation = (180 / Math.PI) * Math.atan((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / (c.getInput().easelElmt.x - c.getOutput().easelElmt.x));
		if (c.getInput().easelElmt.x < c.getOutput().easelElmt.x) {
			arrowCont.rotation = 180 + arrowCont.rotation;
		}
		cont.hitArea = new createjs.Graphics().setStrokeStyle(10).beginStroke("#0f0f0f").mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		cont.name = c.getID();
		//conn.addEventListener("pressmove", pressMove);
		//cont.addEventListener("mousedown", mouseDown);
		cont.addChild(arrowCont);
		cont.addChild(conn);


		stage.addChildAt(cont, 0);
		c.easelElmt = cont;
		update = true;

	};

	this.updateConnection = function (c) {
		//stage.removeChild(c.easelElmt);
		c.easelElmt.getChildAt(1).graphics.clear().beginStroke("#0f0f0f").mt(c.getInput().easelElmt.x, c.getInput().easelElmt.y).lt(c.getOutput().easelElmt.x, c.getOutput().easelElmt.y);
		c.easelElmt.getChildAt(0).x = ((c.getInput().easelElmt.x - c.getOutput().easelElmt.x) / 2) + c.getOutput().easelElmt.x;
		c.easelElmt.getChildAt(0).y = ((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / 2) + c.getOutput().easelElmt.y;
		c.easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((c.getInput().easelElmt.y - c.getOutput().easelElmt.y) / (c.getInput().easelElmt.x - c.getOutput().easelElmt.x));
		if (c.getInput().easelElmt.x < c.getOutput().easelElmt.x) {
			c.easelElmt.getChildAt(0).rotation = 180 + c.easelElmt.getChildAt(0).rotation;
		}
		//stage.addChildAt(c.easelElmt, 0);
		//update = true;
	};

	//this.deleteConnection = function (connIdent) {
	//    canvas.getElementById(connIdent).remove();

	//}

	//	this.deleteElement = function (elmtIdent) {
	//	    h.getActiveModel().deleteElement(elmtIdent);
	//	    canvas.getElementById("grup"+elmtIdent.substr(4)).remove();
	//	}

	//	this.deleteSelected = function() {
	//		h.getActiveModel().getSelected().forEach(function(e) {
	//			if (e.getID().substr(0, 4) === "elmt")
	//				_this.deleteElement(e.getID());
	//			else if (e.getID().substr(0, 4) === "conn") {
	//				_this.deleteConnection(e.getID);
	//			}
	//		});
	//		h.getActiveModel().clearSelection();
	//	}



	this.addToSelection = function (e) {
		if (selectedItems.indexOf(e) === -1 && e.name.substr(0, 4) === "elmt") {
			selectedItems.push(e);
			var type = h.getActiveModel().getElement(e.name).getType();
			//console.log(e);
			e.getChildAt(0).graphics.clear().f(elementColors[type][2]).s(elementColors[type][1]).rr(0, 0, 150, 30, 4);
			update = true;
		}
	};

	this.setSelection = function (e) {
		clearSelection();
		addToSelection(e);
	};

	this.getSelected = function () {
		return selectedItems;
	};

	this.clearSelection = function () {
		console.log(selectedItems);
		selectedItems.forEach(function (e) {

			var type = h.getActiveModel().getElement(e.name).getType();
			e.getChildAt(0).graphics.clear().f(elementColors[type][0]).s(elementColors[type][1]).rr(0, 0, 150, 30, 4);
		});
		selectedItems = [];
		update = true;
	};


};
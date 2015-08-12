/// <reference path="Declarations\easeljs.d.ts" />
/// <reference path="Declarations\createjs-lib.d.ts" />


module Mareframe {
    export module DST {
        export class GUIHandler {
            private editorMode: boolean = false;
            private canvas: createjs.Stage = new createjs.Stage("MCATool");
            private valueFnCanvas: createjs.Stage = new createjs.Stage("valueFn_canvas");
            private controlP: createjs.Shape = new createjs.Shape();
            private valueFnStage: createjs.Container = new createjs.Container();
            private valueFnLineCont: createjs.Container = new createjs.Container();
            private valueFnSize: number = 100;
            private stage: createjs.Container = new createjs.Container()
            private googleColors: string[] = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"];
            private hitarea: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height));
            private valFnBkgr: createjs.Shape = new createjs.Shape(new createjs.Graphics().beginFill("#ffffff").drawRect(0, 0, this.valueFnSize, this.valueFnSize));
            private update: boolean = true;
            private chartsLoaded: boolean = false;
            private oldX: number = 0;
            private oldY: number = 0;
            private selectedItems: any[] = [];
            private finalScoreChart: google.visualization.ColumnChart = new google.visualization.ColumnChart($("#finalScore_div").get(0));
            private finalScoreChartOptions: Object = {
                width: 1024,
                height: 400,
                vAxis: { minValue: 0 },
                legend: { position: 'top', maxLines: 3 },
                bar: { groupWidth: '75%' },
                animation: { duration: 500, easing: "out" },
                isStacked: true,
                focusTarget: 'category'

            };
            private elementColors: string[][] = [["#efefff", "#15729b", "#dfdfff"], ["#ffefef", "#c42f33", "#ffdfdf"], ["#fff6e0", "#f6a604", "#fef4c6"], ["#efffef", "#2fc433", "#dfffdf"]];
            private model: Model;


            constructor(p_model) {
                this.hitarea.name = "hitarea";
                if (this.editorMode) {
                    this.hitarea.addEventListener("pressmove", this.pressMove);
                    $(".header-bar").show();
                    $("#editableDataTable").on("focusout", function () {
                        //TODO: needs work
                    });
                }
                this.hitarea.addEventListener("mousedown", this.mouseDown);

                this.controlP.graphics.f("#0615b4").s("#2045ff").rr(0, 0, 6, 6, 2);
                this.valFnBkgr.addEventListener("pressmove", this.moveValFnCP);
                this.valFnBkgr.addEventListener("mousedown", this.downValFnCP);
                this.controlP.mouseChildren = false;

                this.canvas.addChild(this.hitarea);
                this.canvas.addChild(this.stage);
                this.valueFnCanvas.addChild(this.valFnBkgr);
                this.valueFnCanvas.addChild(this.valueFnLineCont);
                this.valueFnCanvas.addChild(this.valueFnStage);
                this.valueFnCanvas.addChild(this.controlP);
                createjs.Ticker.addEventListener("tick", this.tick);
                createjs.Ticker.setFPS(60);
                this.model = p_model;
            }

            setSize(p_width: number, p_height: number): void {
                this.canvas.canvas.height = p_height;
                this.canvas.canvas.width = p_width;
            }

            updateElement(elmt: Element) {
                elmt.easelElmt.removeAllChildren();

                var rect = new createjs.Shape();
                rect.graphics.f(this.elementColors[elmt.getType()][0]).s(this.elementColors[elmt.getType()][1]).rr(0, 0, 150, 30, 4);

                var label = new createjs.Text(elmt.getName().substr(0, 24), "1em trebuchet", this.elementColors[elmt.getType()][1]);
                label.textAlign = "center";
                label.textBaseline = "middle";
                label.maxWidth = 145;
                label.x = 75;
                label.y = 15;

                elmt.easelElmt.addChild(rect);
                elmt.easelElmt.addChild(label);
            }

            addElementToStage(elmt: Element) {
                this.updateElement(elmt);


                elmt.easelElmt.regX = 75;
                elmt.easelElmt.regY = 15;
                elmt.easelElmt.x = 225;
                elmt.easelElmt.y = 125;
                if (this.editorMode)
                    elmt.easelElmt.addEventListener("pressmove", this.pressMove);

                elmt.easelElmt.addEventListener("mousedown", this.mouseDown);
                elmt.easelElmt.on("dblclick", this.dblClick);
                elmt.easelElmt.mouseChildren = false;
                elmt.easelElmt.name = elmt.getID();

                this.stage.addChild(elmt.easelElmt);
                this.update = true;
            }

            private dblClick(e: createjs.MouseEvent) {
                if (e.target.name.substr(0, 4) === "elmt") {
                    this.populateElmtDetails(e.target.name);
                    $("#detailsDialog").dialog("open");

                }
            }

            populateElmtDetails(elmt: Element):void {

                //console.log(elmt)
                //set dialog title
                $("#detailsDialog").dialog({
                    title: elmt.getName()
                });


                //console.log(tableMat);
                var chartOptions: Object = {
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
                        var chartData = google.visualization.arrayToDataTable(this.model.getWeightedData(elmt, true));
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
                            var childEl = this.model.getConnection(elmt.getData()[0][i]).getInput();
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
                        var tableMat = this.model.getWeightedData(elmt, false);
                        var cPX = elmt.getData()[1];
                        var cPY = elmt.getData()[2];
                        console.log("draw line");
                        this.valueFnLineCont.removeAllChildren();


                        this.controlP.regX = 3;
                        this.controlP.regY = 3;
                        this.controlP.x = cPX;
                        this.controlP.y = cPY;
                        this.valFnBkgr.name = elmt.getID();
                        $("#valueFn_Flip").data("name", elmt.getID());
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
                            var vertLine = new createjs.Shape(this.getValueFnLine((tableMat[i][1] - minVal) / (maxVal - minVal) * this.valueFnSize, this.googleColors[i - 1]));

                            this.valueFnLineCont.addChild(vertLine);
                        }


                        this.updateValFnCP(cPX, cPY, elmt.getData()[3]);
                        this.updateDataTableDiv(elmt);



                        break;
                    case 3://ahp
                }










                //set description
                document.getElementById("description_div").innerHTML = elmt.getDescription();
            };

            private updateValFnCP(cPX: number, cPY: number, flipped_numBool: number): void {
                //var functionSegments = 10;
		
                console.log("(" + cPX + "," + cPY + ")");
                this.valueFnStage.removeAllChildren();
                var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(0, this.valueFnSize - (this.valueFnSize * flipped_numBool)).bt(cPX, cPY, cPX, cPY, this.valueFnSize, 0 + (this.valueFnSize * flipped_numBool));
                //for (var i = 1; i <= functionSegments; i++)
                //{
                //	line.lt(i * (valueFnSize / functionSegments), valueFnSize - (valueFnSize * getValueFn(i * (100 / functionSegments), cPX, valueFnSize-cPY)));
                //}
                var plot = new createjs.Shape(line);
                this.valueFnStage.addChild(plot);
                this.valueFnCanvas.update();
                //update = true;
                $("#valueFn_div").show();
            }

            private updateDataTableDiv(elmt: Element): void {
                var tableMat = this.model.getWeightedData(elmt, false);
                tableMat.splice(0, 0, ["Scenario", "Value", "Weight"]);

                var tableData = google.visualization.arrayToDataTable(tableMat);
                var table = new google.visualization.Table(document.getElementById('datatable_div'));

                table.draw(tableData, { 'allowHtml': true, 'alternatingRowStyle': true, 'width': '100%', 'height': '100%' });
                $('.google-visualization-table-table').width("100%");
            }

            private downValFnCP(e: createjs.MouseEvent): void {
                this.oldX = e.stageX;
                this.oldY = e.stageY;
            }


            linearizeValFn(): void {

                this.moveValFnCP({ stageX: 50, stageY: 50, target: { name: $("#valueFn_Linear").data("name") } });

            }

            flipValFn(): void {


                var elmt = this.model.getElement($("#valueFn_Flip").data("name"));

                elmt.getData()[3] = Math.abs(elmt.getData()[3] - 1);
                this.updateValFnCP(elmt.getData()[1], elmt.getData()[2], elmt.getData()[3]);
                this.updateDataTableDiv(elmt);
                //update = true;
                this.updateFinalScores();
            }


            private getValueFnLine(xValue: number, color: string): createjs.Graphics {
                return new createjs.Graphics().beginStroke(color).mt(xValue, 0).lt(xValue, this.valueFnSize);
            }



            updateFinalScores(): void {
                var data = google.visualization.arrayToDataTable(this.model.getFinalScore());
                data.removeRow(data.getNumberOfRows() - 1);
                this.finalScoreChart.draw(data, this.finalScoreChartOptions);
            }


            updateTable(matrix: number[][]):void  {
                var tableHTML = "";

                var topRow = true;
                matrix.forEach(function (row) {
                    tableHTML = tableHTML + "<tr style=\"border:1px solid black;height:64px\">";
                    for (var i = 1; i < row.length; i++) {
                        if (topRow) {
                            console.log(row[i]);
                            console.log(this.model.getElement(row[i]));
                            tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + this.model.getElement(row[i]).getName() + "</td>";
                        }
                        else
                            tableHTML = tableHTML + "<td contenteditable=true style=\"padding-right:10px;padding-left:5px;text-align:center;vertical-align:middle\">" + row[i] + "</td>";
                    }
                    tableHTML = tableHTML + "</tr>";
                    topRow = false;
                });


                $("#editableDataTable").html(tableHTML);

                console.log("original datamatrix");
                console.log(this.model.getDataMatrix());




            }

            private mouseDown(e):void {
                //console.log("mouse down at: ("+e.stageX+","+e.stageY+")");
                this.oldX = e.stageX;
                this.oldY = e.stageY;
                console.log(this.model.getElement(e.target.name));
                //console.log("cnctool options: "+$("#cnctTool").button("option","checked"));
                if (e.target.name.substr(0, 4) === "elmt") {
                    if (document.getElementById("cnctTool").checked) //check if connect tool is enabled
                    {
                        console.log("cnctTool enabled");
                        this.connectTo(e);
                    } else {
                        this.select(e);
                    }
                } else {
                    this.clearSelection();
                }
            }

            select(e: createjs.MouseEvent):void {
                //console.log("ctrl key: " + e.nativeEvent.ctrlKey);
                if (!e.nativeEvent.ctrlKey && this.selectedItems.indexOf(e.target) === -1) {
                    this.clearSelection();
                }
                //console.log("adding to selection");
                this.addToSelection(e.target);
            }

            private pressMove(e: createjs.MouseEvent):void {
                //console.log("press move");

                if (e.target.name === "hitarea") {
                    //console.log("panning");
                    this.stage.x += e.stageX - this.oldX;
                    this.stage.y += e.stageY - this.oldY;
                } else if (e.target.name.substr(0, 4) === "elmt") {
                    this.selectedItems.forEach(function (elmt) {
                        elmt.x += e.stageX - this.oldX;
                        elmt.y += e.stageY - this.oldY;
                        this.model.getElement(elmt.name).getConnections().forEach(function (c) {
                            this.updateConnection(c);
                        });
                    });

                }
                this.oldX = e.stageX;
                this.oldY = e.stageY;
                this.update = true;
            }

            private tick():void {
                if (this.update) {
                    this.update = false;
                    this.canvas.update();
                    this.valueFnCanvas.update();
                }
            }

            clear(): void {
                this.stage.removeAllChildren();
                this.update = true;
            }


            connectTo(evt: createjs.MouseEvent): void {
                var elmtIdent = evt.target.name;
                var connected = false;
                //console.log("attempting connection "+elmtIdent);
                this.getSelected().forEach(function (e) {
                    if (e.name.substr(0, 4) === "elmt" && e.name !== elmtIdent) {

                        var c = new Connection(this.model.getElement(e.name), this.model.getElement(elmtIdent), "");
                        //console.log("connection: " + c);
                        if (this.model.addConnection(c)) {
                            this.addConnectionToStage(c);
                            connected = true;
                        }
                    }
                });
                if (!connected) {
                    this.select(evt);
                }
                //this.select(elmtIdent);
            }

            addConnectionToStage(c: Connection): void {
                var line = new createjs.Graphics().beginStroke("#0f0f0f").mt(c.getInputElement().easelElmt.x, c.getInputElement().easelElmt.y).lt(c.getOutputElement().easelElmt.x, c.getOutputElement().easelElmt.y);
                var conn = new createjs.Shape(line);
                var arrow = new createjs.Graphics().beginFill("#0f0f0f").mt(-5, 0).lt(5, 5).lt(5, -5).cp();
                var arrowCont = new createjs.Shape(arrow);
                var cont = new createjs.Container();
                //console.log(arrowCont);
                arrowCont.x = ((c.getInputElement().easelElmt.x - c.getOutputElement().easelElmt.x) / 2) + c.getOutputElement().easelElmt.x;
                arrowCont.y = ((c.getInputElement().easelElmt.y - c.getOutputElement().easelElmt.y) / 2) + c.getOutputElement().easelElmt.y;
                arrowCont.rotation = (180 / Math.PI) * Math.atan((c.getInputElement().easelElmt.y - c.getOutputElement().easelElmt.y) / (c.getInputElement().easelElmt.x - c.getOutputElement().easelElmt.x));
                if (c.getInputElement().easelElmt.x < c.getOutputElement().easelElmt.x) {
                    arrowCont.rotation = 180 + arrowCont.rotation;
                }
                cont.hitArea = new createjs.Graphics().setStrokeStyle(10).beginStroke("#0f0f0f").mt(c.getInputElement().easelElmt.x, c.getInputElement().easelElmt.y).lt(c.getOutputElement().easelElmt.x, c.getOutputElement().easelElmt.y);
                cont.name = c.getID();
                //conn.addEventListener("pressmove", pressMove);
                //cont.addEventListener("mousedown", mouseDown);
                cont.addChild(arrowCont);
                cont.addChild(conn);


                this.stage.addChildAt(cont, 0);
                c.easelElmt = cont;
                this.update = true;

            }

            updateConnection(c: Connection) :void{
                //stage.removeChild(c.easelElmt);
                c.easelElmt.getChildAt(1).graphics.clear().beginStroke("#0f0f0f").mt(c.getInputElement().easelElmt.x, c.getInputElement().easelElmt.y).lt(c.getOutputElement().easelElmt.x, c.getOutputElement().easelElmt.y);
                c.easelElmt.getChildAt(0).x = ((c.getInputElement().easelElmt.x - c.getOutputElement().easelElmt.x) / 2) + c.getOutputElement().easelElmt.x;
                c.easelElmt.getChildAt(0).y = ((c.getInputElement().easelElmt.y - c.getOutputElement().easelElmt.y) / 2) + c.getOutputElement().easelElmt.y;
                c.easelElmt.getChildAt(0).rotation = (180 / Math.PI) * Math.atan((c.getInputElement().easelElmt.y - c.getOutputElement().easelElmt.y) / (c.getInputElement().easelElmt.x - c.getOutputElement().easelElmt.x));
                if (c.getInputElement().easelElmt.x < c.getOutputElement().easelElmt.x) {
                    c.easelElmt.getChildAt(0).rotation = 180 + c.easelElmt.getChildAt(0).rotation;
                }
                //stage.addChildAt(c.easelElmt, 0);
                //update = true;
            }


            addToSelection(e: createjs.Container):void {
                if (this.selectedItems.indexOf(e) === -1 && e.name.substr(0, 4) === "elmt") {
                    this.selectedItems.push(e);
                    var type = this.model.getElement(e.name).getType();
                    //console.log(e);
                    e.getChildAt(0).graphics.clear().f(this.elementColors[type][2]).s(this.elementColors[type][1]).rr(0, 0, 150, 30, 4);
                    this.update = true;
                }
            }

            setSelection(e: createjs.Container): void {
                this.clearSelection();
                this.addToSelection(e);
            }

            getSelected(): any[] {
                return this.selectedItems;
            }

        clearSelection ():void {
            console.log(this.selectedItems);
            this.selectedItems.forEach(function (e) {

                var type = this.model.getElement(e.name).getType();
                e.getChildAt(0).graphics.clear().f(this.elementColors[type][0]).s(this.elementColors[type][1]).rr(0, 0, 150, 30, 4);
            });
            this.selectedItems = [];
            this.update = true;
        };
        }

    }
}
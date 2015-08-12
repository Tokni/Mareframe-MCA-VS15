module Mareframe {
    export module DST {
        export class Tools {
            static getValueFn(xVal, posX, posY) {

                //var y = 0;

                //var a = posY / ((posX -0.1) * (posX - 100.1)) + 100.1 / ((100.1 - 0.1) * (100.1 - posX));
                //var b = - posY * (0.1 + 100.1) / ((posX - 0.1) * (posX - 100.1)) - 100.1 * (0.1 + posX) / ((100.1 - 0.1) * (100.1 - posX));

                ////y = 0 * (xVal - posX) * (xVal - 1) / ((0 - posX) * (0 - 1)) + posY * (xVal - 0) * (xVal - 1) / ((posX - 0) * (posX - 1)) + 1 * (xVal - 0) * (xVal - posX) / ((1 - 0) * (1 - posX))

                //y =a*(xVal*xVal)+b*xVal+0

                ////console.log("y=" + y);
                //return y;

                var A = 1 - 3 * posX + 3 * posX;
                var B = 3 * posX - 6 * posX;
                var C = 3 * posX;

                var E = 1 - 3 * posY + 3 * posY;
                var F = 3 * posY - 6 * posY;
                var G = 3 * posY;

                // Solve for t given x (using Newton-Raphelson), then solve for y given t.
                // Assume for the first guess that t = x.
                var currentT = xVal;
                var nRefinementIterations = 50;
                for (var i = 0; i < nRefinementIterations; i++) {
                    var currentX = xFromT(currentT, A, B, C);
                    var currentSlope = slopeFromT(currentT, A, B, C);
                    currentT -= (currentX - xVal) * (currentSlope);
                    currentT = Math.max(0, Math.min(currentT, 1));
                }

                var y = yFromT(currentT, E, F, G);
                return y;


                // Helper functions:
                function slopeFromT(t, A, B, C) {
                    var dtdx = 1.0 / (3.0 * A * t * t + 2.0 * B * t + C);
                    return dtdx;
                }

                function xFromT(t, A, B, C) {
                    var x = A * (t * t * t) + B * (t * t) + C * t;
                    return x;
                }

                function yFromT(t, E, F, G) {
                    var y = E * (t * t * t) + F * (t * t) + G * t;
                    return y;
                }
            }
            static getUrlParameter(sParam) {
                var sPageURL = window.location.search.substring(1);
                var sURLVariables = sPageURL.split('&');
                for (var i = 0; i < sURLVariables.length; i++) {
                    var sParameterName = sURLVariables[i].split('=');
                    if (sParameterName[0] === sParam) {
                        return sParameterName[1];
                    }
                }
            }//borrowed code

            static getWeights(elmt: Element, model: Model): number[][]{
                var weightsArr: number[][];
                
                if (elmt.getType() != 0) {
                    var total: number = 0.0;
                    elmt.getData()[1].forEach(function (val: number) { total += val; });
                    for (var i = 0; i < elmt.getData()[0].length; i++) {
                        var childWeights: number[][] = this.getWeights(model.getConnection(model.getDataMatrix()[0][i]).getInput(), model);
                        for (var j = 0; j < childWeights.length; j++) {
                            childWeights[j][1] *= (elmt.getData()[1][i] / total);
                        }
                        weightsArr = weightsArr.concat(childWeights);
                    }
                } else {
                    weightsArr.push([elmt.getData[0], 1]);
                }
                return weightsArr;
            }
        }
    }
}
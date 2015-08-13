/// <reference path="declarations\jquery.d.ts"/>
module Mareframe {
    export module DST {
        export class FileIO {
            private m_lastPath: string = "";
            saveModel(p_model):void {

            }
            quickSave(p_model): void {
                var json: string = JSON.stringify(p_model);
                localStorage.setItem("temp", json);
            }
            quickLoad(): any {
                var jsonMdl: any = JSON.parse(localStorage.getItem("temp"));
                if (jsonMdl) {
                    return jsonMdl;
                }
                else {
                    return null;
                }
            }
            loadModel(p_modelStringIdent: string, p_activeModelInstance: Model, p_updateGui: Function): any {
                console.log("attempting to load " + p_modelStringIdent);
                var path: string = "";
                switch (p_modelStringIdent) {
                    case "baltic":
                        path = "JSON/baltic.json";
                        break;
                    case "blackSea":
                        path = "JSON/blackSea.json";
                        break;
                    case "cadiz":
                        path = "JSON/cadiz.json";
                        break;
                    case "iceland":
                        path = "JSON/iceland.json";
                        break;
                    case "northSea":
                        path = "JSON/northSea.json";
                        break;
                    case "scotland":
                        path = "JSON/scotland.json";
                        //path = "../JSON/scotland.json";
                        break;
                    case "sicily":
                        path = "JSON/sicily.json";
                        break;
                    default:
                        break;
                }
                console.log("resulting path is: " + path);
                jQuery.getJSON(path, function (data) {

                    p_activeModelInstance.fromJSON(data);
                    p_updateGui();
                });
            }
        }
    }
}
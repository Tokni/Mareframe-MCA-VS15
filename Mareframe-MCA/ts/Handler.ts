module Mareframe {
    export module DST {
        export class Handler {
            private modelArr: Model[]=[];
            private activeModel: Model;
            private fileHandler: FileIO;
            private gui;
            constructor() {
                this.fileHandler = new FileIO();
                var loadModel:string = Tools.getUrlParameter('model');
                if (loadModel !== null) {
                    this.fileHandler.loadModel(loadModel);
                } else {
                this.addNewModel();
                }


            }

            getGUI(): any {
            }
            setGUI(any): void {
            }
            getFileIO(): any {
            }
            addNewModel(): Model {
                var mdl = new Model;
                this.setActiveModel(mdl);
                //this.getGUI().clear();
                return mdl;
            }
            setActiveModel(mdl: Model): void {
                this.activeModel = mdl;
            }
        }
    }
}
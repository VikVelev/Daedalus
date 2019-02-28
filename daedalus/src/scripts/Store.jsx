import { autorun, observable, action } from "mobx";

class Store {

    @observable loadedPointClouds = []  //All loaded models Point Cloud class
    @observable loadedModels = [];  //All loaded models THREE JS Geometry
    @observable availableModels = []; //All models that can be loaded
    @observable indexStack = {};    //Stack with indices directly coresponding to the arrays above, indicating and controlling loadability of models
    @observable currentlyChosenModel = 0; //index
    @observable state = "PREVIEW"
    @observable stateTable = {
        "GENERATION" : "PREVIEW",
        "PREVIEW" : "GENERATION"
    }

    @action previousModel() {

        if (this.loadedModels[this.currentlyChosenModel + 1] !== undefined){
            this.currentlyChosenModel++;
        } else {
            console.warn("NO SUCH MODEL WITH INDEX", this.currentlyChosenModel + 1);
        }

        if (this.currentlyChosenModel > 11) {
            this.currentlyChosenModel = 0;
        }
    }

    @action nextModel() {

        if (this.loadedModels[this.currentlyChosenModel - 1] !== undefined){
            this.currentlyChosenModel--;
        } else {
            console.warn("NO SUCH MODEL WITH INDEX", this.currentlyChosenModel + 1);
        }

        if(this.currentlyChosenModel < 0) {
            this.currentlyChosenModel = 11;
        }
    }

    @action addModel(pc) {
        //console.log(pc);
        this.availableModels.push(pc);
    }

    @action addLoaded(object, pc) {
        this.loadedModels.push(object);
        this.loadedPointClouds.push(pc);
    }

    @action stackPush(key, index) {
        this.indexStack = {
            ...this.indexStack,
            [key] : index,
        }
    }

    @observable loading = {
        is: false,
        progress: 0,
    }

    @observable menuFrame = {
        toggleTopHeader: true,
    }

    @observable options = {
        active: {},
        togglePreviewOptions: true,
        toggleGenerationOptions: true,
        type: "",
    }

    @observable profile = {
        open: false,
    }

    @observable settings = {
        open: false,
    }

    @observable viewport = {
        state: this.state
    }

    @action nextViewportState() {
        this.state = this.stateTable[this.state]
    }
}

let store = new Store();
autorun(() => console.log("An update occured:", store));

window.store = store;

export default store;
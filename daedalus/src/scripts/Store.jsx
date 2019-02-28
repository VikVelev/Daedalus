import { autorun, observable, action } from "mobx";

class Store {

    @observable loadedModels = [];
    @observable indexStack = {};
    @observable currentlyChosenModel = 0;
    @observable availableModels = []; 
    @observable state = "PREVIEW"
    @observable stateTable = {
        "GENERATION" : "PREVIEW",
        "PREVIEW" : "GENERATION"
    }

    @action previousModel() {
        this.currentlyChosenModel++;
        if (this.currentlyChosenModel > 11) {
            this.currentlyChosenModel = 0;
        }
    }

    @action nextModel() {
        this.currentlyChosenModel--;
        if(this.currentlyChosenModel < 0) {
            this.currentlyChosenModel = 11;
        }
    }

    @action addModel(pc) {
        //console.log(pc);
        this.loadedModels.push(pc);
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
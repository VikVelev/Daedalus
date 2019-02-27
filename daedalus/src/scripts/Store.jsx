import { autorun, observable, action } from "mobx";

class Store {

    @observable loadedModels = [];
    @observable indexStack = {};

    @action addModel(pc) {
        console.log(pc);
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
        //type: "GENERATION"
        type: "PREVIEW",
        table: {
            "GENERATION" : "PREVIEW",
            "PREVIEW" : "GENERATION"
        }
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
        generating: this.menuFrame.type === "GENERATION",
        preview: this.menuFrame.type === "PREVIEW",
    }

    @action nextViewportState() {
        this.menuFrame.type = this.menuFrame.table[this.menuFrame.type]
    }
}

let store = new Store();
autorun(() => console.log("An update occured:", store));

window.store = store;

export default store;
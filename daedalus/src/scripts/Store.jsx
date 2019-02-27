import { autorun, observable } from "mobx";

class Store {

    constructor(props) {
        
    }

    @observable loadedModels = [];

    @observable loading = {
        is: false,
        progress: 0,
    }

    @observable menuFrame = {
        toggleTopHeader: true,
        type: "GENERATION"
        //type: "PREVIEW", //Could be generating
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

}

let store = new Store();
autorun(() => console.log("An update occured:", store));

window.store = store;

export default store;
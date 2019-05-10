import { observable, action, computed } from "mobx";
import PointCloud from './viewport/utils/PointCloud.jsx'

class Store {

    @observable loadedPointClouds = []  //All loaded models Point Cloud class
    @observable loadedModels = [];  //All loaded models THREE JS Geometry
    @observable availableModels = []; //All models that can be loaded (basically a cache)
    //Stack with indices directly coresponding to the arrays above, indicating and controlling loadability of models
    @observable indexStack = {}; // This also allows me to refer to a certain index just by it's point cloud    
    @observable reverseIndexStack = {};
    @observable maxLength = 6; // Length of the currentlyLoadingBool should be the same as this one
    @observable currentlyLoadingBool = [
        false, false, false, false, false, false,/* false, false, false, false, false, false */
    ] //Array of booleans showing which is loading
    @observable currentlyLoading = [] //Array of PointClouds which are loading   
    @observable currentlyChosenModel = 0; //index //TODO THink of a way for the program to start without any models (eg. index === undefined or null)
    @observable currentQuery = "";
    @observable justStarted = true;
    @observable sceneRef = {};
    @observable chosenModelLink = ""
    @observable state = "PREVIEW"
    @observable awaitingResponse = false;
    @observable stateTable = {
        "GENERATION" : "PREVIEW",
        "PREVIEW" : "GENERATION"
    }

    @action doesExist(index) {
        return (this.currentlyLoading[index] || (this.loadedModels[index] !== undefined))
    }

    /* These methods are only modifying the state, and not actually loading */
    @action stateLoad(pointcloud) {
        this.currentlyLoading.push(pointcloud);
        this.currentlyLoadingBool[this.indexStack[pointcloud.filename]] = true;
    }

    /* These methods are only modifying the state, and not actually loading */
    @action stateLoaded(pointcloud) {
        for (let i = 0; i < this.currentlyLoading.length; i++) {
            if(pointcloud === this.currentlyLoading[i]) {
                this.currentlyLoading.splice(i, 1);
            }
        }

        this.currentlyLoadingBool[this.indexStack[pointcloud.filename]] = false;
    }

    @computed get isPrevious() {
        return (this.loadedModels[this.currentlyChosenModel + 1] !== undefined)
    }

    @computed get isNext() {
        return (this.loadedModels[this.currentlyChosenModel - 1] !== undefined)
    }

    @action previousModel = () => {

        if (this.loadedModels[this.currentlyChosenModel + 1] !== undefined){
            this.currentlyChosenModel++;
            this.viewport.rotatePrevious = true;
            this.chosenModelLink = this.loadedPointClouds[this.currentlyChosenModel].filename

        } else {
            console.warn("NO SUCH MODEL WITH INDEX", this.currentlyChosenModel + 1);
        }

        if (this.currentlyChosenModel > 11) {
            this.currentlyChosenModel = 0;
        }

    }

    @action nextModel = () => {
        
        if (this.loadedModels[this.currentlyChosenModel - 1] !== undefined){
            this.currentlyChosenModel--;
            this.viewport.rotateNext = true;
            this.chosenModelLink = this.loadedPointClouds[this.currentlyChosenModel].filename

        } else {
            console.warn("NO SUCH MODEL WITH INDEX", (this.currentlyChosenModel - 1 < 0) ? 11 + (this.currentlyChosenModel) : (this.currentlyChosenModel - 1));
        }

        if(this.currentlyChosenModel < 0) {
            this.currentlyChosenModel = 11;
        }
        
    }

    @action addModel(pc) {

        let add = true;

        for (let i = 0; i < this.availableModels.length; i++) {
            if (pc.hash === this.availableModels[i].hash) {
                add = false;
            }
        }

        if (add) {
            this.availableModels.push(pc);
        }
    }

    @action addLoaded(object, pc) {
        if(this.loadedModels.length === 0 ) {
            this.__chooseModelINIT(0, pc);
        }
        this.loadedModels.push(object);
        this.stateLoaded(pc);
        this.loadedPointClouds.push(pc);
    }

    @action stackPush(key, index) {
        this.indexStack = {
            ...this.indexStack,
            [key] : index,
        }

        this.reverseIndexStack = {
            ...this.reverseIndexStack,
            [index] : key,
        }
    }

    // this should be used only as initial settings
    @action __chooseModelINIT(index, pc) {
        this.currentlyChosenModel = index;
        this.chosenModelLink = pc.filename
    }

    @action sendGenerateRequest(object_class) {
        if (object_class === undefined) {
            object_class = "chair"
        }

        if (this.currentQuery !== "") {
            object_class = this.currentQuery;
        }
        
        let index = this.loadedModels.length
        this.currentlyLoadingBool[index] = true;

        let xhttp = new XMLHttpRequest();
        this.awaitingResponse = true;
        xhttp.onreadystatechange = (r) => {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                let response = JSON.parse(xhttp.responseText)
                this.loadModel("http://fortress88.servebeer.com:8000/static/" + response.generated, this.loadedModels.length);
            } else if(xhttp.status === 400 || xhttp.status === 500) {
                this.awaitingResponse = false;
            }
        };
        xhttp.open("POST", "http://fortress88.servebeer.com:8000/api/generate/?object_class=" + object_class, true)
        xhttp.send()
    }

    @action loadModel = (path, index) => {

        let pc = new PointCloud(this, path, this.sceneRef);

        this.addModel(pc);
		this.stackPush(path, index);
		
        pc.load();
    }

    @action removeModel = (scene, path, index) => {
        if (scene === null) {
            this.sceneRef.remove(this.loadedModels[index]);
            this.loadedModels.splice(index, 1);
            this.loadedPointClouds.splice(index, 1);
            //this.indexStack.splice(index, 1);
        }
    }

    @computed get chosenModel() {
        return this.loadedModels[this.currentlyChosenModel];
    }

    @computed get chosenModelPointCloud() {
        for (let i = 0; i < this.availableModels.length; i++) {
            if (this.availableModels[i].filename === this.reverseIndexStack[this.currentlyChosenModel]) {
                return this.availableModels[i]
            }
            
        }
        return null
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
        rightArrow: false,
        leftArrow: false,
        type: "",
    }

    @observable profile = {
        open: false,
    }

    @observable settings = {
        open: false,
    }

    @observable viewport = {
        rotateNext: false,
        rotatePrevious: false,        
        state: this.state
    }

    @action nextViewportState = () => {
        this.state = this.stateTable[this.state]
        this.loadedModels.forEach((el) => {
            if (el !== this.chosenModel) {
                el.visible = !el.visible;
            }
        })
    }
}

let store = new Store();

//REMOVE THIS BEFORE DEPOLOY
window.store = store;

export default store;
import { observable, action, computed } from "mobx";
import PointCloud from './viewport/utils/PointCloud.jsx'

class Store {

    @observable loadedPointClouds = []  //All loaded models Point Cloud class
    @observable loadedModels = [];  //All loaded models THREE JS Geometry
    @observable availableModels = []; //All models that can be loaded (basically a cache)
    //Stack with indices directly coresponding to the arrays above, indicating and controlling loadability of models
    @observable indexStack = {}; // This also allows me to refer to a certain index just by it's point cloud    
    @observable currentlyLoadingBool = [
        false, false, false, false, false, false, false, false, false, false, false, false
    ] //Array of booleans showing which is loading
    @observable currentlyLoading = [] //Array of PointClouds which are loading   
    @observable currentlyChosenModel = 0; //index //TODO THink of a way for the program to start without any models (eg. index === undefined or null)
    @observable sceneRef = {};
    @observable state = "PREVIEW"
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
        console.log(this.currentlyLoadingBool);
    }

    /* These methods are only modifying the state, and not actually loading */
    @action stateLoaded(pointcloud) {
        for (let i = 0; i < this.currentlyLoading.length; i++) {
            if(pointcloud === this.currentlyLoading[i]) {
                this.currentlyLoading.splice(i, 1);
            }
        }

        this.currentlyLoadingBool[this.indexStack[pointcloud.filename]] = false;
        console.log(this.currentlyLoadingBool);
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
        this.loadedModels.push(object);
        this.stateLoaded(pc);
        this.loadedPointClouds.push(pc);
    }

    @action stackPush(key, index) {
        this.indexStack = {
            ...this.indexStack,
            [key] : index,
        }
    }

    @action loadModel = (scene, path, index) => {
        if(scene !== null) {
            this.sceneRef = scene;
        }
        
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
        return this.loadedPointClouds[this.currentlyChosenModel];
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
        rotateNext: false,
        rotatePrevious: false,        
        state: this.state
    }

    @action nextViewportState = () => {
        this.state = this.stateTable[this.state]
    }
}

let store = new Store();

//REMOVE THIS BEFORE DEPOLOY
window.store = store;

export default store;
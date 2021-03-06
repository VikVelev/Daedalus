import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input, Icon, Dropdown } from 'semantic-ui-react';
import { autorun } from 'mobx';

const electron = window.require('electron').remote;
const fs = electron.require('fs');
const ipcRenderer = electron.ipcRenderer;

@observer
class GenerationMenu extends Component {

    state = {
        leftArrow: false,
        rightArrow: false,
        currentQuery: "chair",
    }

    modelOptions = [
        {
            key: "Airplane",
            text: "Airplane",
            value: "Airplane",
        },{
            key: "Car",
            text: "Car",
            value: "Car",
        },{
            key: "Chair",
            text: "Chair",
            value: "Chair",
        },
    ]

    getOptionsIndex = (key) => {
        for (let i = 0; i < this.modelOptions.length; i++) {
            if(this.modelOptions[i].key.toLowerCase() === key) {
                return i;
            }
        }
    }

    constructor(props) {
        super(props);

        autorun(() => {
            this.props.store.options.leftArrow = ((this.props.store.loadedModels[this.props.store.currentlyChosenModel + 1] !== undefined))
            this.props.store.options.rightArrow = ((this.props.store.loadedModels[this.props.store.currentlyChosenModel - 1] !== undefined))

            if(this.props.store.loadedModels.length === this.props.store.maxLength) {
                this.props.store.options.leftArrow = true;
                this.props.store.options.rightArrow = true;
            }
        })
    }
    
    loadModel = () => {
        if (this.props.store.currentQuery !== ""){
            this.props.store.sendGenerateRequest();
        }
    }
    
    onChangeQuery = (e, {value}) => {
        this.props.store.currentQuery = value.toLowerCase();
    }

    clearScene = () => {
        // TODO: Write a better clear scene method
        electron.getCurrentWindow().reload();
    }

    render() {
        return (
            <Transition visible={this.props.store.options.toggleGenerationOptions} 
                            animation='fly up' duration={500}>

                    <div className="generation_options menuframe" style={{ display: "flex !important" }}>
                        
                        <div className="choosing_arrows_container">
                            { this.props.store.options.rightArrow ? 
                            
                                <Icon size="huge" 
                                    onClick={this.props.store.nextModel} 
                                    className="menuframe generating_arrows gc_right"
                                    name="arrow right"/> :
                                null 
                            }

                            { this.props.store.options.leftArrow ? 
                                <Icon size="huge" 
                                    onClick={this.props.store.previousModel} 
                                    className="menuframe generating_arrows gc_left"
                                    name="arrow left"/> : 
                                null
                            }
                        </div> 

                        <div className="lower_generation_options">

                            <Button disabled={this.props.store.chosenModelPointCloud === undefined} color="violet" size="big" className="back_to_preview" onClick={this.props.store.nextViewportState}>
                                Preview
                            </Button>

                            <div className="generation_options_container">
                                <Dropdown
                                    additionPosition='top'
                                    upward
                                    placeholder='Select a model class'
                                    fluid
                                    selection
                                    onChange={this.onChangeQuery}
                                    options={this.modelOptions}
                                    value={
                                        this.getOptionsIndex(this.props.store.currentQuery) !== undefined ?
                                        this.modelOptions[this.getOptionsIndex(this.props.store.currentQuery)].value : ""
                                    }
                                    className="generate_input"
                                />
                                
                                <Button disabled={
                                                this.props.store.currentQuery === "" 
                                                || this.props.store.awaitingResponse 
                                                || this.props.store.loadedModels.length + 1 > this.props.store.maxLength
                                    } color="violet" size="huge" className="generate_button" onClick={this.loadModel}>
                                    {
                                        this.props.store.awaitingResponse ? "Generating..." : 
                                        this.props.store.loadedModels.length + 1 > this.props.store.maxLength ? "No space" : 
                                        "Generate"
                                    }
                                </Button>

                            </div>

                            <Button color="violet" size="huge" className="back_to_preview clear_scene" onClick={this.clearScene}>
                                Clear
                            </Button>
                        </div>
                    </div>

                </Transition>
        )
    }
}

export default GenerationMenu

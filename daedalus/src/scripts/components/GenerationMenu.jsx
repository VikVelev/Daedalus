import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input, Icon } from 'semantic-ui-react';
import { autorun } from 'mobx';
const electron = window.require('electron').remote;
const fs = electron.require('fs');
const ipcRenderer = electron.ipcRenderer;

@observer
class GenerationMenu extends Component {

    state = {
        leftArrow: false,
        rightArrow: false
    }

    constructor(props) {
        super(props);

        autorun(() => {
            this.props.store.options.leftArrow = (this.props.store.loadedModels[this.props.store.currentlyChosenModel + 1] !== undefined)
            this.props.store.options.rightArrow = (this.props.store.loadedModels[this.props.store.currentlyChosenModel - 1] !== undefined) 

            if(this.props.store.loadedModels.length === 12) {
                this.props.store.options.leftArrow = true;
                this.props.store.options.rightArrow = true;
            }
        })
    }
    
    loadModel = () => {
        this.props.store.sendGenerateRequest();
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
                                <Input label={{ icon: 'asterisk' }} 
                                    labelPosition='right corner' 
                                    placeholder='Chair'
                                    text="Chair"
                                    input="Chair"
                                    className="generate_input"
                                    />
                                <Button color="violet" size="huge" className="generate_button" onClick={this.loadModel}>
                                    Generate
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

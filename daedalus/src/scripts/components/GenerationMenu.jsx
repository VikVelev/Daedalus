import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input, Icon } from 'semantic-ui-react';
import { autorun } from 'mobx';

@observer
class GenerationMenu extends Component {

    state = {
        leftArrow: false,
        rightArrow: false
    }

    componentDidMount() {
      
        autorun(() => {

            this.setState({ leftArrow: (this.props.store.loadedModels[this.props.store.currentlyChosenModel + 1] !== undefined) });
            this.setState({ rightArrow: (this.props.store.loadedModels[this.props.store.currentlyChosenModel - 1] !== undefined) });
        })
    }
    

    loadModel = () => {
        this.props.store.loadModel(null, "models/test2.ply", 1);
    }

    render() {
        return (
            <Transition visible={this.props.store.options.toggleGenerationOptions} 
                            animation='fly up' duration={500}>

                    <div className="generation_options menuframe" style={{ display: "flex !important" }}>
                        
                        <div className="choosing_arrows_container">
                            { this.state.rightArrow ? 
                            
                                <Icon size="huge" 
                                    onClick={this.props.store.nextModel} 
                                    className="menuframe generating_arrows gc_right"
                                    name="arrow right"/> :
                                null 
                            }

                            { this.state.leftArrow ? 
                                <Icon size="huge" 
                                    onClick={this.props.store.previousModel} 
                                    className="menuframe generating_arrows gc_left"
                                    name="arrow left"/> : 
                                null
                            }
                        </div> 

                        <div className="lower_generation_options">

                            <Button active={this.props.store.chosenModelPointCloud !== undefined} color="violet" size="big" className="back_to_preview" onClick={this.props.store.nextViewportState}>
                                Preview
                            </Button>

                            <div className="generation_options_container">
                                <Input label={{ icon: 'asterisk' }} 
                                    labelPosition='right corner' 
                                    placeholder='Choose a model class' 
                                    className="generate_input"
                                    />
                                <Button color="violet" size="huge" className="generate_button" onClick={this.loadModel}>
                                    Generate
                                </Button>
                            </div>

                        </div>
                    </div>

                </Transition>
        )
    }
}

export default GenerationMenu

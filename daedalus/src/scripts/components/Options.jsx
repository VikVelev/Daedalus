import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input } from 'semantic-ui-react';

@observer
class Options extends Component {

    loadModel = () => {
        this.props.store.loadModel(null, "models/test2.ply", 2);
    }

    removeModel = () => {
        this.props.store.removeModel(null, "models/test2.ply", 2);
    }

    buttons = [
        { icon: "arrow left", text: "Previous", onClick: this.props.store.previousModel},
        { icon: "arrow right", text: "Next", onClick: this.props.store.nextModel},
        { icon: "add", text: "Add", onClick: this.loadModel},
        { icon: "close", text: "Remove", onClick: this.removeModel},
    ]

    toggleThis = () => {

        if(this.props.type === "PREVIEW") {
            this.setState({ togglePreviewOptions: !this.props.store.options.togglePreviewOptions });
        } else if (this.props.type === "GENERATION") {
            this.setState({ toggleGenerationOptions: !this.props.store.options.toggleGenerationOptions });
        }

    }   
    
    button = (button, key) => {
        return (
            <div className="options_button" key={key}>
                <Button 
                    primary
                    color="blue" 
                    size="massive"
                    icon={button.icon} 
                    label={button.text}
                    labelPosition="left"
                    className="options_button_child"
                    onClick={button.onClick}
                />
            </div>
        );
    }

    generate = () => {
        
    }

    render() {

        if (this.props.type === "PREVIEW") {

            return (
                <Transition visible={this.props.store.options.togglePreviewOptions} 
                    animation='fly up' duration={500}>
                    
                    <div className="menuframe preview_options" style={{ display: "flex !important" }}>
                        <div className="optionsContainer">
                            {
                                this.buttons.map((element, key) => {
                                    return this.button(element, key);
                                })
                            }
                        </div>
                    </div>

                </Transition>
            );
        } else if (this.props.type === "GENERATION") {

            return (
                <Transition visible={this.props.store.options.toggleGenerationOptions} 
                            animation='fly up' duration={500}>

                    <div className="generation_options menuframe" style={{ display: "flex !important" }}>
                        <div className="generation_options_container">
                            <Input label={{ icon: 'asterisk' }} 
                                labelPosition='right corner' 
                                placeholder='Choose a model class' 
                                className="generate_input"
                            />
                            <Button color="violet" size="huge" className="generate_button" onClick={this.generate}>
                                Generate
                            </Button>
                        </div>
                    </div>

                </Transition>
            );
        }
    }
}

export default Options

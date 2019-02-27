import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input } from 'semantic-ui-react';

@observer
class Options extends Component {
    
    store = this.props.store;

    state = {
        active: {},
        togglePreviewOptions: true,
        toggleGenerationOptions: true,
        type: "",
    }

    openConsole = () => {
        console.log("opened something");
    }

    buttons = [
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
    ]

    toggleThis = () => {

        if(this.props.type === "PREVIEW") {
            this.setState({ togglePreviewOptions: !this.state.togglePreviewOptions });
        } else if (this.props.type === "GENERATION") {
            this.setState({ toggleGenerationOptions: !this.state.toggleGenerationOptions });
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
        console.log(this.store);
        console.log("Generating");
    }

    render() {

        if (this.props.type === "PREVIEW") {

            return (
                <Transition visible={this.state.togglePreviewOptions} animation='fly up' 
                            duration={1000} transitionOnMount={true}>
                    
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
            console.log("what")

            return (
                <Transition visible={this.state.toggleGenerationOptions} animation='fly up' 
                    duration={1000} transitionOnMount={true}>

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

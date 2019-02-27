import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input } from 'semantic-ui-react';

@observer
class Options extends Component {

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

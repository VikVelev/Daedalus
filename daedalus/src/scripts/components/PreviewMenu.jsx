import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button } from 'semantic-ui-react';

@observer
class PreviewMenu extends Component {

    buttons = [
        { icon: "arrow left", text: "Previous", onClick: this.props.store.nextModel},
        { icon: "arrow right", text: "Next", onClick: this.props.store.previousModel},
        { icon: "add", text: "Add", onClick: this.loadModel},
        { icon: "close", text: "Remove", onClick: this.removeModel},
    ]

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


    render() {
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
    }
}

export default PreviewMenu

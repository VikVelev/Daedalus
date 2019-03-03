import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button } from 'semantic-ui-react';

@observer
class PreviewMenu extends Component {

    buttons = [
        { icon: "box", text: "Generate", onClick: this.props.store.nextViewportState},
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

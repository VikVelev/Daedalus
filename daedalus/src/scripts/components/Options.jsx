import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button } from 'semantic-ui-react';

@observer
class Options extends Component {
    
    state = {
        active: {},
        toggleOptions: false,
    }

    openConsole = () => {
        console.log("opened something");
    }

    buttons = [
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
        { icon: "assistive listening systems", text: "test", onClick: this.openConsole},
    ]

    toggleThis = () => this.setState({ toggleOptions: !this.state.toggleOptions })    
    
    componentDidMount() {
        this.toggleThis();
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



    render() {
        return (
            <Transition visible={this.state.toggleOptions} animation='fly up' 
                            duration={1000} transitionOnMount={true}>
                <div className="menuframe optionsframe" style={{ display: "flex !important" }}>
                    <div className="optionsContainer">
                        {
                            this.buttons.map((element, key) => {
                                return this.button(element, key);
                            })
                        }
                    </div>
                </div>
            </Transition>
       )
    }
}

export default Options

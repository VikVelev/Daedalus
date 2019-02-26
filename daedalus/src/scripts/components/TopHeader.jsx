import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Segment, Header, Transition, Icon } from 'semantic-ui-react';
import ProfileSlide from './ProfileSlide'
import SettingsSlide from './SettingsSlide'


@observer
class TopHeader extends Component {

    //open sliding menu (sm) profile

    state = {
        profileOpen: false,
        settingsOpen: false,
    }

    toggleSMProfile = () => {
        this.setState({ profileOpen : !this.state.profileOpen })
        //TOGGLE TRANSITION of the slides
    }

    toggleSMSettings = () => {
        console.log("Opening settings");
        this.setState({ settingsOpen : !this.state.settingsOpen })
        //TOGGLE TRANSITION of the slides
    }

    render() {
        return (
            <Transition visible={this.props.visible} animation='fly down' duration={500}>
                <div>
                    <Icon 
                        className={"menuframe top profile icon " + (!this.state.profileOpen ? "" : "hidden_button")}
                        name="user circle" size="huge" 
                        onClick={this.toggleSMProfile}
                    />
                    <ProfileSlide profileOpen={this.state.profileOpen} toggle={this.toggleSMProfile}/>


                    <Segment className={"menuframe top " + this.props.type.toLowerCase()} >
                        <Header>
                            {this.props.type}
                        </Header>
                    </Segment>

                    <Icon className={"menuframe top settings icon " + (!this.state.settingsOpen ? "" : "hidden_button")}
                        name="setting" size="huge" 
                        onClick={this.toggleSMSettings}
                    />
                    <SettingsSlide profileOpen={this.state.settingsOpen} toggle={this.toggleSMSettings}/>
                </div>
            </Transition>
        )
    }
}

export default TopHeader

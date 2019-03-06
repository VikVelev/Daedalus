import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Segment, Header, Transition, Icon } from 'semantic-ui-react';
import ProfileSlide from './ProfileSlide'
import SettingsSlide from './SettingsSlide'


@observer
class TopHeader extends Component {

    //open sliding menu (sm) profile

    toggleSMProfile = () => {
        this.props.store.profile.open = !this.props.store.profile.open;
    }

    toggleSMSettings = () => {
        this.props.store.settings.open = !this.props.store.settings.open;
    }

    render() {
        return (
            <Transition visible={this.props.visible} animation='fly down' duration={500}>
                <div>
                    <Icon 
                        className={"menuframe top profile icon " + (!this.props.store.profile.open ? "" : "hidden_button")}
                        name="user circle" size="huge"
                        onClick={this.toggleSMProfile}
                    />
                    <ProfileSlide store={this.props.store} 
                                  profileOpen={this.props.store.profile.open} 
                                  toggle={this.toggleSMProfile}/>

                    <Segment color="violet"
                             className={"menuframe top " + this.props.type.toLowerCase()} >
                        <Header>
                            {this.props.type}
                        </Header>
                    </Segment>

                    {/* <Icon className={"menuframe top settings icon " + (!this.props.store.settings.open ? "" : "hidden_button")}
                        name="setting" size="huge" 
                        onClick={this.toggleSMSettings}
                    />
                    <SettingsSlide store={this.props.store}
                                   profileOpen={this.props.store.settings.open} 
                                   toggle={this.toggleSMSettings}/> */}
                </div>
            </Transition>
        )
    }
}

export default TopHeader

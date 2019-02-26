import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Segment, Transition, Button } from 'semantic-ui-react';

@observer
class ProfileSlide extends Component {

    state = {
        open: false
    }

    toggleOff = () => {
        // TODO: MOBX change state of the other component from here        
    }

    render() {
        return (
            <Transition visible={this.props.profileOpen} animation='fly right' duration={500}>  
                <Segment className="menuframe profile_slide">
                    <Button onClick={this.props.toggle}>Back</Button>
                </Segment>
            </Transition>
        )
    }
}

export default ProfileSlide

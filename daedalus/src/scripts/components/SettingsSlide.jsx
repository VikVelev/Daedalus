import React, { Component } from 'react'
import { Transition, Segment, Button } from 'semantic-ui-react'

export class SettingsSlide extends Component {
  render() {
    return (
        <Transition visible={this.props.profileOpen} animation='fly left' duration={500}>  
            <Segment className="menuframe settings_slide">
                <Button onClick={this.props.toggle}>Back</Button>
            </Segment>
        </Transition>
    )
  }
}

export default SettingsSlide

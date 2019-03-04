import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Segment, Transition, Button, Card, Image} from 'semantic-ui-react';

@observer
class ProfileSlide extends Component {

    profile = () => {
        return(
            <Card className="profile_segment">
                <Image src='https://cnam.ca/wp-content/uploads/2018/06/default-profile.gif' />
                <Card.Content>
                    <Card.Meta>
                        <span className='date'>Joined today</span>
                    </Card.Meta>
                    <Card.Description>Coming Soon. Saving, sharing and viewing other people's generated models.</Card.Description>
                </Card.Content>
            </Card>
        )
    }

    onClick = (event) => {
        event.preventDefault();
    }

    render() {
        return (
            <Transition visible={this.props.profileOpen} animation='fly right' duration={500} >  
                <Segment className="menuframe profile_slide" onClick={this.onClick}>
                    <Button onClick={this.props.toggle}>Back</Button>
                    {this.profile()}
                </Segment>
            </Transition>
        )
    }
}

export default ProfileSlide

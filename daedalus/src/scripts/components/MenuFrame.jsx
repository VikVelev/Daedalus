import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Segment, Header, Transition, Button } from 'semantic-ui-react';
import Options from './Options';
import TopHeader from './TopHeader';

import "../../styles/MenuFrame.css"

@observer
class MenuFrame extends Component {

    state = {
        toggleTopHeader: true,
        type: "PREVIEW", //Could be generating
        //type: "GENERATION"
    }

    // componentDidMount() {
    //     this.toggleTopHeader();
    // }

    toggleTopHeader = () => this.setState({ toggleTopHeader: !this.state.toggleTopHeader })

    render() {
        return (
            <div className={this.props.className}>
                <TopHeader {...this.state}/>
                {/* .children === Viewport */}
                {this.props.children}

                <Options/>
            </div>
        )
    }
}

export default MenuFrame

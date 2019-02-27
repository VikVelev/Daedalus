import React, { Component } from 'react'
import { observer } from 'mobx-react'
import Options from './Options';
import TopHeader from './TopHeader';

import "../../styles/MenuFrame.css"

@observer
class MenuFrame extends Component {

    store = {
        ...this.props.store,
        menuFrame: {
            toggleTopHeader: true,
            type: "GENERATION"
            //type: "PREVIEW", //Could be generating
        }
    };

    toggleTopHeader = () => this.setState({ toggleTopHeader: !this.state.toggleTopHeader })

    render() {
        return (
            <div className={this.props.className}>
                <TopHeader store={this.store} {...this.store.menuFrame}/>
                {this.props.children} {/* .children === Viewport */}
                <Options store={this.store} type={this.store.menuFrame.type}/>
            </div>
        )
    }
}

export default MenuFrame

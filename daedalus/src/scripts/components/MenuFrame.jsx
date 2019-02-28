import React, { Component } from 'react'
import { observer } from 'mobx-react'
import Options from './Options';
import TopHeader from './TopHeader';

import "../../styles/MenuFrame.css"

@observer
class MenuFrame extends Component {

    toggleTopHeader = () => {
        this.props.store.menuFrame.toggleTopHeader = !this.props.store.menuFrame.toggleTopHeader;
    }

    render() {
        return (
            <div className={this.props.className}>
                <TopHeader store={this.props.store} {...this.props.store.menuFrame} type={this.props.store.state}/>
                {this.props.children} {/* .children === Viewport */}
                <Options store={this.props.store} type={this.props.store.state}/>
            </div>
        )
    }
}

export default MenuFrame

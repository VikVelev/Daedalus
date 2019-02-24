import React, { Component } from 'react'
import { observer } from 'mobx-react'

@observer
class MenuFrame extends Component {
    render() {
        return (
            <div className={this.props.className}>
                {/* .children === Viewport */}
                {this.props.children}
            </div>
        )
    }
}

export default MenuFrame

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Viewport from '../viewport/Viewport';
import MenuFrame from '../components/MenuFrame.jsx'

@observer
class Main extends Component {

    store = {
        ...this.props.store,
        loading: {
            isLoading: false,
            progress: 100,
        }
    }

    render() {
        return (
            <MenuFrame store={this.store} className="mainScreen">
                <Viewport store={this.props.store}/>
            </MenuFrame>
        );
    }
}

export default Main
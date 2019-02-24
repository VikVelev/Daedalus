import React, { Component } from 'react';
import { observer } from 'mobx-react';
import Viewport from '../viewport/Viewport';
import MenuFrame from '../components/MenuFrame.jsx'

@observer
class Main extends Component {

    mainState = {
		loading: {
			isLoading: false,
			progress: 100,
		},
	}

    render() {
        return (
            <MenuFrame className="mainScreen">
                <Viewport/>
            </MenuFrame>
        );
    }
}

export default Main
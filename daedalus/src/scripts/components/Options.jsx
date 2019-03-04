import React, { Component } from 'react'
import { observer } from 'mobx-react'
import GenerationMenu from './GenerationMenu';
import PreviewMenu from './PreviewMenu';

@observer
class Options extends Component {

    menuTable = {
        "PREVIEW" : <PreviewMenu store={this.props.store}/>,
        "GENERATION" : <GenerationMenu store={this.props.store}/>
    }
    
    render() {
        return this.menuTable[this.props.type]; 
    }
}

export default Options

import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Transition, Button, Input, Icon } from 'semantic-ui-react';
import GenerationMenu from './GenerationMenu';
import PreviewMenu from './PreviewMenu';

@observer
class Options extends Component {

    menuTable = {
        "PREVIEW" : <PreviewMenu store={this.props.store}/>,
        "GENERATION" : <GenerationMenu store={this.props.store}/>
    }
    
    // EXAMPLES OF USING REMOVE AND LOAD MODEL
    
    //     this.props.store.removeModel(null, "models/test2.ply", 2);

    render() {
        return this.menuTable[this.props.type]; 
    }
}

export default Options

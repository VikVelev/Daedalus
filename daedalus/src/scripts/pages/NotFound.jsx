import React, { Component } from 'react'
import { observer } from 'mobx-react';

@observer
class NotFound extends Component {
    render() {
        return (
            <div>
                Not Found
            </div>
        )
    }
}

export default NotFound
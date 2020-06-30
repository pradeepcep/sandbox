import React from 'react';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="toolbar">
        <button onClick={this.props.insertRect}>Rect</button>
      </div>
    )
  }
}

export default Toolbar;

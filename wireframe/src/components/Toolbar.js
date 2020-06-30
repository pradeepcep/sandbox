import React from 'react';

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="toolbar">
        <button onClick={this.props.insertRect}>Rect</button>
        <button onClick={this.props.insertCircle}>Circle</button>
      </div>
    )
  }
}

export default Toolbar;

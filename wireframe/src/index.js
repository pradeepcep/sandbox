import React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect } from 'react-konva';
import uuid from "uuid";

import Toolbar from './components/Toolbar';
import './index.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      selectedElIndex: null,
    };
    this.insertElement = this.insertElement.bind(this);
    this.handleSelectElement = this.handleSelectElement.bind(this);
  }

  insertElementDraft(elementType) {
    let elementProps = {
      elId: uuid.v4(),
      props: {
        x: Math.floor(window.innerWidth / 3),
        y: Math.floor(window.innerHeight / 3),
      },
      elType: elementType,
      el: null,
      ref: null,
      tx: null,
      txRef: null,
    };

    if (elementType === 'rect') {
      elementProps.props = Object.assign({}, elementProps.props, {
        width: 100,
        height: 100,
      });
    }

    return elementProps;
  }

  handleSelectElement(selectedElIndex) {
    console.log('select', selectedElIndex);
    this.setState({
      selectedElIndex: selectedElIndex,
    });
  }

  insertElement(elementType) {
    return () => {
      const elements = this.state.elements.slice();
      const elIndex = elements.length;
      let insertedElement = this.insertElementDraft(elementType);
      if (elementType === 'rect') {
        insertedElement.el = (
          <Rect
            {...insertedElement.props}
            ref={ref => (insertedElement.ref = ref)}
            onClick={() => this.handleSelectElement(elIndex)}
            onTap={() => this.handleSelectElement(elIndex)}
            isSelected={elIndex === this.state.selectedElIndex}
            draggable
            stroke="#aaaaaa"
            fill="#ffffff"
            strokeWidth={1}
          />);
      }
      this.setState({
        elements: elements.concat([insertedElement]),
      });
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <>
      <Toolbar
        insertRect={this.insertElement('rect')}
      />
      <Stage className='canvasRoot' width={window.innerWidth} height={window.innerHeight}>
        {this.state.elements.map((el, idx) => {
          return (
            <Layer key={'layer' + idx}>
            {el.el}
          </Layer>
          );
        })}
      </Stage>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

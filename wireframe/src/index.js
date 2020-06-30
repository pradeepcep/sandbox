import React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect, Transformer } from 'react-konva';
import uuid from "uuid";

import Toolbar from './components/Toolbar';
import './index.css';


class WireframeElement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elRef: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.setElRef = this.setElRef.bind(this);
  }

  setElRef(elRef) {
    this.setState({
      elRef: elRef,
    });
  }

  handleChange(txRef) {
    if (this.props.isSelected) {
      // we need to attach transformer manually
      txRef.setNode(this.state.elRef);
      txRef.getLayer().batchDraw();
    }
  }

  render() {
    const wireframeElementProps = {
      onClick: this.props.onSelect,
      onTap: this.props.onSelect,
      ref: this.setElRef,
      draggable: true,
      stroke: '#000000',
      fill: '#ffffff',
      strokeWidth: 0.5,
      onDragEnd: (e => {
        this.props.onChange({
          ...this.props.elProps,
          x: e.target.x(),
          y: e.target.y()
        });
      }),
      onTransformEnd: (e => {
        // transformer is changing scale of the node
        // and NOT its width or height
        // but in the store we have only width and height
        // to match the data better we will reset scale on transform end
        const node = this.state.elRef;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // we will reset it back
        node.scaleX(1);
        node.scaleY(1);
        this.props.onChange({
          ...this.props.elProps,
          x: node.x(),
          y: node.y(),
          // set minimal value
          width: Math.max(10, node.width() * scaleX),
          height: Math.max(node.height() * scaleY)
        });
      }),
    };
    const txProps = {
      ref: this.handleChange,
      boundBoxFunc: (oldBox, newBox) => {
        // limit resize
        if (newBox.width < 10 || newBox.height < 10) {
          return oldBox;
        }
        return newBox;
      },
    };

    if (this.props.elementType === 'rect') {
      return (
        <React.Fragment>
          <Rect
            {...this.props.elProps}
            {...wireframeElementProps}
          />
          {this.props.isSelected && (
            <Transformer
              {...txProps}
            />
          )}
        </React.Fragment>
      );
    }
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      selectedElId: null,
    };
    this.insertElement = this.insertElement.bind(this);
    this.handleSelectElement = this.handleSelectElement.bind(this);
    this.handleDeselect = this.handleDeselect.bind(this);
  }

  insertElementDraft(elementType) {
    let elementProps = {
      elId: uuid.v4(),
      props: {
        x: Math.floor(window.innerWidth / 3),
        y: Math.floor(window.innerHeight / 3),
      },
      elType: elementType,
    };

    if (elementType === 'rect') {
      elementProps.props = Object.assign({}, elementProps.props, {
        width: 100,
        height: 100,
      });
    }

    return elementProps;
  }

  handleSelectElement(selectedElId) {
    this.setState({
      selectedElId: selectedElId,
    });
  }

  handleChangeElement(changedElId, newProps) {
    const elements = this.state.elements.map((el, idx) => {
      if (el.elId === changedElId) {
        el.props = newProps;
      }
      return el;
    });
    this.setState({
      elements: elements,
    });
  }

  insertElement(elementType) {
    return () => {
      const elements = this.state.elements.slice();
      let insertedElement = this.insertElementDraft(elementType);
      this.setState({
        elements: elements.concat([insertedElement]),
      });
    }
  }

  handleDeselect(e) {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.handleSelectElement(null);
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
      <Stage
        className='canvasRoot'
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={this.handleDeselect}
        onTouchStart={this.handleDeselect}
      >
        <Layer>
          {this.state.elements.map((el, idx) => {
            return (
              <WireframeElement
                key={el.elId}
                elProps={el.props}
                elementType={el.elType}
                isSelected={el.elId === this.state.selectedElId}
                onSelect={() => this.handleSelectElement(el.elId)}
                onChange={(newProps) => this.handleChangeElement(el.elId, newProps)}
              />
            );
          })}
        </Layer>
      </Stage>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

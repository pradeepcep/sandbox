import React from 'react';
import ReactDOM from 'react-dom';
import { Stage, Layer, Rect, Circle, Transformer } from 'react-konva';
import uuid from "uuid";
import Firebase from 'firebase';

import Toolbar from './components/Toolbar';
import './components/Toolbar.css';
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
    if (this.props.isSelected && txRef && this.state.elRef) {
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

    let wireframeElement = null;

    if (this.props.elementType === 'rect') {
      wireframeElement = (
        <Rect
          {...wireframeElementProps}
          {...this.props.elProps}
        />
      );
    } else if (this.props.elementType === 'circle') {
      wireframeElement = (
        <Circle
          {...wireframeElementProps}
          {...this.props.elProps}
        />
      );
    }

    if (!wireframeElement) {
      return;
    }
    return (
      <React.Fragment>
        {wireframeElement}
        {this.props.isSelected && (
          <Transformer
            {...txProps}
          />
        )}
      </React.Fragment>
    );
  }
}


class App extends React.Component {
  constructor(props) {
    super(props);

    // Initialize Firebase
    var firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
    };
    Firebase.initializeApp(firebaseConfig);
    Firebase.analytics();
    window.fb = Firebase;
    window.u = uuid.v4;

    this.state = {
      elements: [],
      selectedElId: null,
      displayFillPicker: false,
      projectHash: window.location.hash.substring(1),
      isPageLoading: true,
    };

    this.insertElement = this.insertElement.bind(this);
    this.handleSelectElement = this.handleSelectElement.bind(this);
    this.handleDeselect = this.handleDeselect.bind(this);
    this.changeFill = this.changeFill.bind(this);
    this.handlePushElementDown = this.handlePushElementDown.bind(this);
    this.handlePushElementUp = this.handlePushElementUp.bind(this);
    this.handleDeleteElement = this.handleDeleteElement.bind(this);
    this.handleSaveProject = this.handleSaveProject.bind(this);
  }

  componentDidUpdate() {
    if (this.state.projectHash) {
      Firebase.database().ref('/projects/' + this.state.projectHash + '/').child('elements').set(this.state.elements);
    }
  }

  insertElementDraft(elementType) {
    let elementProps = {
      elId: uuid.v4(),

      props: {
        x: 55,
        y: 55,
      },
      elType: elementType,
    };

    if (elementType === 'rect') {
      elementProps.props = Object.assign({}, elementProps.props, {
        width: 100,
        height: 100,
      });
    } else if (elementType === 'circle') {
      elementProps.props = Object.assign({}, elementProps.props, {
        radius: 50,
      });
    }

    return elementProps;
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

  handleSelectElement(selectedElId) {
    this.setState({
      selectedElId: selectedElId,
      displayFillPicker: selectedElId && true,
    });
  }

  changeFill(fillColor) {
    const selectedElId = this.state.selectedElId;
    if (!selectedElId) return () => {};

    return () => {
      const elements = this.state.elements.map((el, idx) => {
        if (el.elId === selectedElId) {
          el.props = Object.assign({}, el.props, {fill: fillColor});
        }
        return el;
      });
      this.setState({
        elements: elements,
      });
    }
  }

  handlePushElementDown() {
    const selectedElId = this.state.selectedElId;
    if (!selectedElId) return () => {};

    let elements = this.state.elements.slice();
    const elementInStore = elements.find(i => i.elId === selectedElId);
    const elementStoreIndex = elements.indexOf(elementInStore);
    elements.splice(elementStoreIndex, 1);
    elements.unshift(elementInStore);
    this.setState({
      elements: elements,
    });
  }

  handlePushElementUp() {
    const selectedElId = this.state.selectedElId;
    if (!selectedElId) return () => {};

    let elements = this.state.elements.slice();
    const elementInStore = elements.find(i => i.elId === selectedElId);
    const elementStoreIndex = elements.indexOf(elementInStore);
    elements.splice(elementStoreIndex, 1);
    elements.push(elementInStore);
    this.setState({
      elements: elements,
    });
  }

  handleDeleteElement() {
    const selectedElId = this.state.selectedElId;
    if (!selectedElId) return () => {};

    let elements = this.state.elements.slice();
    const elementInStore = elements.find(i => i.elId === selectedElId);
    const elementStoreIndex = elements.indexOf(elementInStore);
    elements.splice(elementStoreIndex, 1);
    this.setState({
      elements: elements,
    });
    this.handleSelectElement(null);
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

  handleDeselect(e) {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      this.handleSelectElement(null);
    }
  }

  handleSaveProject() {
    let projectHash = this.state.projectHash;
    if (!projectHash) {
      projectHash = uuid.v4();
    }
    this.setState({
      projectHash
    });
    window.location.hash = projectHash;
  }

  componentDidMount() {
    if (this.state.projectHash) {
      Firebase.database().ref('/projects/' + this.state.projectHash + '/').on('value', snapshot => {
        let state = snapshot.val();
        console.log('loaded project', state);
        if (state) {
          this.setState({
            elements: state.elements,
            isPageLoading: false,
          });
        } else {
          window.location.hash = '';
          this.setState({
            projectHash: null,
            isPageLoading: false,
          });
        }
      });
    } else {
      this.setState({
        isPageLoading: false,
      });
    }
  }

  render() {
    console.log('state', this.state);
    return (
      <>
      <Toolbar
        insertRect={this.insertElement('rect')}
        insertCircle={this.insertElement('circle')}
        changeFill={this.changeFill}
        handlePushElementDown={this.handlePushElementDown}
        handlePushElementUp={this.handlePushElementUp}
        displayFillPicker={this.state.displayFillPicker}
        handleDeleteElement={this.handleDeleteElement}
        handleSaveProject={this.handleSaveProject}
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
      {this.state.isPageLoading && <div
        id="pageLoadingMessageWrapper"
      >
        <div id="pageLoadingMessage">Loading. Please wait..</div>
      </div>
      }
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

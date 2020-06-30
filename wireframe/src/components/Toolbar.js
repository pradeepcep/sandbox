import React from 'react';
import { FiSquare, FiCircle, FiDroplet, FiArrowDown, FiArrowUp } from "react-icons/fi";

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div id="toolbar">
        {this.props.displayFillPicker && <div
          id="stackOrderController" className="toolbarSectionWrapper"
        >
          <div className="toolbarSection">
            <div className="buttonWrapper" title="Bring to Bottom"><button onClick={this.props.handlePushElementDown}><FiArrowDown /></button></div>
            <div className="buttonWrapper" title="Bring to Top"><button onClick={this.props.handlePushElementUp}><FiArrowUp /></button></div>
          </div>
        </div>
        }

        <div id="drawTools" className="toolbarSectionWrapper">
          <div className="toolbarSection">
            <div className="buttonWrapper"><button onClick={this.props.insertRect}><FiSquare /></button></div>
            <div className="buttonWrapper"><button onClick={this.props.insertCircle}><FiCircle /></button></div>
          </div>
        </div>
        {this.props.displayFillPicker && <div
          id="fillPicker" className="toolbarSectionWrapper"
        >
          <div className="toolbarSectionIcon"><FiDroplet /></div>
          <div className="toolbarSection">
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#e34d44')} className="fillContrast"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#1e5b71')} className="fillSecondaryContrast"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#000000')} className="fillDarkest"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#333333')} className="fillDarker"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#777777')} className="fillDark"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#aaaaaa')} className="fillLight"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#cccccc')} className="fillLighter"></button></div>
            <div className="buttonWrapper"><button onClick={this.props.changeFill('#ffffff')} className="fillLightest"></button></div>
          </div>
        </div>
        }
      </div>
    )
  }
}

export default Toolbar;

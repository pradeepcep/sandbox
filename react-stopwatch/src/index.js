import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function ControlButtonStrip(props) {
  let buttons = [
    <button
      key='startPauseButton'
      className='ControlButton'
      onClick={props.onStartPauseClick}
    >
      {props.isRunning ? '⏸' : '▶️'}
    </button>
  ];
  if (!props.isRunning) {
    buttons.push(
      <button
        key='stopButton'
        className='ControlButton'
        onClick={props.onStopClick}
      >
        ⏹
      </button>
    );
  }
  return (
    <div className='ControlButtonsWrapper'>{buttons}</div>
  );
}

class StopWatch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRunning: false,
      seconds: 0,
    }
    this.handleStartPauseButtonClick = this.handleStartPauseButtonClick.bind(this);
    this.handleStopButtonClick = this.handleStopButtonClick.bind(this);
  }

  tick() {
    this.setState({
      seconds: this.state.seconds + 1
    });
  }

  handleStartPauseButtonClick() {
    const isRunning = this.state.isRunning;
    if (isRunning) {
      clearInterval(this.interval);
    } else {
      this.interval = setInterval(() => this.tick(), 999);
    }
    this.setState({
      isRunning: !isRunning,
    });
  }

  handleStopButtonClick() {
    clearInterval(this.interval);
    this.setState({
      isRunning: false,
      seconds: 0,
    });
  }

  render() {
    const minutes_number = Math.floor(this.state.seconds / 60);
    const seconds = ('' + (this.state.seconds - (minutes_number * 60))).padStart(2, '0');
    const minutes = ('' + minutes_number).padStart(2, '0');
    return (
      <>
        <span
          className='minutesDisplay'
        >
          {minutes}
        </span>
        <span
          className='dividerDisplay'
        >
          :
        </span>
        <span
          className='secondsDisplay'
        >
          {seconds}
        </span>
        <ControlButtonStrip
          isRunning={this.state.isRunning}
          onStartPauseClick={this.handleStartPauseButtonClick}
          onStopClick={this.handleStopButtonClick}
        />
      </>
    )
  }
}

ReactDOM.render(
  <StopWatch />,
  document.getElementById('root')
);

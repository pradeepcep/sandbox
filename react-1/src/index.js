import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className="square"
      onClick={props.onClick}
      style={props.style}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {

  renderSquare(i, highlightSquare) {
    if (highlightSquare) {
      return (
        <Square
          key={i}
          value={this.props.squares[i]}
          onClick={() => this.props.onSquareClick(i)}
          style={{backgroundColor: 'black', color: 'white'}}
        />
      );
    }
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onSquareClick(i)}
      />
    );
  }

  render() {
    let squareRows = [];
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        let squareNumber = (i * 3) + j;
        let highlightSquare = this.props.winningSquares && this.props.winningSquares.includes(squareNumber);
        row = row.concat([this.renderSquare(squareNumber, highlightSquare)]);
      }
      squareRows = squareRows.concat([<div key={'squareRow-' + i} className="board-row">{row}</div>]);
    }
    return <div>{squareRows}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        clickRow: null,
        clickCol: null,
      }],
      stepNumber: 0,
      sortAsc: true,
      xIsNext: true,
    };
    this.toggleSortOrder = this.toggleSortOrder.bind(this);
  }

  handleBoardSquareClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const squares = current.squares.slice();
    const gameResult = calculateWinner(current.squares);
    if ((gameResult && gameResult.winner) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        clickRow: Math.floor(i / 3) + 1,
        clickCol: (i % 3) + 1,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleSortOrder() {
    this.setState({
      sortAsc: !this.state.sortAsc,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const gameResult = calculateWinner(current.squares);
    let winner;
    let winningSquares;
    let status;
    if (gameResult) {
      winner = gameResult.winner;
      winningSquares = gameResult.winningSquares;
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    let moves = history.map((step, move) => {
      const buttonText = move ?
        'Go to move #' + move + ' (' + step.clickRow + ', ' + step.clickCol + ')' :
        'Go to Game Start';
      if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><b>{buttonText}</b></button>
          </li>
        );
      }
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{buttonText}</button>
        </li>
      );
    });

    let sortButtonText = 'Sort Desc';

    if (!this.state.sortAsc) {
      moves = moves.slice().reverse();
      sortButtonText = 'Sort Asc';
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            status={status}
            squares={current.squares}
            onSquareClick={(i) => this.handleBoardSquareClick(i)}
            winningSquares={winningSquares}
          />
        </div>
        <div className="game-info">
          <div><div className="status">{status}</div></div>
          <div className="status">
            Game History: <button onClick={this.toggleSortOrder}>{sortButtonText}</button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningSquares: [a, b, c],
      };
    }
  }
  if (!squares.includes(null)) {  // (No nulls + no winner) = Draw.
    return {
      winner: 'Draw',
      winningSquares: [],
    }
  }
  return null;
}

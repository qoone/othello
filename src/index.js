import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const cellTypes = ["empty", "black", "white"];

class Square extends React.Component {
  render() {
    return (
      <div className="square" style={{top: this.props.top, left: this.props.left}} onClick={this.props.onClick}>
        <div className="square-cell">
          <div className={"square-" + cellTypes[this.props.value]}></div>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {
  renderSquare(x, y, value) {
    return <Square key={x+","+y} top={y*32} left={x*32} value={value} onClick={() => this.props.onClick(x, y)} />;
  }

  render() {
    const boardDom = [];
    for (let y = 0; y < this.props.squares.length; y++) {
      for (let x = 0; x < this.props.squares[y].length; x++) {
        boardDom.push(this.renderSquare(x ,y, this.props.squares[y][x]));
      }
    }

    return (
      <div>{boardDom}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props){
    super(props);
    const currentTurn = 1;
    this.state = {
      squares: Array(8).fill(null),
      turn: currentTurn,
      status: cellTypes[currentTurn] + " move",
    }
    this.state.squares = this.state.squares.map(() => Array(8).fill(0));
    this.state.squares[3][3] = 1;
    this.state.squares[4][4] = 1;
    this.state.squares[3][4] = 2;
    this.state.squares[4][3] = 2;
  }

  handleClick(x, y){
    const currentSquares = this.state.squares.slice();
    const currentTurn = this.state.turn;

    const flipables = this.checkPuttable(x, y, currentTurn, currentSquares);
    if(flipables.length > 0) {
      //コマを置いて、周りをひっくり返す
      this.executeFlip(flipables, currentSquares, currentTurn);
      currentSquares[y][x] = currentTurn;
      
      const nextTurn = this.turnChange(currentSquares, currentTurn);
      
      if(nextTurn === 0){
        //Game End
        let status;
        const {winner, blackCount, whiteCount} = this.judgeWinner(currentSquares);
        if(winner === 0){
          status = "Draw (blackCount : " + blackCount + " whiteCount : " + whiteCount + ")";
        } else {
          status = cellTypes[winner] + " win (blackCount : " + blackCount + " whiteCount : " + whiteCount + ")";
        }

        this.setState({
          squares: currentSquares,
          turn: nextTurn,
          status: status,
        });
      } else {
        this.setState({
          squares: currentSquares,
          turn: nextTurn,
          status: cellTypes[nextTurn] + " move",
        });
      }
    }
  }

  judgeWinner(currentSquares) {
    let blackCount = 0
    let whiteCount = 0;
    currentSquares.forEach((row) => {
      row.forEach((cell) => {
        if(cell === 1){
          blackCount++;
        } else if(cell === 2) {
          whiteCount++;
        }
      });
    });
    let winner = 0;
    if(blackCount > whiteCount){
      winner = 1;
    } else if(whiteCount > blackCount){
      winner = 2;
    }
    return {winner:winner, blackCount:blackCount, whiteCount:whiteCount};
  }

  turnChange(currentSquares, currentTurn) {
    let nextTurn = 3 - currentTurn;
    
    //手番変更
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if(this.checkPuttable(x, y, nextTurn, currentSquares).length > 0){
          return nextTurn;
        }
      }
    }

    //パス
    nextTurn = currentTurn;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if(this.checkPuttable(x, y, nextTurn, currentSquares).length > 0){
          return nextTurn;
        }
      }
    }

    //ゲーム終了
    return 0;
  }

  executeFlip(flipables, currentSquares, currentTurn) {
    flipables.forEach(([y, x]) => {
      currentSquares[y][x] = currentTurn;
    });
  }

  checkPuttable(x, y, currentTurn, squares) {
    let flipables = [];
		if(squares[y][x] !== 0){
			return flipables;
		}
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if(dy === 0 && dx === 0) continue;
        let nx = x + dx;
        let ny = y + dy;
        const tmpFlipables = [];
        while (squares[ny] && squares[ny][nx] === (3 - currentTurn)){
          tmpFlipables.push([ny, nx]);
          nx += dx;
          ny += dy;
        }
        if(squares[ny] && squares[ny][nx] === currentTurn){
          flipables = flipables.concat(tmpFlipables);
        }
      }
    }
    return flipables;
  }

  render() {
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={this.state.squares} turn={this.state.turn} onClick={(x, y) => this.handleClick(x, y)}/>
        </div>
        <div className="game-info">
          <div>{this.state.status}</div>
          <ol>{/* TODO */}</ol>
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

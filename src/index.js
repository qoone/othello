import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const cellTypes = ["empty", "black", "white"];

class Square extends React.Component {
  render() {
    return (
      <div className="square" style={{top: this.props.top, left: this.props.left}} onClick={this.props.onClick}>
        <div className={this.props.hilight ? "square-cell-hilight" : "square-cell"}>
          <div className={"square-" + cellTypes[this.props.value]}></div>
        </div>
      </div>
    );
  }
}

class Board extends React.Component {
  renderSquare(x, y, value, hilight) {
    return <Square key={x+","+y} top={y*32} left={x*32} value={value} hilight={hilight} onClick={() => this.props.onClick(x, y)} />;
  }

  render() {
    const boardDom = [];
    for (let y = 0; y < this.props.squares.length; y++) {
      for (let x = 0; x < this.props.squares[y].length; x++) {
        boardDom.push(this.renderSquare(x, y, this.props.squares[y][x], this.props.hilightSquares[y][x]));
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

    const initTurn = 1;
    const initSquares = Array(8).fill(null).map(() => Array(8).fill(0));
    initSquares[3][3] = 1;
    initSquares[4][4] = 1;
    initSquares[3][4] = 2;
    initSquares[4][3] = 2;

    this.state = {
      current: {
        squares: initSquares,
        turn: initTurn,
        status: cellTypes[initTurn] + " move",
      },
      currentTurnIndex: 0,
      history: [initSquares],
    }
  }

  handleClick(x, y){
    const currentSquares = this.state.current.squares.slice().map((element) => element.slice());
    const currentTurn = this.state.current.turn;
    const currentTurnIndex = this.state.currentTurnIndex;
    const currentHistory = this.state.history;

    const flipables = this.checkPuttable(x, y, currentTurn, currentSquares);
    if(flipables.length > 0) {
      //コマを置いて、周りをひっくり返す
      this.executeFlip(flipables, currentSquares, currentTurn);
      currentSquares[y][x] = currentTurn;
      
      
      const nextTurn = this.turnChange(currentSquares, currentTurn);
      
      if(nextTurn === 0){
        //Game End
        let status;
        const [blackCount, whiteCount] = this.countSquares(currentSquares);
        const winner = this.judgeWinner(blackCount, whiteCount);
        if(winner === 0){
          status = "Draw";
        } else {
          status = cellTypes[winner] + " win";
        }

        const current = {
          squares: currentSquares,
          turn: nextTurn,
          status: status,
        };
        const history = currentHistory.slice(0, currentTurnIndex + 1);
        history.push(current);
        this.setState({
          current: current,
          currentTurnIndex: currentTurnIndex + 1,
          history: history,
        });
      } else {
        const current = {
          squares: currentSquares,
          turn: nextTurn,
          status: cellTypes[nextTurn] + " move",
        };
        const history = currentHistory.slice(0, currentTurnIndex + 1);
        history.push(current);
        this.setState({
          current: current,
          currentTurnIndex: currentTurnIndex + 1,
          history: history,
        });
      }
    }
  }

  moveTurnIndex(turnIndex) {
    const current = this.state.history[turnIndex];
    this.setState({
      current: current,
      currentTurnIndex: turnIndex,
    });
  }

  hilight(currentSquares, currentTurn) {
    const hilightSquares = Array(8).fill(null).map(() => Array(8).fill(false));
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if(this.checkPuttable(x, y, currentTurn, currentSquares).length > 0){
          hilightSquares[y][x] = true;
        }
      }
    }
    return hilightSquares;
  }

  countSquares(currentSquares) {
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
    return [blackCount, whiteCount];
  }

  judgeWinner(blackCount, whiteCount) {
    let winner = 0;
    if(blackCount > whiteCount){
      winner = 1;
    } else if(whiteCount > blackCount){
      winner = 2;
    }
    return winner;
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
    const [blackCount, whiteCount] = this.countSquares(this.state.current.squares);
    const hilightSquares = this.hilight(this.state.current.squares, this.state.current.turn);

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={this.state.current.squares} hilightSquares={hilightSquares} turn={this.state.current.turn} onClick={(x, y) => this.handleClick(x, y)}/>
        </div>
        <div className="game-info">
          <div className="status">{this.state.current.status}</div>
          <br />
          <div className="square-cell">
            <div className="square-black" />
          </div>
          <div className="cell-count">{blackCount}</div>
          <br />
          <div className="square-cell">
            <div className="square-white" />
          </div>
          <div className="cell-count">{whiteCount}</div>
          
          <div className="buttons">
            <button onClick={() => this.moveTurnIndex(0)} disabled={this.state.currentTurnIndex === 0}>初めに戻る</button><br />
            <button onClick={() => this.moveTurnIndex(this.state.currentTurnIndex - 1)} disabled={this.state.currentTurnIndex === 0}>一つ戻る</button><br />
            <button onClick={() => this.moveTurnIndex(this.state.currentTurnIndex + 1)} disabled={this.state.history.length - 1 <= this.state.currentTurnIndex}>一つ進む</button><br />
            <button onClick={() => this.moveTurnIndex(this.state.history.length - 1)} disabled={this.state.history.length - 1 <= this.state.currentTurnIndex}>最後に進む</button>
          </div>
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

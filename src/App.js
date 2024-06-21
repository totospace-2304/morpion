import { useState, useEffect } from "react";
import useWebSocket from "react-use-websocket";

function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      <span>{value}</span>
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = winner + " A GAGNE";
  } else {
    status = "PROCHAIN TOUR: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

export default function Game() {
  const [players, setPlayers] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  const { sendJsonMessage, lastJsonMessage } = useWebSocket(
    "wss://tools.jackdarius.fr/ws/morpion",
    {
      shouldReconnect: () => {
        return didUnmount.current === false;
      },
      retryOnError: true,
      reconnectAttempts: 60,
      reconnectInterval: 1000,
    }
  );

  const [squares, setSquares] = useState();
  const [currentMove, setCurrentMove] = useState();
  const xIsNext = currentMove % 2 === 0;

  useEffect(() => {
    async function _fetch() {
      const response = await fetch(
        "https://tools.jackdarius.fr/toto/morpion/api/game"
      );
      const game = await response.json();
      setSquares(game.squares);
      setCurrentMove(game.currentMove);
    }
    _fetch();
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      setSquares(lastJsonMessage.squares);
      setCurrentMove(lastJsonMessage.currentMove);
    }
  }, [lastJsonMessage]);

  // const jO = players?.joueurO;
  // const jX = players?.joueurX;

  // async function inscriptionX() {
  //   let X = await fetch("http://localhost:9000/inscription");
  //   let connect = await X.json();
  //   setPlayers({ ...players, joueurX: connect });

  //   console.log(players);
  // }

  // async function inscriptionO() {
  //   let O = await fetch("http://localhost:9000/inscription");
  //   let connect1 = O.json;
  //   setPlayers({ ...players, joueurO: connect1 });

  //   console.log(players);
  // }

  async function handlePlay(nextSquares) {
    sendJsonMessage({ nextSquares });
  }

  async function reset() {
    sendJsonMessage({ action: "reset" });
  }

  if (squares === undefined || currentMove === undefined) {
    return "loading";
  }

  return (
    <>
      <div className="h1">
        <h1>MORPION</h1>
      </div>

      {/* {currentPlayer === null ? (
        <div className="buttons">
          {players.joueurX === null ? (
            <button className="X" onClick={inscriptionX}>
              Je suis X
            </button>
          ) : (
            <div>X Déja connecté</div>
          )}
          {players.joueurO === null ? (
            <button className="O" onClick={inscriptionO}>
              Je suis O
            </button>
          ) : (
            <div>O Déja connecté</div>
          )}
        </div>
      ) : ( */}
      <>
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={squares} onPlay={handlePlay} />
        </div>
        <div>
          <button onClick={reset}>Recommencer</button>
        </div>
      </>
      {/* )} */}
    </>
  );
}

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
      return squares[a];
    }
  }
  return null;
}

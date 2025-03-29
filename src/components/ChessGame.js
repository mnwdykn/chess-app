// チェス対戦画面コンポーネント
// ・チェスボードの表示
// ・ユーザーの操作処理
// ・Stockfishとの通信（bestmove）
// ・ゲーム終了処理（チェックメイト・ドロー）

import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import initStockfish from "../utils/stockfishWorker";

export default function ChessGame({ skillLevel, onRestart }) {
  const [game, setGame] = useState(new Chess());
  const engineRef = useRef(null);
  const [highlightSquares, setHighlightSquares] = useState({});
  const [isGameOver, setIsGameOver] = useState(false);
  const [resultText, setResultText] = useState("");

  useEffect(() => {
    const worker = initStockfish(skillLevel, handleEngineMessage);
    engineRef.current = worker;
    return () => worker.terminate();
  }, [skillLevel]);

  const handleEngineMessage = (data) => {
    if (isGameOver) return;
    if (data.startsWith("bestmove")) {
      const move = data.split(" ")[1];
      if (move === "0000" || move === "(none)") return;

      const from = move.slice(0, 2);
      const to = move.slice(2, 4);

      setGame((prevGame) => {
        const gameCopy = new Chess(prevGame.fen());
        const isLegal = gameCopy
          .moves({ verbose: true })
          .some((m) => m.from === from && m.to === to);
        if (!isLegal) return prevGame;

        const piece = gameCopy.get(from);
        const isPromotion =
          piece?.type === "p" &&
          ((piece.color === "w" && to[1] === "8") ||
            (piece.color === "b" && to[1] === "1"));

        gameCopy.move({
          from,
          to,
          ...(isPromotion ? { promotion: "q" } : {}),
        });

        if (gameCopy.isGameOver()) handleGameOver(gameCopy);
        return gameCopy;
      });
    } else {
      console.log("Engine:", data);
    }
  };

  const handleGameOver = (gameCopy) => {
    engineRef.current?.terminate();
    setIsGameOver(true);

    if (gameCopy.isCheckmate()) {
      setResultText("チェックメイト！ゲーム終了");
    } else if (gameCopy.isDraw()) {
      setResultText("ドローです！");
    } else {
      setResultText("ゲーム終了");
    }
  };

  const handleDrop = (sourceSquare, targetSquare) => {
    if (isGameOver) return false;

    const gameCopy = new Chess(game.fen());
    const piece = gameCopy.get(sourceSquare);
    const isPromotion =
      piece?.type === "p" &&
      ((piece.color === "w" && targetSquare[1] === "8") ||
        (piece.color === "b" && targetSquare[1] === "1"));

    const move = {
      from: sourceSquare,
      to: targetSquare,
      ...(isPromotion ? { promotion: "q" } : {}),
    };

    const legalMoves = gameCopy.moves({ verbose: true });
    const isLegal = legalMoves.some(
      (m) => m.from === move.from && m.to === move.to
    );
    if (!isLegal) return false;

    const result = gameCopy.move(move);
    if (result) {
      setHighlightSquares({});
      setGame(gameCopy);

      if (gameCopy.isGameOver()) {
        handleGameOver(gameCopy);
      } else {
        engineRef.current?.postMessage(`position fen ${gameCopy.fen()}`);
        engineRef.current?.postMessage("go depth 12");
      }
    }

    return result !== null;
  };

  const onPieceDragBegin = (piece, sourceSquare) => {
    if (isGameOver) return;

    const gameCopy = new Chess(game.fen());
    const moves = gameCopy.moves({ square: sourceSquare, verbose: true });

    const newHighlights = {};
    moves.forEach((move) => {
      newHighlights[move.to] = {
        background: "radial-gradient(circle, #fffa90 36%, transparent 40%)",
        borderRadius: "50%",
      };
    });
    newHighlights[sourceSquare] = {
      background: "rgba(255, 255, 0, 0.4)",
    };

    setHighlightSquares(newHighlights);
  };

  return (
    <div>
      {isGameOver && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: "red", fontWeight: "bold", fontSize: "1.1rem" }}>
            {resultText}
          </div>
          <button onClick={onRestart} style={{ marginTop: 8 }}>
            もう一度プレイする
          </button>
        </div>
      )}

      {!isGameOver && game.inCheck() && (
        <div style={{ color: "red", marginBottom: 10, fontWeight: "bold" }}>
          チェック中です！
        </div>
      )}

      <Chessboard
        position={game.fen()}
        onPieceDrop={handleDrop}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={() => setHighlightSquares({})}
        customSquareStyles={highlightSquares}
        boardWidth={500}
      />
    </div>
  );
}

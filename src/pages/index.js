// ページコンポーネント
// ゲーム開始前：レベル選択画面を表示
// ゲーム開始後：チェスゲーム画面に切り替える

import { useState } from "react";
import Head from "next/head";
import ChessGame from "../components/ChessGame";
import LevelSelector from "../components/LevelSelector";

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <>
      <Head>
        <title>チェス vs Stockfish</title>
      </Head>

      <main style={{ padding: 20 }}>
        <h1>チェス vs Stockfish</h1>

        {!gameStarted ? (
          <LevelSelector
            selectedLevel={selectedLevel}
            onChange={setSelectedLevel}
            onStart={() => setGameStarted(true)}
          />
        ) : (
          <ChessGame
            skillLevel={selectedLevel}
            onRestart={() => setGameStarted(false)}
          />
        )}
      </main>
    </>
  );
}

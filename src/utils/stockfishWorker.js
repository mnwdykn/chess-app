// Stockfishエンジン初期化用ユーティリティ
// - Web Workerで stockfish.js を起動
// - UCIコマンドでスキルレベルを設定
// - メッセージ受信時に onMessage を呼び出す

export default function initStockfish(skillLevel, onMessage) {
  const worker = new Worker("/stockfish.js");

  worker.postMessage("uci");

  worker.onmessage = (e) => {
    const { data } = e;
    if (data === "uciok") {
      worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      worker.postMessage("isready");
    } else {
      onMessage(data);
    }
  };

  return worker;
}

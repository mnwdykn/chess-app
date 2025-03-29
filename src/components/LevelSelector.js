// レベル選択コンポーネント
// ユーザーが0〜20のスキルレベルを選び、ゲームを開始できるUI

import React from "react";

export default function LevelSelector({ selectedLevel, onChange, onStart }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label>
        レベル選択（0〜20）：
        <select
          value={selectedLevel}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ marginLeft: 8 }}
        >
          {Array.from({ length: 21 }, (_, i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button onClick={onStart} style={{ marginTop: 12 }}>
        ゲーム開始
      </button>
    </div>
  );
}

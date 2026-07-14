function drawLines(data) {

    // タイムラインの線を描画するための親コンテナを取得
    // 「.timeline-lines」は線専用のレイヤーとして使われる
    const container = document.querySelector(".timeline-lines");
    if (!container) return;

    // 既存の線をすべて削除して再描画の準備を行う
    container.innerHTML = "";

    // 画面上に表示されているイベントカード要素をすべて取得
    const cards = document.querySelectorAll(".event-card");

    // 同じ色ごとにポイントをまとめるためのマップ
    // key: 色、value: 座標配列
    const colorMap = {};

    // 各カードを走査し、対応する座標位置を取得
    cards.forEach((card, i) => {

        // data配列から対応する色を取得
        // 各カードとdataを同じ順序で対応させている設計
        const color = data[i]?.color;
        if (!color) return;

        // カードの画面上の位置とサイズを取得
        const rect = card.getBoundingClientRect();
        const parentRect = container.getBoundingClientRect();

        // 線を描く基準位置（x, y）を算出
        // 左端に少し余白を加え、縦方向はカード中央を取る
        const x = rect.left - parentRect.left + 10;
        const y = rect.top - parentRect.top + rect.height / 2;

        // 色ごとに配列を初期化
        if (!colorMap[color]) {
            colorMap[color] = [];
        }

        // 該当色の座標情報として追加
        colorMap[color].push({ x, y });
    });

    // 色ごとにまとめた座標群を処理
    Object.entries(colorMap).forEach(([color, points], colorIndex) => {

        // 同じ色のポイントを順番に結んで線を引く
        for (let i = 1; i < points.length; i++) {

            const prev = points[i - 1];
            const curr = points[i];

            // 線要素を動的に生成
            const line = document.createElement("div");
            line.className = "timeline-line";

            // 複数色が重なったときに少しずらして見やすくするためのオフセット
            const offset = colorIndex * -15;

            // CSSカスタムプロパティとしてオフセットを設定
            // スタイル側で横方向のずれに利用される想定
            line.style.setProperty("--offset", offset + "px");

            // 線の開始位置（縦方向）
            line.style.top = prev.y + "px";

            // 線の長さ（次のポイントとの差）
            line.style.height = (curr.y - prev.y) + "px";

            // 色設定（カードと同じ色で統一）
            line.style.background = color;

            // 不透明度（アニメーションなどに応用可能）
            line.style.opacity = 1;

            // 親コンテナに追加して描画
            container.appendChild(line);
        }
    });
}

// 他ファイルから呼び出せるようにグローバルに公開
window.drawLines = drawLines;
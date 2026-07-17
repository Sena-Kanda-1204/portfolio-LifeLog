/* =========================/* 通常トースト
========================= */

// シンプルな通知メッセージを一定時間表示する関数
function showToast(message) {

    // トースト表示用の要素を取得
    const toast = document.getElementById("toast");
    if (!toast) return;

    // メッセージ内容をテキストとしてセット
    toast.textContent = message;

    // 表示用クラスを付与して画面に表示
    toast.classList.add("show");

    // 一定時間後に自動で非表示にする
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}


/* =========================
   Undo付きトースト
========================= */

// 削除などの操作に対して「元に戻す」ボタン付きのトーストを表示する関数
function showUndoToast(message) {

    // トースト要素を取得
    const toast = document.getElementById("toast");
    if (!toast) return;

    // HTMLとしてメッセージとボタンを構築
    // innerHTMLを使うことでボタン要素を含めて描画している
    toast.innerHTML = `
        <span>${message}</span>
        <button class="undo-btn" onclick="undoDelete()">元に戻す</button>
    `;

    // 表示用クラスを付与
    toast.classList.add("show");

    // 一定時間後に非表示にし、内容も初期化する
    setTimeout(() => {
        toast.classList.remove("show");
        toast.innerHTML = "";
    }, 5000);
}


/* =========================
   グローバル
========================= */

// HTML側から呼び出せるように関数をグローバルに公開している
// これによりonclickから直接トースト表示ができる
window.showToast = showToast;
window.showUndoToast = showUndoToast;
// DOM読み込み完了後に初期化処理を実行
document.addEventListener("DOMContentLoaded", init);

// 詳細ページの初期化処理
async function init() {

    // データの初期化
    await DataManager.init();

    // URLパラメータからイベントIDを取得
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    // 該当イベントを取得
    const event = DataManager.find(id);
    if (!event) return;

    // タイトル・日付・場所などの基本情報を表示
    document.getElementById("title").textContent = `${event.title}`;
    document.getElementById("date").textContent = event.date || "";
    document.getElementById("location").textContent = event.location ? `📍 ${event.location}` : "";

    document.getElementById("description").textContent = event.description;

    // 感情ごとに表示スタイルを切り替えるためのクラス定義
    const classMap = {
        成長: "growth",
        挑戦: "challenge",
        達成感: "happy",
        楽しい: "fun",
        安心: "relax",
        不安: "anxiety",
        緊張: "tension"
    };

    // 感情タグをHTMLとして構築
    const emotions = (event.emotions || [])
        .map(e => `
            <span class="tag ${classMap[e] || "default-tag"}">
                ${e}
            </span>
        `)
        .join("");

    // DOMに反映
    document.getElementById("emotions").innerHTML = emotions;

    // 添付ファイルが画像の場合のみ表示
    const file = event.file;
    if (file && file.type?.startsWith("image/")) {

        document.getElementById("fileView").innerHTML = `
            <img src="${file.data}"
                class="view-image"
                onclick="openImageModal('${file.data}', 'image')">
        `;
    }

    // 振り返り情報を取得し表示
    const r = event.reflection || {};

    document.getElementById("reflection").innerHTML = `
        <h3>振り返り</h3>
        <p>行動：${r.action || ""}</p>
        <p>感情：${r.feeling || ""}</p>
        <p>理由：${r.reason || ""}</p>
        <p>学び：${r.learning || ""}</p>
        <p>影響：${r.impact || ""}</p>
    `;

    // 就活関連データを表示
    const j = event.jobData || {};

    document.getElementById("job").innerHTML = `
        <h3>ガクチカ</h3>
        <p>課題：${j.problem || ""}</p>
        <p>行動：${j.action || ""}</p>
        <p>結果：${j.result || ""}</p>
    `;

    // 性格・価値観データを表示
    const p = event.personality || {};

    document.getElementById("personality").innerHTML = `
        <h3>価値観・性格</h3>    
        <p>強み：${p.strength || ""}</p>
        <p>課題：${p.weakness || ""}</p>
    `;

    // 編集や削除で利用するために現在表示中のIDを保持
    window.currentViewId = id;

    // 背景色をイベントごとに反映
    document.body.style.background =
        event.bgColor || "#ffffff";
}


// 詳細ページからイベント削除を行う関数
function deleteFromView() {

    if (!window.currentViewId) return;

    // 確認ダイアログ
    if (!confirm("このイベントを削除しますか？")) return;

    // データ削除
    DataManager.delete(window.currentViewId);

    // 一覧ページへ遷移
    window.location.href = "../index.html";
}

// グローバル公開
window.deleteFromView = deleteFromView;


// 前のページに戻る
function goBack() {
    window.history.back();
}


// 編集モーダルを開く処理
function openEditFromView() {

    if (!window.currentViewId) return;

    openEdit(window.currentViewId);
}

// グローバル公開
window.openEditFromView = openEditFromView;
window.goBack = goBack;


// FABの表示制御用スクロール位置
let lastScroll = 0;

// スクロール方向によってFABの表示・非表示を切り替える
window.addEventListener("scroll", () => {

    const current = window.scrollY;
    const fab = document.getElementById("fabGroup");

    if (!fab) return;

    // 下方向スクロール時は非表示
    if (current > lastScroll) {
        fab.style.transform = "translateY(100px)";
        fab.style.opacity = "0";
    }
    // 上方向スクロール時は表示
    else {
        fab.style.transform = "translateY(0)";
        fab.style.opacity = "1";
    }

    lastScroll = current;
});

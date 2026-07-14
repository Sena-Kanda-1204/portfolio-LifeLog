// ソート順を管理するグローバル変数
window.sortOrder = "asc";

/* =========================
   初期化
========================= */

// ページ読み込み時に実行される初期処理
async function init() {

    // データの初期化（ローカルストレージから読み込み）
    await DataManager.init();

    // 全イベントデータをグローバルに保持
    window.eventsData = DataManager.getAll();

    // 初回描画
    rerender(); 

    // ソートボタンの表示を更新
    updateSortFab();
}


// タイムラインを再描画する関数
function rerender() {

    const allData = DataManager.getAll();

    // サンプルデータ以外のユーザーデータが存在するか判定
    const hasUserData =
        allData.some(e => e.isSample === false);

    // ユーザーデータがある場合はそれのみ表示、無ければ全体表示
    const data = hasUserData
        ? allData.filter(e => e.isSample === false)
        : allData;

    // 日付でソート
    // sortOrderによって昇順・降順を切り替える
    const sorted = data
        .slice()
        .sort((a, b) => {

            const diff =
                new Date(a.date) - new Date(b.date);

            return window.sortOrder === "asc"
                ? diff
                : -diff;
        });

    // タイムライン描画
    renderTimeline(sorted);

    // 検索状態が存在する場合はチップ表示を更新
    updateSearchStatus?.();
}


/* =========================
   ソート＋描画
========================= */

// 単純な昇順ソートで描画する補助関数
function sortAndRender() {

    const data = DataManager.getAll()
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    renderTimeline(data);
}


// ソート順を切り替える関数
function toggleSortOrder() {

    // 昇順と降順を切り替え
    window.sortOrder =
        window.sortOrder === "asc"
        ? "desc"
        : "asc";

    // FABボタンの表示を更新
    updateSortFab();

    // 検索中であれば検索結果を再適用、そうでなければ通常再描画
    if (window.searchOptions) {
        applySearchFromState();
    } else {
        rerender();
    }
}

// ソート状態に応じてFABの表示内容を変更する
function updateSortFab() {

    const fab = document.getElementById("sortFab");
    if (!fab) return;

    // 昇順なら下向き三角、降順なら上向き三角を表示
    fab.textContent =
        window.sortOrder === "asc"
        ? "▽"
        : "△";
}


/* =========================
   起動
========================= */

// ページ読み込み完了時に初期化処理を呼び出す
document.addEventListener("DOMContentLoaded", init);


/* =========================
   FABスクロール制御
========================= */

// 前回のスクロール位置を保持
let lastScrollY = 0;

// スクロール方向によってFABの表示を制御
window.addEventListener("scroll", () => {

    const fabs = document.querySelectorAll(".fab-button");

    if (window.scrollY > lastScrollY) {
        // 下方向スクロール時は非表示にする
        fabs.forEach(f => f.style.opacity = "0");
    } else {
        // 上方向スクロール時は表示する
        fabs.forEach(f => f.style.opacity = "1");
    }

    // 現在のスクロール位置を保存
    lastScrollY = window.scrollY;
});

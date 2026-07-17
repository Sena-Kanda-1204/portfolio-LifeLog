/* =========================
   検索
========================= */

// 検索条件を保持するグローバル変数
// nullの場合は検索未実行状態を表す
window.searchOptions = null;

/* =========================
   検索実行
========================= */

// 検索モーダル内の入力値を取得し、検索条件を構築して実行する関数
function executeSearch() {

    // キーワード1（空白除去）
    const keyword1 = document.getElementById("keyword1")?.value.trim();

    // キーワード2（空白除去）
    const keyword2 = document.getElementById("keyword2")?.value.trim();

    // キーワード検索モード（ANDまたはOR）
    const keywordMode = document.getElementById("keywordMode")?.value;

    // 日付範囲（開始・終了）
    const fromDate = document.getElementById("fromDate")?.value;
    const toDate = document.getElementById("toDate")?.value;

    // お気に入りのみかどうか
    const favOnly = document.getElementById("favOnly")?.checked;

    // 選択されている感情タグを配列として取得
    const emotions = Array.from(
        document.querySelectorAll(".emotion-form input:checked")
    ).map(cb => cb.value);

    // 選択された背景色
    const color =
        document.getElementById("searchColor")?.value;

    // ステージ（開始または終了）
    const stage =
        document.getElementById("searchStage")?.value;

    // 検索条件をグローバルに保存
    window.searchOptions = {
        keyword1,
        keyword2,
        keywordMode,
        fromDate,
        toDate,
        favOnly,
        emotions,
        color,
        stage
    };

    // 条件から検索を実行
    applySearchFromState();

    // モーダルを閉じる
    closeSearchModal();
}


/* =========================
   状態から再検索
========================= */

// 保存された検索条件をもとにデータをフィルタリングする関数
function applySearchFromState() {

    // 条件が存在しない場合は全件表示
    if (!window.searchOptions) {
        rerender();
        return;
    }

    // 表示対象データ取得
    const allData = DataManager.getAll();

    const hasUserData =
        allData.some(e => e.isSample === false);

    let result = hasUserData
        ? allData.filter(e => e.isSample === false)
        : allData;

    const opts = window.searchOptions;

    // キーワード検索処理
    if (opts.keyword1 || opts.keyword2) {

        result = result.filter(ev => {

            const text = [
                ev.title,
                ev.description,
                ev.location
            ].join(" ");

            const hasK1 = !!opts.keyword1;
            const hasK2 = !!opts.keyword2;

            const k1 = hasK1 && text.includes(opts.keyword1);
            const k2 = hasK2 && text.includes(opts.keyword2);

            // 両方入力されている
            if (hasK1 && hasK2) {
                return opts.keywordMode === "and"
                    ? (k1 && k2)
                    : (k1 || k2);
            }

            // 片方だけ入力
            if (hasK1) return k1;
            if (hasK2) return k2;

            return true;
        });
    }

    // 開始日フィルタ
    if (opts.fromDate) {
        result = result.filter(ev => ev.date >= opts.fromDate);
    }

    // 終了日フィルタ
    if (opts.toDate) {
        result = result.filter(ev => ev.date <= opts.toDate);
    }

    // 感情タグフィルタ
    if (opts.emotions.length > 0) {
        result = result.filter(ev =>
            opts.emotions.some(e =>
                (ev.emotions || []).includes(e)
            )
        );
    }

    // 背景色フィルタ
    if (opts.color && opts.color !== "none") {
        result = result.filter(ev =>
            ev.bgColor === opts.color
        );
    }

    // お気に入りフィルタ
    if (opts.favOnly) {
        result = result.filter(ev => ev.favorite);
    }

    // ステージ（開始）
    if (opts.stage === "start") {
        result = result.filter(ev => ev.startType);
    }

    // ステージ（終了）
    if (opts.stage === "end") {
        result = result.filter(ev => ev.endType);
    }

    // 日付順ソート（昇順または降順）
    result = result
        .slice()
        .sort((a, b) => {

            const diff =
                new Date(a.date) - new Date(b.date);

            return window.sortOrder === "asc"
                ? diff
                : -diff;
        });

    // タイムライン再描画
    renderTimeline(result);

    // 検索状態表示更新
    updateSearchStatus();
}


/* =========================
   検索状態表示（チップ）
========================= */

// 現在の検索条件をチップ形式で画面に表示する関数
function updateSearchStatus() {

    const box = document.getElementById("searchStatus");
    if (!box || !window.searchOptions) return;

    const opts = window.searchOptions;

    let html = '<div class="chip-container">';

    // チップを追加する内部関数
    function addChip(text, type, value = "") {
        html += `
            <span class="chip">
                ${text}
                <button class="chip-remove"
                    data-type="${type}"
                    data-value="${value}">
                    ×
                </button>
            </span>
        `;
    }

    // キーワード表示
    if (opts.keyword1) {
        addChip(opts.keyword1, "keyword1");
    }

    if (opts.keyword2) {
        addChip(opts.keyword2, "keyword2");
    }

    // 日付フォーマット関数
    function formatDate(dateStr) {

        if (!dateStr) return "";

        const d = new Date(dateStr);

        return `${d.getMonth() + 1}/${d.getDate()}`;
    }

    // 日付条件表示
    if (opts.fromDate) {
        addChip(
            `${formatDate(opts.fromDate)}～`,
            "fromDate"
        );
    }

    if (opts.toDate) {
        addChip(
            `～${formatDate(opts.toDate)}`,
            "toDate"
        );
    }

    // 感情タグ表示
    if (opts.emotions.length > 0) {
        opts.emotions.forEach(emotion => {
            addChip(emotion, "emotion", emotion);
        });
    }

    // 色条件
    if (opts.color && opts.color !== "none") {
        addChip("カラー", "color");
    }

    // お気に入り条件
    if (opts.favOnly) {
        addChip("★", "fav");
    }

    // ステージ条件
    if (opts.stage) {
        const label =
            opts.stage === "start"
                ? "🚀"
                : "🏁";
        addChip(label, "stage");
    }

    html += "</div>";

    box.innerHTML = html;
}


/* =========================
   条件削除
========================= */

// 指定した検索条件を削除する関数
function removeSearch(type, value = "") {

    if (!window.searchOptions) return;

    switch (type) {

        case "keyword1":
            window.searchOptions.keyword1 = "";
            break;

        case "keyword2":
            window.searchOptions.keyword2 = "";
            break;

        case "fromDate":
            window.searchOptions.fromDate = "";
            break;

        case "toDate":
            window.searchOptions.toDate = "";
            break;

        case "color":
            window.searchOptions.color = "";
            break;

        case "fav":
            window.searchOptions.favOnly = false;
            break;

        case "stage":
            window.searchOptions.stage = "";
            break;

        case "emotion":
            window.searchOptions.emotions =
                window.searchOptions.emotions.filter(
                    e => e !== value
                );
            break;
    }

    applySearchFromState();
}

/* =========================
   リセット
========================= */

// 検索条件と入力UIをすべて初期状態に戻す関数
function resetSearch() {

    // 入力状態が存在するか確認
    const hasInput =
        document.getElementById("keyword1").value ||
        document.getElementById("keyword2").value ||
        document.getElementById("fromDate").value ||
        document.getElementById("toDate").value ||
        document.getElementById("favOnly").checked ||
        document.getElementById("searchColor").value ||
        document.getElementById("searchStage")?.value ||
        document.querySelector("#searchModal .emotion-form input:checked");

    // 入力が何もない場合はモーダルのみ閉じる
    if (!hasInput) {
        closeSearchModal();
        return;
    }

    // 条件リセット
    window.searchOptions = null;

    // 入力欄初期化
    document.getElementById("keyword1").value = "";
    document.getElementById("keyword2").value = "";
    document.getElementById("fromDate").value = "";
    document.getElementById("toDate").value = "";

    document.getElementById("favOnly").checked = false;

    const stage = document.getElementById("searchStage");
    if (stage) stage.value = "";

    document.getElementById("searchColor").value = "";

    document.querySelectorAll("#searchColorPalette .color-dot")
        .forEach(d => d.classList.remove("selected"));

    document.querySelectorAll("#searchModal .emotion-form input")
        .forEach(cb => cb.checked = false);

    rerender();
}


/* =========================
   カラークリック（検索用）
========================= */

// カラーパレット操作（選択・解除）
document.addEventListener("click", (e) => {

    const dot = e.target.closest("#searchColorPalette .color-dot");
    if (!dot) return;

    const palette = dot.parentElement;
    const hidden = document.getElementById("searchColor");

    const isSelected = dot.classList.contains("selected");

    if (isSelected) {
        dot.classList.remove("selected");
        hidden.value = "";
        return;
    }

    palette.querySelectorAll(".color-dot")
        .forEach(d => d.classList.remove("selected"));

    dot.classList.add("selected");

    hidden.value = dot.dataset.color || "";
});


// チップの削除ボタン操作
document.addEventListener("click", (e) => {

    const btn = e.target.closest(".chip-remove");
    if (!btn) return;

    const type = btn.dataset.type;
    const value = btn.dataset.value;

    removeSearch(type, value);
});

function openSearchModal() {
    const modal = document.getElementById("searchModal");
    document.body.classList.add("modal-open");
    modal.classList.add("show");
}

function closeSearchModal() {
    const modal = document.getElementById("searchModal");
    document.body.classList.remove("modal-open");
    modal.classList.remove("show");
}

// グローバル公開
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;

window.executeSearch = executeSearch;
window.resetSearch = resetSearch;
window.applySearchFromState = applySearchFromState;
window.removeSearch = removeSearch;
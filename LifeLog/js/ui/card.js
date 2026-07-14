/* =========================
   カード
========================= */

// イベントデータを受け取り、一覧画面に表示するカードのHTMLを生成する関数
function renderEventCard(event) {

    // 感情タグの種類ごとにCSSクラスを割り当てるための対応表
    const classMap = {
        成長: "growth",
        挑戦: "challenge",
        達成感: "happy",
        楽しい: "fun",
        安心: "relax",
        不安: "anxiety",
        緊張: "tension"
    };

    // event.emotionsに格納されている感情配列をもとにタグHTMLを生成する
    // 値が存在しない場合は空配列として処理し、XSS対策としてescapeHTMLを適用している
    const emotions = (event.emotions || [])
        .map(e =>
            `<span class="tag ${classMap[e] || "default-tag"}">
                ${escapeHTML(e)}
            </span>`
        )
        .join("");

    // お気に入り状態に応じてボタンのクラスを切り替える
    const isFav = event.favorite ? "active" : "";

    // カード全体のHTMLをテンプレート文字列で返す
    // クリックすると詳細画面へ遷移する設計になっている
    return `
        <!--  クリックで詳細ページへ -->
        <div class="event-card"
             style="background:${event.bgColor || "white"}"
             onclick="openView('${event.id}')">

            ${event.startType ? `<div class="corner-badge start">始まり</div>` : ""}
            ${event.endType ? `<div class="corner-badge end">終わり</div>` : ""}

            <!-- お気に入り -->
            <button class="fav-btn ${isFav}"
                onclick="event.stopPropagation(); toggleFavorite('${event.id}')">
                ★
            </button>

            <!-- タイトル表示（エスケープ処理あり） -->
            <h2 class="title">${escapeHTML(event.title || "")}</h2>

            <!-- 日付表示 -->
            <p class="meta">${escapeHTML(event.date || "")}</p>

            <!-- 説明文表示 -->
            <p class="desc">${escapeHTML(event.description || "")}</p>

            ${
            // locationが存在する場合のみ表示
            event.location ? `
            <p class="meta">
                📍 
                <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   onclick="event.stopPropagation()">
                   ${escapeHTML(event.location)}
                </a>
            </p>
            ` : ""}

            <!-- 感情タグ表示 -->
            <div class="emotion-tags">${emotions}</div>

            <!-- 添付ファイル表示 -->
            ${renderFile(event.file)}

        </div>
    `;
}


/* =========================
   ファイル表示
========================= */

// 添付ファイルの種類に応じて表示方法を切り替える関数
function renderFile(file) {

    // ファイルが存在しない場合は空文字を返す
    if (!file) return "";

    // 画像ファイルの場合（typeがimage/で始まる）
    if (file.type?.startsWith("image/")) {
        return `
            <div class="file-preview"
                 onclick="event.stopPropagation()">
                <img src="${file.data}" class="thumbnail"
                     onclick="openImageModal('${file.data}', 'image')">
            </div>
        `;
    }

    // PDFファイルの場合
    if (file.type === "application/pdf") {
        return `
            <div class="file-preview"
                 onclick="event.stopPropagation()">
                📄 <a href="javascript:void(0)"
                   onclick="openImageModal('${file.data}', 'pdf')">
                   ${escapeHTML(file.name)}
                </a>
            </div>
        `;
    }

    // その他ファイル（ダウンロード）
    return `
        <div class="file-preview"
             onclick="event.stopPropagation()">
            🖇 <a href="${file.data}" download="${escapeHTML(file.name)}">
                ${escapeHTML(file.name)}
            </a>
        </div>
    `;
}


/* =========================
   詳細画面へ遷移
========================= */

// カードクリック時に対応するイベントIDをURLパラメータとして渡し、詳細画面へ遷移する
function openView(id) {
    window.location.href = `view.html?id=${id}`;
}


/* =========================
   お気に入り
========================= */

// お気に入り状態をトグル（ON/OFF切り替え）する関数
function toggleFavorite(id) {

    // 指定IDのイベントを取得
    const event = DataManager.find(id);
    if (!event) return;

    // favoriteプロパティを反転させて更新
    DataManager.update(id, {
        favorite: !event.favorite
    });

    // 検索状態が有効な場合は検索結果を再描画
    if (window.searchOptions) {
        applySearchFromState();
    } else {
        // 通常は一覧を再描画
        rerender();
    }
}


/* =========================
   グローバル
========================= */

// 他ファイルから呼び出せるように関数をグローバルに公開
window.toggleFavorite = toggleFavorite;
window.renderEventCard = renderEventCard;
window.renderFile = renderFile;
window.openView = openView;
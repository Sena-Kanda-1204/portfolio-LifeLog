/* =========================
    タイムライン描画
   =========================*/
// 渡されたイベントデータ配列をもとに、タイムライン形式のHTMLを生成して描画する関数
function renderTimeline(data, containerId = "timeline") {

    // 描画先となるコンテナ要素を取得
    const timeline = document.getElementById(containerId);
    if (!timeline) return;

    let html = "";

    // 年・月の変化を検知するための変数
    let lastYear = null;
    let lastMonth = null;

    // 線描画用の情報を蓄積する配列
    const lineData = [];

    // データを順番に処理してHTMLを構築
    data.forEach((event, index) => {

        // 日付から年と月を取得
        const d = new Date(event.date);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;

        // 表示制御（前年・前月と比較して見出しを出すか判断）
        const showYear = year !== lastYear;
        const showMonth = month !== lastMonth || showYear;
        const showDot = showYear || showMonth;

        // 年ジャンプ用のID
        const yearId = `year-${year}`;

        // タイムライン1件分のHTMLを構築
        html += `
        <section class="timeline-item">

            <div class="timeline-year"
                 ${showYear ? `id="${yearId}"` : ""}>

                ${showYear ? `<div class="year-big">${year}</div>` : ""}

            </div>

            <div class="timeline-month">
                ${showMonth ? `<div class="month-small">${month}月</div>` : ""}
            </div>

            <div class="timeline-content">

                ${showDot ? `<div class="timeline-dot"></div>` : ""}

                ${renderEventCard(event, index)}

            </div>

        </section>
        `;

        // 線描画用データ（色と順番）を記録
        lineData.push({
            color: event.bgColor,
            index
        });

        // 次のループ用に現在の年・月を保存
        lastYear = year;
        lastMonth = month;
    });

    // データが空の場合の表示
    if (data.length === 0) {

        timeline.innerHTML = `
            <div class="no-result">
                <p>🔍 検索結果が見つかりません</p>
                <small>条件を変更して再度お試しください</small>
            </div>
        `;

        return;
    }

    // タイムライン本体と線コンテナを描画
    timeline.innerHTML = `
        <div class="timeline-lines"></div>
        ${html}
    `;


    // 年ナビゲーションを生成
    renderYearNav(data);
    
    setTimeout(() => {
        drawLines(lineData);
        updateTimelineLine();
    }, 0);

}

function updateTimelineLine() {

    const timeline = document.querySelector(".timeline");
    const items = document.querySelectorAll(".timeline-item");

    if (!timeline || items.length === 0) return;

    // 最後のカード取得
    const lastItem = items[items.length - 1];
    const rect = lastItem.getBoundingClientRect();
    const timelineRect = timeline.getBoundingClientRect();

    // タイムライン内での位置
    const solidHeight = rect.bottom - timelineRect.top;

    const totalHeight = timeline.offsetHeight;

    const solidPercent = (solidHeight / totalHeight) * 100;

    // ↓ グラデーション生成
    timeline.style.setProperty(
        "--line-bg",
        `
        linear-gradient(
            to bottom,
            #d8dee9 0%,
            #d8dee9 ${solidPercent}%,
            transparent ${solidPercent}%,
            transparent calc(${solidPercent}% + 6px),
            #d8dee9 calc(${solidPercent}% + 6px),
            #d8dee9 calc(${solidPercent}% + 12px)
        )
        `
    );
}

/* =========================
   年ナビ生成（分岐対応）
========================= */

// 年ごとのジャンプUIを生成する関数
function renderYearNav(data) {

    const nav = document.getElementById("yearNav");
    if (!nav) return;

    // データから重複なしの年リストを生成し昇順でソート
    const years = [
        ...new Set(
            data.map(e => new Date(e.date).getFullYear())
        )
    ].sort((a, b) => a - b);

    const currentYear = new Date().getFullYear();

    // 画面幅に応じてモバイルかを判定
    const isMobile = window.innerWidth <= 768;

    // 表示形式の切り替え基準（モバイルとPCで異なる）
    const threshold = isMobile ? 5 : 10;

    // 年数が少ない場合はボタン形式
    if (years.length <= threshold) {

        nav.innerHTML = years.map(year => `
            <button class="year-btn"
                onclick="scrollToYear(${year})">
                ${year}
            </button>
        `).join("");

    } else {

        // 年数が多い場合はプルダウン形式
        nav.innerHTML = `
            <select class="year-select"
                    onchange="scrollToYear(this.value)">

                <option value="">年を選択</option>

                ${years.map(year => `
                    <option value="${year}"
                        ${year === currentYear ? "selected" : ""}>
                        ${year}
                    </option>
                `).join("")}

            </select>
        `;
    }
}

/* =========================
   年ジャンプ
========================= */

// 指定した年の位置までスクロールする関数
function scrollToYear(year) {

    const el = document.getElementById(`year-${year}`);
    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =========================
   スクロール連動
========================= */

// 現在アクティブな年を保持
let currentActiveYear = null;

// スクロール位置に応じて現在の年を判定しUIに反映
window.addEventListener("scroll", () => {

    const yearEls = document.querySelectorAll(".timeline-year[id]");
    let detected = null;

    yearEls.forEach(el => {

        const rect = el.getBoundingClientRect();

        // 画面上部付近に来た年を検出
        if (rect.top >= 0 && rect.top < 150) {
            detected = el.id.replace("year-", "");
        }
    });

    // 検出結果が無い、または変化が無い場合は処理しない
    if (!detected || detected === currentActiveYear) return;

    currentActiveYear = detected;

    // ボタンUIのアクティブ状態更新
    document.querySelectorAll(".year-btn")
        .forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.textContent.trim() == detected
            );
        });

    // プルダウンUIの選択状態更新
    const select = document.querySelector(".year-select");
    if (select) {
        select.value = detected;
    }

});

/* =========================
   再描画
========================= */

// タイムラインを再描画するための関数をグローバルに定義
window.renderTimeline = renderTimeline;

function rerender() {

    const allData = DataManager.getAll();

    const hasUserData =
        allData.some(e => e.isSample === false);

    const data = hasUserData
        ? allData.filter(e => e.isSample === false)
        : allData;

    const sorted = data
        .slice()
        .sort((a, b) => {

            const diff =
                new Date(a.date) - new Date(b.date);

            return window.sortOrder === "asc"
                ? diff
                : -diff;
        });

    renderTimeline(sorted);

    updateSearchStatus?.();
}


/* =========================
   グローバル
========================= */

// 関数を外部から呼び出せるように公開
window.scrollToYear = scrollToYear;
window.rerender = rerender;

/* =========================
   リサイズ対応（年ナビ再生成）
========================= */

// リサイズイベントの連続発火を防ぐためのタイマー
let resizeTimer;

// 画面サイズ変更時に年ナビを再生成
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {
        rerender();
    }, 200);
});
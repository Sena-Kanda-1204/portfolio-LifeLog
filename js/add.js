// 添付されたファイル情報を保持するための変数
// ファイル選択時に内容を読み込んでここに格納する
let attachedFile = null;

// DOM読み込み完了時に初期化処理を実行
document.addEventListener("DOMContentLoaded", init);

/* =========================
   初期化
========================= */

// アプリ初期化処理をまとめた関数
// データの準備とUIのイベント設定を行う
async function init() {

    // データマネージャの初期化（ローカルストレージなどから読み込み）
    await DataManager.init();

    // 各種初期設定
    validateForm();          // 入力チェック初期状態
    setupListeners();        // 入力監視
    setupFileListener();     // ファイル選択処理
    setupStageListener();    // ステージ選択によるUI制御
    setupColorPalette();     // 色選択UI
    enhanceStageSelect();    // ステージ選択の見た目改善
    setupColorUsageTooltip();// 色使用状況のツールチップ
}


/* =========================
   バリデーション
========================= */

// 必須項目が入力されているかチェックし、ボタンの有効無効を切り替える
function validateForm() {

    const title =
        document.getElementById("title")?.value.trim();

    const date =
        document.getElementById("date")?.value;

    const description =
        document.getElementById("description")?.value.trim();

    const btn =
        document.getElementById("addBtn");

    if (!btn) return;

    // 必須3項目が全て入力されている場合のみボタンを有効化
    btn.disabled = !(title && date && description);
}

// 入力内容変更時にバリデーションを再実行する設定
function setupListeners() {

    ["title", "date", "description"]
        .forEach(id => {

        document.getElementById(id)
            ?.addEventListener("input", validateForm);
    });
}


/* =========================
   ステージ切替
========================= */

// ステージ（開始・終了）の選択に応じて背景色選択UIの表示を切り替える
function setupStageListener() {

    const stage =
        document.getElementById("lifeStage");

    const colorBox =
        document.getElementById("colorPickerBox");

    if (!stage) return;

    stage.addEventListener("change", () => {

        if (stage.value) {

            // ステージが選択されている場合のみ色選択を表示
            colorBox.style.display = "block";

        } else {

            // 未選択の場合は非表示
            colorBox.style.display = "none";
        }
    });
}


/* =========================
   プルダウンUI
========================= */

// ステージ選択の見た目を状態に応じて変更する
function enhanceStageSelect() {

    const select =
        document.getElementById("lifeStage");

    if (!select) return;

    // CSSクラスの付け替え処理
    const updateUI = () => {

        select.classList.remove(
            "start-selected",
            "end-selected",
            "empty"
        );

        if (!select.value) {
            select.classList.add("empty");
        }

        if (select.value === "start") {
            select.classList.add("start-selected");
        }

        if (select.value === "end") {
            select.classList.add("end-selected");
        }
    };

    updateUI();

    select.addEventListener("change", updateUI);
}


// 「more」ボタンの開閉処理
const toggleBtn = document.getElementById("toggleMore");
const moreSection = document.getElementById("moreSection");

toggleBtn.addEventListener("click", () => {

    const isOpen = moreSection.style.display === "block";

    moreSection.style.display = isOpen ? "none" : "block";

    toggleBtn.textContent = isOpen
        ? "more ▼"
        : "less ▲";
});


/* =========================
   カラーパレット
========================= */

// カラー選択UIの処理
function setupColorPalette() {

    const palette =
        document.getElementById("colorPalette");

    const hidden =
        document.getElementById("bgColor");

    if (!palette) return;

    // 各色ボタンにクリックイベントを設定
    palette.querySelectorAll(".color-dot")
        .forEach(dot => {

        dot.addEventListener("click", () => {

            // 他の選択を解除
            palette.querySelectorAll(".color-dot")
                .forEach(d =>
                    d.classList.remove("selected")
                );

            // 現在の選択を反映
            dot.classList.add("selected");

            hidden.value = dot.dataset.color;
        });
    });
}


/* =========================
   ファイル
========================= */

// ファイル選択時に内容を読み込む処理
function setupFileListener() {

    const input =
        document.getElementById("fileInput");

    const status =
        document.getElementById("fileStatus");

    if (!input) return;

    input.addEventListener("change", e => {

        const file = e.target.files[0];

        if (!file) return;

        const reader = new FileReader();

        // ファイル読み込み完了時
        reader.onload = event => {

            // ファイル情報を保持
            attachedFile = {
                name: file.name,
                type: file.type,
                data: event.target.result
            };

            // UIに反映
            status.textContent =
                `添付済み：${file.name}`;
        };

        // Base64形式で読み込む
        reader.readAsDataURL(file);
    });
}


// 現在地を取得し、地名または座標を入力欄に反映する
function setCurrentLocation() {

    const status = document.getElementById("locationStatus");

    // 位置情報APIに対応しているか確認
    if (!navigator.geolocation) {
        status.textContent = "位置情報が使えません";
        return;
    }

    status.textContent = "取得中...";

    navigator.geolocation.getCurrentPosition(
        async (pos) => {

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            try {
                // OpenStreetMapのAPIで住所変換
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                );
                const data = await res.json();

                const addr = data.address || {};

                // 住所を整形
                const formatted = [
                    addr.country,
                    addr.state,
                    addr.city || addr.town || addr.village || addr.county,
                    addr.suburb || addr.neighbourhood || addr.quarter,
                    addr.road || addr.residential || addr.pedestrian || addr.hamlet,
                    addr.house_number
                ]
                .filter(Boolean)
                .join("");

                document.getElementById("location").value = formatted;

                status.textContent = "取得成功！";

            } catch {
                // API失敗時は座標で代替
                document.getElementById("location").value =
                    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

                status.textContent = "座標で取得しました";
            }
        },
        (err) => {
            status.textContent = "取得失敗：" + err.message;
        }
    );
}


/* =========================
   追加
========================= */

// 入力内容をもとに新しいイベントを作成し保存する
function addEvent() {

    const stage =
        document.getElementById("lifeStage")?.value;

    const bgColor =
        document.getElementById("bgColor")?.value;

    const newEvent = {

        id: crypto.randomUUID(),

        title: document.getElementById("title").value,

        date: document.getElementById("date").value,

        description: document.getElementById("description").value,

        location: document.getElementById("location").value,

        emotions: Array.from(
            document.querySelectorAll(
                ".emotion-form input:checked"
            )
        ).map(cb => cb.value),

        file: attachedFile,

        favorite: false,

        startType: stage === "start",

        endType: stage === "end",

        bgColor: stage ? bgColor : "",

        // 振り返りデータ
        reflection: {
            action: document.getElementById("action")?.value || "",
            feeling: document.getElementById("feeling")?.value || "",
            reason: document.getElementById("reason")?.value || "",
            learning: document.getElementById("learning")?.value || "",
            impact: document.getElementById("impact")?.value || ""
        },

        // 就活データ
        jobData: {
            problem: document.getElementById("problem")?.value || "",
            action: document.getElementById("actionDetail")?.value || "",
            result: document.getElementById("result")?.value || ""
        },

        // 性格データ
        personality: {
            strength: document.getElementById("strength")?.value || "",
            weakness: document.getElementById("weakness")?.value || ""
        }

    };

    // データ保存
    DataManager.add(newEvent);

    // トースト表示用メッセージを一時保存
    sessionStorage.setItem("toast", "追加しました");

    // 一覧ページへ遷移
    window.location.href = "../index.html";
}


/* =========================
   カラー使用状況ツールチップ
========================= */

// 色ごとの使用イベントをツールチップで表示する処理
function setupColorUsageTooltip() {

    const palette =
        document.getElementById("colorPalette");

    if (!palette) return;

    // ツールチップ要素を生成
    const tooltip = document.createElement("div");

    tooltip.className = "color-tooltip";

    document.body.appendChild(tooltip);

    palette.querySelectorAll(".color-dot")
        .forEach(dot => {

        const color = dot.dataset.color;

        dot.addEventListener("mouseenter", (e) => {

            const events =
                DataManager.getAll()
                    .filter(ev => ev.bgColor === color);

            if (events.length === 0) {

                tooltip.textContent =
                    "使用されていません";

            } else {

                const names = events
                    .slice(0, 5)
                    .map(ev => "・" + ev.title)
                    .join("<br>");

                const more =
                    events.length > 5
                    ? `<br>...他 ${events.length - 5} 件`
                    : "";

                tooltip.innerHTML = `
                    <strong>使用中のイベント</strong><br>
                    ${names}${more}
                `;
            }

            tooltip.style.left =
                e.pageX + 10 + "px";

            tooltip.style.top =
                e.pageY + 10 + "px";

            tooltip.classList.add("show");
        });

        dot.addEventListener("mousemove", (e) => {

            tooltip.style.left =
                e.pageX + 10 + "px";

            tooltip.style.top =
                e.pageY + 10 + "px";
        });

        dot.addEventListener("mouseleave", () => {

            tooltip.classList.remove("show");
        });
    });
}

// 外部から呼び出せるように公開
window.addEvent = addEvent;
/* =========================
    モーダル
========================= */

// 指定されたIDのイベント情報を取得し、編集モーダルに値をセットして表示する関数
function openEdit(id) {

    // IDから該当するイベントデータを取得
    const event = DataManager.find(id);
    if (!event) return;

    // 現在編集中のIDを保持（保存や削除時に使用）
    window.currentEditId = id;

    // 基本情報をフォームにセット
    document.getElementById("editTitle").value = event.title || "";
    document.getElementById("editDate").value = event.date || "";
    document.getElementById("editLocation").value = event.location || "";
    document.getElementById("editDescription").value = event.description || "";

    // 振り返り情報をフォームにセット（存在しない場合は空文字）
    document.getElementById("editAction").value = event.reflection?.action || "";
    document.getElementById("editFeeling").value = event.reflection?.feeling || "";
    document.getElementById("editReason").value = event.reflection?.reason || "";
    document.getElementById("editLearning").value = event.reflection?.learning || "";
    document.getElementById("editImpact").value = event.reflection?.impact || "";

    // 就活（ガクチカ）情報をセット
    document.getElementById("editProblem").value = event.jobData?.problem || "";
    document.getElementById("editActionDetail").value = event.jobData?.action || "";
    document.getElementById("editResult").value = event.jobData?.result || "";

    // 性格・価値観情報をセット
    document.getElementById("editStrength").value = event.personality?.strength || "";
    document.getElementById("editWeakness").value = event.personality?.weakness || "";

    // 「more」セクションの開閉機能を初期化
    setupEditMoreToggle();

    // モーダルを表示（背景スクロール抑制と可視化）
    document.body.classList.add("modal-open");
    document.getElementById("editModal").classList.add("show");
}


/* =========================
   保存
========================= */

// 編集内容を保存する関数
function saveEdit() {

    // 編集中のIDを取得
    const id = window.currentEditId;
    if (!id) return;

    // 入力内容をもとにデータを更新
    DataManager.update(id, {

        // 基本情報
        title: document.getElementById("editTitle").value,
        date: document.getElementById("editDate").value,
        location: document.getElementById("editLocation").value,
        description: document.getElementById("editDescription").value,

        // 振り返り情報
        reflection: {
            action: document.getElementById("editAction")?.value || "",
            feeling: document.getElementById("editFeeling")?.value || "",
            reason: document.getElementById("editReason")?.value || "",
            learning: document.getElementById("editLearning")?.value || "",
            impact: document.getElementById("editImpact")?.value || ""
        },

        // 就活情報
        jobData: {
            problem: document.getElementById("editProblem")?.value || "",
            action: document.getElementById("editActionDetail")?.value || "",
            result: document.getElementById("editResult")?.value || ""
        },

        // 性格情報
        personality: {
            strength: document.getElementById("editStrength")?.value || "",
            weakness: document.getElementById("editWeakness")?.value || ""
        }

    });

    // モーダルを閉じる
    closeModal();

    // ページを再読み込みして変更を反映
    location.reload();
}


/* =========================
   閉じる
========================= */

// 編集モーダルを閉じる処理
function closeModal() {
    document.body.classList.remove("modal-open");
    document.getElementById("editModal").classList.remove("show");
}


// 画像やPDFを拡大表示するモーダルを開く関数
function openImageModal(src, type) {

    const modal = document.getElementById("imageModal");
    const img = document.getElementById("expandedImage");
    const pdf = document.getElementById("pdfFrame");

    // モーダル表示
    modal.classList.add("show");

    // 画像の場合
    if (type === "image") {
        img.src = src;
        img.style.display = "block";
        pdf.style.display = "none";
    }

    // PDFの場合
    if (type === "pdf") {
        pdf.src = src;
        pdf.style.display = "block";
        img.style.display = "none";
    }
}

// 画像モーダルを閉じる処理
function closeImageModal() {
    document.getElementById("imageModal").classList.remove("show");
}


/* =========================
   削除
========================= */

// 現在のイベントを削除する関数
function deleteEvent() {

    const id = window.currentEditId;
    if (!id) return;

    // 確認ダイアログ表示
    if (!confirm("削除しますか？")) return;

    // データ削除
    DataManager.delete(id);

    // モーダルを閉じる
    closeModal();

    // 再読み込みして画面更新
    location.reload();
}


/* =========================
   more開閉
========================= */

// 「more」ボタン押下で追加項目の表示・非表示を切り替える
function setupEditMoreToggle() {

    const btn = document.getElementById("editToggleMore");
    const section = document.getElementById("editMoreSection");

    // ボタンが存在しない、または既に設定済みなら処理しない
    if (!btn || btn.dataset.ready) return;

    btn.dataset.ready = "true";

    // ボタンクリックで表示切り替え
    btn.addEventListener("click", () => {

        const isOpen = section.style.display === "block";

        section.style.display = isOpen ? "none" : "block";

        btn.textContent = isOpen ? "more ▼" : "less ▲";
    });
}


/* =========================
   キーボード操作
========================= */

// キーボード操作によるモーダル制御
window.addEventListener("keydown", (e) => {

    const editModal = document.getElementById("editModal");
    const imageModal = document.getElementById("imageModal");
    const searchModal = document.getElementById("searchModal");

    const isEditOpen = editModal?.classList.contains("show");
    const isImageOpen = imageModal?.classList.contains("show");
    const isSearchOpen = searchModal?.classList.contains("show");

    // ① 画像モーダル（最優先）
    if (isImageOpen) {
        if (e.key === "Escape") {
            closeImageModal();
        }
        return;
    }

    // ② 編集モーダル
    if (isEditOpen) {

        if (e.key === "Escape") {
            closeModal();
        }

        if (e.key === "Enter") {
            if (e.target.tagName === "TEXTAREA") return;
            e.preventDefault();
            saveEdit();
        }

        return;
    }

    // ③ 検索モーダル
    if (isSearchOpen) {

        if (e.key === "Escape") {
            closeSearchModal();
        }

        if (e.key === "Enter") {
            if (e.target.tagName === "TEXTAREA") return;
            e.preventDefault();
            executeSearch();
        }

        return;
    }

    // ④ 何も開いていない
    if (e.key === "Escape") {
        history.back();
    }
});


/* =========================
   モーダル外クリック
========================= */

// モーダル背景クリックで閉じる処理
window.addEventListener("click", (e) => {

    const editModal = document.getElementById("editModal");
    const imageModal = document.getElementById("imageModal");
    const searchModal = document.getElementById("searchModal");

    if (e.target === editModal) {
        closeModal();
    }

    if (e.target === imageModal) {
        closeImageModal();
    }

    if (e.target === searchModal) {
        closeSearchModal();
    }
});


/* =========================
   グローバル
========================= */

// 他ファイルから利用できるよう関数をグローバルに公開
window.openEdit = openEdit;
window.saveEdit = saveEdit;
window.closeModal = closeModal;
window.deleteEvent = deleteEvent;

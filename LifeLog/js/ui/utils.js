// 文字列に含まれるHTML特殊文字をエスケープする関数// 文字列にままHTMLに出力するとスクリプトが実行される危険があるため、
// 安全に表示するために変換処理を行っている
function escapeHTML(str = "") {

    // 引数を文字列として扱い、該当する文字を対応するエスケープ文字に置換する
    return String(str).replace(/[&<>\"']/g, m => ({

        // & → &amp;
        "&": "&amp;",

        // < → &lt;
        "<": "&lt;",

        // > → &gt;
        ">": "&gt;",

        // " → &quot;
        '"': "&quot;",

        // ' → &#039;
        "'": "&#039;"

    }[m]));
}


// 背景色ごとの使用状況を集計する関数
// 各色に対して最大3件までイベントタイトルを保持するマップを作成する
function getColorUsageMap() {

    // 全イベントデータを取得
    const data = DataManager.getAll();

    // 色ごとの分類結果を格納するオブジェクト
    const map = {};

    // 各イベントを順に処理
    data.forEach(e => {

        // 背景色を取得（未指定の場合は"none"として扱う）
        const color = e.bgColor || "none";

        // その色に対応する配列がまだ無ければ初期化
        if (!map[color]) {
            map[color] = [];
        }

        // タイトルのみ収集する
        // かつ、同一色につき最大3件まで保存する制限を設けている
        if (e.title && map[color].length < 3) {
            map[color].push(e.title);
        }
    });

    // 色ごとの使用状況マップを返す
    return map;
}


// 他ファイルやHTMLから利用できるように関数をグローバルに公開している
// escapeHTMLは表示安全性のために広く使われる
// getColorUsageMapは色選択UIなどで使用される想定
window.escapeHTML = escapeHTML;
window.getColorUsageMap = getColorUsageMap;

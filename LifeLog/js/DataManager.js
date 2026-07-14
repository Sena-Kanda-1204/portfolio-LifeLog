/* =========================
   DataManager（唯一のデータ管理層）
========================= */

// ローカルストレージに保存する際のキー名
// このキーを使って全イベントデータを一括管理している
const STORAGE_KEY = "events";

// アプリ内で唯一のデータ操作担当オブジェクト
// 取得・追加・更新・削除などの処理を一元管理する
const DataManager = {

    // メモリ上に保持するキャッシュ
    // 毎回localStorageを読むのではなく、この配列を基準に操作する
    _cache: [],

    // 初期化処理
    // ローカルデータがあればそれを使い、無ければ初期データを読み込む
    async init() {

        // ローカルストレージから取得
        const local = this.loadLocal();

        if (local.length > 0) {

            // ローカルにデータがある場合はそれを使用
            this._cache = local;

        } else {

            // 無い場合はJSONファイルから初期データを取得
            this._cache = await this.fetchInitial();

            // 取得したデータをローカルに保存
            this.saveLocal();
        }

        return this._cache;
    },

    // JSONファイルから初期データを取得する関数
    async fetchInitial() {
        try {

            // 同一ディレクトリのdata.jsonを読み込み
            const res = await fetch("./data.json");

            const data = await res.json();

            // 配列であることを確認し、違う場合は空配列を返す
            return Array.isArray(data) ? data : [];

        } catch {

            // エラー発生時は空配列を返す
            return [];
        }
    },

    // localStorageからデータを読み込む
    loadLocal() {
        try {

            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

        } catch {

            // パースエラーの場合は空配列を返す
            return [];
        }
    },

    // 現在のキャッシュ内容をlocalStorageに保存する
    saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._cache));
    },

    // 全データを取得する
    // 他の処理はこの関数を通じてデータを利用する
    getAll() {
        return this._cache;
    },

    // 新しいイベントを追加する
    add(event) {

        // ユーザーデータであることを示すフラグ
        event.isSample = false;

        // キャッシュに追加
        this._cache.push(event);

        // 保存
        this.saveLocal();
    },

    // イベントの更新
    update(id, newData) {

        // 対象イベントのインデックスを取得
        const index = this._cache.findIndex(e => e.id === id);

        if (index === -1) return;

        // 既存データと新しいデータを結合（部分更新）
        this._cache[index] = {
            ...this._cache[index],
            ...newData
        };

        // 保存
        this.saveLocal();
    },

    // イベント削除
    delete(id) {

        // 指定ID以外を残す形でフィルタリング
        this._cache = this._cache.filter(e => e.id !== id);

        // 保存
        this.saveLocal();
    },

    // 単体イベント取得
    find(id) {

        // ID一致する最初の要素を返す
        return this._cache.find(e => e.id === id);
    }
};

// 他のファイルからアクセスできるようにグローバルに公開
// アプリ全体でこのDataManagerを通してデータ操作を行う設計
window.DataManager = DataManager;
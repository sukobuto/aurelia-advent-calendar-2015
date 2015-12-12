import superagent from 'superagent'
import moment from 'moment'

export class Account {

	setData(data) {
		Object.assign(this, data);
	}

}

export class ApiClient {

	token;      // セキュリティトークン
	cache = {}; // キャッシュデータ格納オブジェクト

	/**
	 * キャッシュを保存する
	 * @param {string} key
	 * @param {any} content
	 */
	saveCache(key, content) {
		this.cache[key] = {
			content,
			since: moment().unix()
		};
		return this;
	}

	/**
	 * キャッシュを取得する
	 * @param {string} key
	 * @param {number} ttl
	 */
	getCache(key, ttl) {
		if (!this.cache.hasOwnProperty(key)) return null;
		let item = this.cache[key];
		if (item.since < moment().unix() - ttl) {
			this.purgeCache(key);
			return null;
		}
		return item.content;
	}

	/**
	 * キャッシュを削除する
	 * @param {string} key
	 */
	purgeCache(key) {
		if (this.cache.hasOwnProperty(key)) {
			delete this.cache[key];
		}
	}

	/**
	 * プレフィクスを指定してキャッシュを削除する
	 * @param {string} prefix
	 */
	purgeCaches(prefix) {
		for (var key in this.cache) {
			if (this.cache.hasOwnProperty(key) && key.lastIndexOf(prefix, 0) === 0) {
				delete this.cache[key];
			}
		}
	}

	/**
	 * GET リクエスト
	 * @param {string} url リクエストURL
	 * @param {any} [params] リクエストパラメータ
	 * @param {string} [cacheKey] キャッシュ保存キー
	 * @param {number} [cacheTtl] キャッシュ有効秒数
	 */
	async get(url, params, cacheKey, cacheTtl = 60) {
		// キャッシュチェック
		if (cacheKey) {
			let content = this.getCache(cacheKey, cacheTtl);
			if (content) return content;
		}

		// セキュリティトークンがある場合は付与
		params = params || {};
		if (this.token) params._token = this.token;
		let res = await new Promise((fulfilled, rejected) => {
			// GET リクエスト送信
			superagent.get(url)
				.query(params)
				.end((err, res) => {
					if (err) {
						if (err.status == 401) {
							location.href = '/login';
						}
						rejected(err);
					}
					fulfilled(res.body);
				});
		});

		// キャッシュ保存
		if (cacheKey) {
			this.saveCache(cacheKey, res);
		}
		return res;
	}

	/**
	 * POST request
	 * @param {string} url リクエストURL
	 * @param {Object} [params] リクエストパラメータ(フォームデータ)
	 * @param {NodeList|Node} [files] input[type="file"] またはその NodeList
	 */
	async post(url, params, files) {
		params = params || {};
		if (this.token) params._token = this.token;
		let file_input;
		let req = superagent.post(url);
		for (var prop in params) {
			if (params.hasOwnProperty(prop)) {
				req.field(prop, params[prop]);
			}
		}
		// ファイルがある場合は添付する
		if (files) {
			if (files.hasOwnProperty(length)) { // when the NodeList
				for (var i = 0; i < files.length; i++) {
					file_input = files[i];
					req.attach(file_input.name, file_input.files[0], file_input.value);
				}
			} else {    // when an Element
				file_input = files;
				req.attach(file_input.name, file_input.files[0], file_input.value);
			}
		}
		let res = await new Promise((fulfilled, rejected) => {
			req.end((err, res) => {
				if (err) {
					if (err.status == 401) {
						location.href = '/login';
					}
					rejected(err);
				}
				fulfilled(res.body);
			});
		});
		return res;
	}

}
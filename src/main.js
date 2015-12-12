import 'bootstrap';
import {ApiClient, Account} from 'services'

export async function configure(aurelia) {
	aurelia.use
		.standardConfiguration()
		.developmentLogging();

	let client = aurelia.container.get(ApiClient);
	let res;
	// 初期化 API を呼び、ログインユーザ情報やトークンなどを取得する
	res = await client.get('api/init');
	let account = aurelia.container.get(Account);
	account.setData(res.account);
	client.token = res.token;
	// 初期化後にアプリケーションを起動
	aurelia.start().then(a => a.setRoot());
}

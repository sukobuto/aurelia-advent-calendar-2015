import express from "express"
import bodyParser from "body-parser"
import serveStatic from "serve-static"
import ECT from 'ect'
import session from 'express-session'

let app = express();
let port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(serveStatic(__dirname));
app.engine('ect', ECT({ watch:true, root: __dirname + '/views', ext: '.ect'}).render);
app.set('view engine', 'ect');
app.use(session({
	secret: 'iweolaljcoilsjfkluih',
	resave: false,
	saveUninitialized: false
}));

// テスト用のアカウントデータ
// ほんとは DB に格納されてる想定
// パスワードはハッシュ化しないとだめよ♡
let accounts = {
	okarin: {
		firstName: '倫太郎',
		lastName: '岡部',
		password: 'password'
	},
	kurigohan: {
		firstName: '栗栖',
		lastName: '牧瀬',
		password: 'password'
	}
};

/**
 * ログイン画面とログイン処理のアクション
 */
app.get('/login', (req, res) => {
	res.render('login');
});
app.post('/login', (req, res) => {
	let login = req.body.login;
	let password = req.body.password;
	// 引き当て
	if (!accounts.hasOwnProperty(login)) {
		return res.render('login', {
			error: 'ユーザが見つかりません',
			login: login
		});
	}
	let account = accounts[login];
	if (account.password !== password) {
		return res.render('login', {
			error: 'パスワードが一致しません',
			login: login
		})
	}
	// 転送
	req.session.account = account;
	req.session.token = Math.random().toString(36).slice(2, 22);
	res.redirect('/');
});
app.get('/logout', (req, res) => {
	req.session.account = null;
	res.redirect('/login');
});

/**
 * API セッションに有効な認証がない場合はログインを要求する
 */
app.use('/api/*', (req, res, next) => {
	if (!req.session.account) {
		return res.status(401).send('login required');
	}
	next();
});

/**
 * Aurelia 初期化API
 */
app.get('/api/init', (req, res) => {
	return res.json({
		account: req.session.account,
		token: req.session.token
	});
});

app.listen(port, () => {
	console.log("listening http on port " + port)
});
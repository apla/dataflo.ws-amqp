var amqp = require('amqp');

var States = {
	loading: 'loading',
	ready: 'ready',
	error: 'error'
};

var connections = {};

function getOrCreate(params, callback, errback) {
	var url = params.url;

	if (!connections[url]) {
		connections[url] = {
			connection: amqp.createConnection(params),
			state: States.loading
		};
	}

	var conn = connections[url];

	if (conn.state == States.loading) {
		conn.connection.on('ready', function () {
			conn.state = States.ready;
			callback(conn.connection);
		});

		conn.connection.on('error', function () {
			delete connections[url];
			errback && errback(conn.connection);
		});
	} else {
		callback(conn.connection);
	}
}

function reset() {
	connections = {};
}

module.exports = {
	getOrCreate: getOrCreate,
	reset: reset
};

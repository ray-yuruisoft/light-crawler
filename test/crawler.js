'use strict';

var util = require('util');

var expect = require('chai').expect;

var Crawler = require('../index');

describe('Crawler', function () {
	describe('#crwal()', function () {
		this.timeout(30000);

		var c;

		it('simple test: single url', function (done) {
			var url = 'http://www.google.com';
			c = new Crawler();
			c.addTasks(url).addRule(function (result) {
				expect(result.body).to.be.ok;
			}).start(function () {
				done();
			});
		});

		it('test timeout retry', function (done) {
			var url = 'http://www.google.com';
			c = new Crawler({ requestOpts: {
				timeout: 10
			}});
			c.addTasks(url).addRule(function (result) {
				expect(result.body).to.not.exist;
			}).start(function () {
				done();
			});
		});

		it('test array interval concurrency', function (done) {
			c = new Crawler({ interval: 500, concurrency: 2 });
			c.addTasks(['http://www.baidu.com', 'http://www.google.com'], { type: 'SE' });
			c.addTasks(['http://www.sina.com', 'http://www.nhk.or.jp'], { type: 'Other' });
			c.addRule(function (result) {
				expect(result.body).to.be.ok;
				if (result.task.id <= 2) {
					expect(result.task.type).to.be.equal('SE');
				} else {
					expect(result.task.type).to.be.equal('Other');
				}
			}).start(function () {
				done();
			});
		});

		it('test repetitive tasks', function (done) {
			var urls = ['http://www.baidu.com', 'http://www.baidu.com',
				'http://www.baidu.com', 'http://www.sina.com'];
			c = new Crawler({ interval: 1500 });
			c.addTasks(urls).addRule(function (result) { }).start(function () {
				expect(c.taskCounter).to.be.equal(3);
				done();
			});
			setTimeout(function () {
				c.addTasks('http://www.baidu.com');
				c.addTasks(['http://www.baidu.com', 'http://www.sohu.com']);
			}, 1600);
		});
	});
});

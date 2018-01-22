"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
			}var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, f, f.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
		s(r[o]);
	}return s;
})({ 1: [function (require, module, exports) {
		(function (global) {

			/* **********************************************
        Begin prism-core.js
   ********************************************** */

			var _self = typeof window !== 'undefined' ? window // if in browser
			: typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self // if in worker
			: {} // if in node js
			;

			/**
    * Prism: Lightweight, robust, elegant syntax highlighting
    * MIT license http://www.opensource.org/licenses/mit-license.php/
    * @author Lea Verou http://lea.verou.me
    */

			var Prism = function () {

				// Private helper vars
				var lang = /\blang(?:uage)?-(\w+)\b/i;
				var uniqueId = 0;

				var _ = _self.Prism = {
					manual: _self.Prism && _self.Prism.manual,
					disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
					util: {
						encode: function encode(tokens) {
							if (tokens instanceof Token) {
								return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
							} else if (_.util.type(tokens) === 'Array') {
								return tokens.map(_.util.encode);
							} else {
								return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
							}
						},

						type: function type(o) {
							return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
						},

						objId: function objId(obj) {
							if (!obj['__id']) {
								Object.defineProperty(obj, '__id', { value: ++uniqueId });
							}
							return obj['__id'];
						},

						// Deep clone a language definition (e.g. to extend it)
						clone: function clone(o) {
							var type = _.util.type(o);

							switch (type) {
								case 'Object':
									var clone = {};

									for (var key in o) {
										if (o.hasOwnProperty(key)) {
											clone[key] = _.util.clone(o[key]);
										}
									}

									return clone;

								case 'Array':
									return o.map(function (v) {
										return _.util.clone(v);
									});
							}

							return o;
						}
					},

					languages: {
						extend: function extend(id, redef) {
							var lang = _.util.clone(_.languages[id]);

							for (var key in redef) {
								lang[key] = redef[key];
							}

							return lang;
						},

						/**
       * Insert a token before another token in a language literal
       * As this needs to recreate the object (we cannot actually insert before keys in object literals),
       * we cannot just provide an object, we need anobject and a key.
       * @param inside The key (or language id) of the parent
       * @param before The key to insert before. If not provided, the function appends instead.
       * @param insert Object with the key/value pairs to insert
       * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
       */
						insertBefore: function insertBefore(inside, before, insert, root) {
							root = root || _.languages;
							var grammar = root[inside];

							if (arguments.length == 2) {
								insert = arguments[1];

								for (var newToken in insert) {
									if (insert.hasOwnProperty(newToken)) {
										grammar[newToken] = insert[newToken];
									}
								}

								return grammar;
							}

							var ret = {};

							for (var token in grammar) {

								if (grammar.hasOwnProperty(token)) {

									if (token == before) {

										for (var newToken in insert) {

											if (insert.hasOwnProperty(newToken)) {
												ret[newToken] = insert[newToken];
											}
										}
									}

									ret[token] = grammar[token];
								}
							}

							// Update references in other language definitions
							_.languages.DFS(_.languages, function (key, value) {
								if (value === root[inside] && key != inside) {
									this[key] = ret;
								}
							});

							return root[inside] = ret;
						},

						// Traverse a language definition with Depth First Search
						DFS: function DFS(o, callback, type, visited) {
							visited = visited || {};
							for (var i in o) {
								if (o.hasOwnProperty(i)) {
									callback.call(o, i, o[i], type || i);

									if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
										visited[_.util.objId(o[i])] = true;
										_.languages.DFS(o[i], callback, null, visited);
									} else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
										visited[_.util.objId(o[i])] = true;
										_.languages.DFS(o[i], callback, i, visited);
									}
								}
							}
						}
					},
					plugins: {},

					highlightAll: function highlightAll(async, callback) {
						_.highlightAllUnder(document, async, callback);
					},

					highlightAllUnder: function highlightAllUnder(container, async, callback) {
						var env = {
							callback: callback,
							selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
						};

						_.hooks.run("before-highlightall", env);

						var elements = env.elements || container.querySelectorAll(env.selector);

						for (var i = 0, element; element = elements[i++];) {
							_.highlightElement(element, async === true, env.callback);
						}
					},

					highlightElement: function highlightElement(element, async, callback) {
						// Find language
						var language,
						    grammar,
						    parent = element;

						while (parent && !lang.test(parent.className)) {
							parent = parent.parentNode;
						}

						if (parent) {
							language = (parent.className.match(lang) || [, ''])[1].toLowerCase();
							grammar = _.languages[language];
						}

						// Set language on the element, if not present
						element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

						if (element.parentNode) {
							// Set language on the parent, for styling
							parent = element.parentNode;

							if (/pre/i.test(parent.nodeName)) {
								parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
							}
						}

						var code = element.textContent;

						var env = {
							element: element,
							language: language,
							grammar: grammar,
							code: code
						};

						_.hooks.run('before-sanity-check', env);

						if (!env.code || !env.grammar) {
							if (env.code) {
								_.hooks.run('before-highlight', env);
								env.element.textContent = env.code;
								_.hooks.run('after-highlight', env);
							}
							_.hooks.run('complete', env);
							return;
						}

						_.hooks.run('before-highlight', env);

						if (async && _self.Worker) {
							var worker = new Worker(_.filename);

							worker.onmessage = function (evt) {
								env.highlightedCode = evt.data;

								_.hooks.run('before-insert', env);

								env.element.innerHTML = env.highlightedCode;

								callback && callback.call(env.element);
								_.hooks.run('after-highlight', env);
								_.hooks.run('complete', env);
							};

							worker.postMessage(JSON.stringify({
								language: env.language,
								code: env.code,
								immediateClose: true
							}));
						} else {
							env.highlightedCode = _.highlight(env.code, env.grammar, env.language);

							_.hooks.run('before-insert', env);

							env.element.innerHTML = env.highlightedCode;

							callback && callback.call(element);

							_.hooks.run('after-highlight', env);
							_.hooks.run('complete', env);
						}
					},

					highlight: function highlight(text, grammar, language) {
						var tokens = _.tokenize(text, grammar);
						return Token.stringify(_.util.encode(tokens), language);
					},

					matchGrammar: function matchGrammar(text, strarr, grammar, index, startPos, oneshot, target) {
						var Token = _.Token;

						for (var token in grammar) {
							if (!grammar.hasOwnProperty(token) || !grammar[token]) {
								continue;
							}

							if (token == target) {
								return;
							}

							var patterns = grammar[token];
							patterns = _.util.type(patterns) === "Array" ? patterns : [patterns];

							for (var j = 0; j < patterns.length; ++j) {
								var pattern = patterns[j],
								    inside = pattern.inside,
								    lookbehind = !!pattern.lookbehind,
								    greedy = !!pattern.greedy,
								    lookbehindLength = 0,
								    alias = pattern.alias;

								if (greedy && !pattern.pattern.global) {
									// Without the global flag, lastIndex won't work
									var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
									pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
								}

								pattern = pattern.pattern || pattern;

								// Don’t cache length as it changes during the loop
								for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

									var str = strarr[i];

									if (strarr.length > text.length) {
										// Something went terribly wrong, ABORT, ABORT!
										return;
									}

									if (str instanceof Token) {
										continue;
									}

									pattern.lastIndex = 0;

									var match = pattern.exec(str),
									    delNum = 1;

									// Greedy patterns can override/remove up to two previously matched tokens
									if (!match && greedy && i != strarr.length - 1) {
										pattern.lastIndex = pos;
										match = pattern.exec(text);
										if (!match) {
											break;
										}

										var from = match.index + (lookbehind ? match[1].length : 0),
										    to = match.index + match[0].length,
										    k = i,
										    p = pos;

										for (var len = strarr.length; k < len && (p < to || !strarr[k].type && !strarr[k - 1].greedy); ++k) {
											p += strarr[k].length;
											// Move the index i to the element in strarr that is closest to from
											if (from >= p) {
												++i;
												pos = p;
											}
										}

										/*
           * If strarr[i] is a Token, then the match starts inside another Token, which is invalid
           * If strarr[k - 1] is greedy we are in conflict with another greedy pattern
           */
										if (strarr[i] instanceof Token || strarr[k - 1].greedy) {
											continue;
										}

										// Number of tokens to delete and replace with the new match
										delNum = k - i;
										str = text.slice(pos, p);
										match.index -= pos;
									}

									if (!match) {
										if (oneshot) {
											break;
										}

										continue;
									}

									if (lookbehind) {
										lookbehindLength = match[1].length;
									}

									var from = match.index + lookbehindLength,
									    match = match[0].slice(lookbehindLength),
									    to = from + match.length,
									    before = str.slice(0, from),
									    after = str.slice(to);

									var args = [i, delNum];

									if (before) {
										++i;
										pos += before.length;
										args.push(before);
									}

									var wrapped = new Token(token, inside ? _.tokenize(match, inside) : match, alias, match, greedy);

									args.push(wrapped);

									if (after) {
										args.push(after);
									}

									Array.prototype.splice.apply(strarr, args);

									if (delNum != 1) _.matchGrammar(text, strarr, grammar, i, pos, true, token);

									if (oneshot) break;
								}
							}
						}
					},

					tokenize: function tokenize(text, grammar, language) {
						var strarr = [text];

						var rest = grammar.rest;

						if (rest) {
							for (var token in rest) {
								grammar[token] = rest[token];
							}

							delete grammar.rest;
						}

						_.matchGrammar(text, strarr, grammar, 0, 0, false);

						return strarr;
					},

					hooks: {
						all: {},

						add: function add(name, callback) {
							var hooks = _.hooks.all;

							hooks[name] = hooks[name] || [];

							hooks[name].push(callback);
						},

						run: function run(name, env) {
							var callbacks = _.hooks.all[name];

							if (!callbacks || !callbacks.length) {
								return;
							}

							for (var i = 0, callback; callback = callbacks[i++];) {
								callback(env);
							}
						}
					}
				};

				var Token = _.Token = function (type, content, alias, matchedStr, greedy) {
					this.type = type;
					this.content = content;
					this.alias = alias;
					// Copy of the full string this token was created from
					this.length = (matchedStr || "").length | 0;
					this.greedy = !!greedy;
				};

				Token.stringify = function (o, language, parent) {
					if (typeof o == 'string') {
						return o;
					}

					if (_.util.type(o) === 'Array') {
						return o.map(function (element) {
							return Token.stringify(element, language, o);
						}).join('');
					}

					var env = {
						type: o.type,
						content: Token.stringify(o.content, language, parent),
						tag: 'span',
						classes: ['token', o.type],
						attributes: {},
						language: language,
						parent: parent
					};

					if (o.alias) {
						var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
						Array.prototype.push.apply(env.classes, aliases);
					}

					_.hooks.run('wrap', env);

					var attributes = Object.keys(env.attributes).map(function (name) {
						return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
					}).join(' ');

					return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';
				};

				if (!_self.document) {
					if (!_self.addEventListener) {
						// in Node.js
						return _self.Prism;
					}

					if (!_.disableWorkerMessageHandler) {
						// In worker
						_self.addEventListener('message', function (evt) {
							var message = JSON.parse(evt.data),
							    lang = message.language,
							    code = message.code,
							    immediateClose = message.immediateClose;

							_self.postMessage(_.highlight(code, _.languages[lang], lang));
							if (immediateClose) {
								_self.close();
							}
						}, false);
					}

					return _self.Prism;
				}

				//Get current script and highlight
				var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

				if (script) {
					_.filename = script.src;

					if (!_.manual && !script.hasAttribute('data-manual')) {
						if (document.readyState !== "loading") {
							if (window.requestAnimationFrame) {
								window.requestAnimationFrame(_.highlightAll);
							} else {
								window.setTimeout(_.highlightAll, 16);
							}
						} else {
							document.addEventListener('DOMContentLoaded', _.highlightAll);
						}
					}
				}

				return _self.Prism;
			}();

			if (typeof module !== 'undefined' && module.exports) {
				module.exports = Prism;
			}

			// hack for components to work correctly in node.js
			if (typeof global !== 'undefined') {
				global.Prism = Prism;
			}

			/* **********************************************
        Begin prism-markup.js
   ********************************************** */

			Prism.languages.markup = {
				'comment': /<!--[\s\S]*?-->/,
				'prolog': /<\?[\s\S]+?\?>/,
				'doctype': /<!DOCTYPE[\s\S]+?>/i,
				'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
				'tag': {
					pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
					inside: {
						'tag': {
							pattern: /^<\/?[^\s>\/]+/i,
							inside: {
								'punctuation': /^<\/?/,
								'namespace': /^[^\s>\/:]+:/
							}
						},
						'attr-value': {
							pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
							inside: {
								'punctuation': [/^=/, {
									pattern: /(^|[^\\])["']/,
									lookbehind: true
								}]
							}
						},
						'punctuation': /\/?>/,
						'attr-name': {
							pattern: /[^\s>\/]+/,
							inside: {
								'namespace': /^[^\s>\/:]+:/
							}
						}

					}
				},
				'entity': /&#?[\da-z]{1,8};/i
			};

			Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] = Prism.languages.markup['entity'];

			// Plugin to make entity title show the real entity, idea by Roman Komarov
			Prism.hooks.add('wrap', function (env) {

				if (env.type === 'entity') {
					env.attributes['title'] = env.content.replace(/&amp;/, '&');
				}
			});

			Prism.languages.xml = Prism.languages.markup;
			Prism.languages.html = Prism.languages.markup;
			Prism.languages.mathml = Prism.languages.markup;
			Prism.languages.svg = Prism.languages.markup;

			/* **********************************************
        Begin prism-css.js
   ********************************************** */

			Prism.languages.css = {
				'comment': /\/\*[\s\S]*?\*\//,
				'atrule': {
					pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
					inside: {
						'rule': /@[\w-]+/
						// See rest below
					}
				},
				'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
				'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
				'string': {
					pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
					greedy: true
				},
				'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
				'important': /\B!important\b/i,
				'function': /[-a-z0-9]+(?=\()/i,
				'punctuation': /[(){};:]/
			};

			Prism.languages.css['atrule'].inside.rest = Prism.util.clone(Prism.languages.css);

			if (Prism.languages.markup) {
				Prism.languages.insertBefore('markup', 'tag', {
					'style': {
						pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
						lookbehind: true,
						inside: Prism.languages.css,
						alias: 'language-css',
						greedy: true
					}
				});

				Prism.languages.insertBefore('inside', 'attr-value', {
					'style-attr': {
						pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
						inside: {
							'attr-name': {
								pattern: /^\s*style/i,
								inside: Prism.languages.markup.tag.inside
							},
							'punctuation': /^\s*=\s*['"]|['"]\s*$/,
							'attr-value': {
								pattern: /.+/i,
								inside: Prism.languages.css
							}
						},
						alias: 'language-css'
					}
				}, Prism.languages.markup.tag);
			}

			/* **********************************************
        Begin prism-clike.js
   ********************************************** */

			Prism.languages.clike = {
				'comment': [{
					pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
					lookbehind: true
				}, {
					pattern: /(^|[^\\:])\/\/.*/,
					lookbehind: true
				}],
				'string': {
					pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
					greedy: true
				},
				'class-name': {
					pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
					lookbehind: true,
					inside: {
						punctuation: /[.\\]/
					}
				},
				'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
				'boolean': /\b(?:true|false)\b/,
				'function': /[a-z0-9_]+(?=\()/i,
				'number': /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
				'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
				'punctuation': /[{}[\];(),.:]/
			};

			/* **********************************************
        Begin prism-javascript.js
   ********************************************** */

			Prism.languages.javascript = Prism.languages.extend('clike', {
				'keyword': /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
				'number': /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/,
				// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
				'function': /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i,
				'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
			});

			Prism.languages.insertBefore('javascript', 'keyword', {
				'regex': {
					pattern: /(^|[^/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
					lookbehind: true,
					greedy: true
				},
				// This must be declared before keyword because we use "function" inside the look-forward
				'function-variable': {
					pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
					alias: 'function'
				}
			});

			Prism.languages.insertBefore('javascript', 'string', {
				'template-string': {
					pattern: /`(?:\\[\s\S]|[^\\`])*`/,
					greedy: true,
					inside: {
						'interpolation': {
							pattern: /\$\{[^}]+\}/,
							inside: {
								'interpolation-punctuation': {
									pattern: /^\$\{|\}$/,
									alias: 'punctuation'
								},
								rest: Prism.languages.javascript
							}
						},
						'string': /[\s\S]+/
					}
				}
			});

			if (Prism.languages.markup) {
				Prism.languages.insertBefore('markup', 'tag', {
					'script': {
						pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
						lookbehind: true,
						inside: Prism.languages.javascript,
						alias: 'language-javascript',
						greedy: true
					}
				});
			}

			Prism.languages.js = Prism.languages.javascript;

			/* **********************************************
        Begin prism-file-highlight.js
   ********************************************** */

			(function () {
				if (typeof self === 'undefined' || !self.Prism || !self.document || !document.querySelector) {
					return;
				}

				self.Prism.fileHighlight = function () {

					var Extensions = {
						'js': 'javascript',
						'py': 'python',
						'rb': 'ruby',
						'ps1': 'powershell',
						'psm1': 'powershell',
						'sh': 'bash',
						'bat': 'batch',
						'h': 'c',
						'tex': 'latex'
					};

					Array.prototype.slice.call(document.querySelectorAll('pre[data-src]')).forEach(function (pre) {
						var src = pre.getAttribute('data-src');

						var language,
						    parent = pre;
						var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;
						while (parent && !lang.test(parent.className)) {
							parent = parent.parentNode;
						}

						if (parent) {
							language = (pre.className.match(lang) || [, ''])[1];
						}

						if (!language) {
							var extension = (src.match(/\.(\w+)$/) || [, ''])[1];
							language = Extensions[extension] || extension;
						}

						var code = document.createElement('code');
						code.className = 'language-' + language;

						pre.textContent = '';

						code.textContent = 'Loading…';

						pre.appendChild(code);

						var xhr = new XMLHttpRequest();

						xhr.open('GET', src, true);

						xhr.onreadystatechange = function () {
							if (xhr.readyState == 4) {

								if (xhr.status < 400 && xhr.responseText) {
									code.textContent = xhr.responseText;

									Prism.highlightElement(code);
								} else if (xhr.status >= 400) {
									code.textContent = '✖ Error ' + xhr.status + ' while fetching file: ' + xhr.statusText;
								} else {
									code.textContent = '✖ Error: File does not exist or is empty';
								}
							}
						};

						xhr.send(null);
					});
				};

				document.addEventListener('DOMContentLoaded', self.Prism.fileHighlight);
			})();
		}).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
	}, {}], 2: [function (require, module, exports) {
		var App = function () {
			function App(serviceArray) {
				_classCallCheck(this, App);

				//app state object, contains data used to render and inside other methods
				this.state = serviceArray;
			}
			// promise that takes a chosen method (GET, POST, etc.) and a url address and returns a promise object
			// resolves with request response
			// rejects with request error


			_createClass(App, [{
				key: "sendRequest",
				value: function sendRequest(method, url) {
					var promise = new Promise(function (resolve, reject) {
						var xhr = new XMLHttpRequest();
						xhr.open(method, url);
						xhr.onload = function () {
							if (xhr.readyState === 4 && xhr.status === 200) {
								resolve(xhr);
							} else {
								reject(xhr);
							}
						};
						xhr.onerror = function () {
							reject(xhr);
						};
						xhr.send();
					});
					return promise;
				}
				// takes a xhrHttp object and returns render ready string

			}, {
				key: "prettifyResponse",
				value: function prettifyResponse(xhrHttp) {
					var Prism = require('prismjs');
					var meta = "http " + xhrHttp.status + " " + xhrHttp.statusText;
					var html = Prism.highlight(xhrHttp.responseText, Prism.languages.javascript);
					return meta + " <br/> " + html;
				}
				// takes an array of alias, value pairs and returns array of option domNodes

			}, {
				key: "getOptionDomNodes",
				value: function getOptionDomNodes(optionsArray) {
					return optionsArray.map(function (option) {
						var optionNode = document.createElement("option");
						optionNode.text = option.alias;
						optionNode.value = option.value;
						return optionNode;
					});
				}
				// takes a string and returns a h2 with that title

			}, {
				key: "getHeaderNode",
				value: function getHeaderNode(title) {
					var headerNode = document.createElement("h2");
					headerNode.innerHTML = title;
					return headerNode;
				}
				// takes a config object 
				// {
				//     context: service object,
				//     oprtions: string - attribute identifier of options array in context object,
				//     parameter: string - attribute identifier chosen option in context object
				// } 
				// returns a select node containing options based on provided config object

			}, {
				key: "getSelectNode",
				value: function getSelectNode(config) {
					var selectNode = document.createElement("select");
					this.getOptionDomNodes(config.context[config.options]).forEach(function (option) {
						selectNode.add(option);
					});
					selectNode.value = config.context[config.parameter];
					selectNode.addEventListener('change', function (event) {
						config.context[config.parameter] = event.target.value;
					});
					return selectNode;
				}
				// takes string and returns a span with provided text (url in that case)

			}, {
				key: "getUrlNode",
				value: function getUrlNode(url) {
					var urlNode = document.createElement("span");
					urlNode.innerHTML = url;
					return urlNode;
				}
				// takes a service object and a target node
				// on click sends request based on actual service object state
				// renders results inside target node

			}, {
				key: "getButtonNode",
				value: function getButtonNode(service, targetNode) {
					var _this = this;

					var buttonNode = document.createElement("button");
					buttonNode.innerHTML = "Send request";
					buttonNode.addEventListener("click", function () {
						_this.sendRequest(service.selectedMethod, service.url + "." + service.selectedFormat).then(function (result) {
							targetNode.innerHTML = _this.prettifyResponse(result);
						}).catch(function (error) {
							targetNode.innerHTML = _this.prettifyResponse(error);
						});
					});
					return buttonNode;
				}
				// returns Pre tag, used as target node to render request result in it

			}, {
				key: "getPreNode",
				value: function getPreNode() {
					var preNode = document.createElement("pre");
					return preNode;
				}
			}]);

			return App;
		}();

		module.exports = App;
	}, { "prismjs": 1 }] }, {}, [2]);
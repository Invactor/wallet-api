"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_yoga_1 = require("graphql-yoga");
var sqlite3 = __importStar(require("sqlite3"));
var utils_1 = require("./utils");
var stellar_sdk_1 = require("stellar-sdk");
var crypto_js_1 = require("crypto-js");
var secretKey = "SDFMDZI3GG3SJ3RNY4IA7D5NQAKB52Z5L6FZNMLHP6FK34IKWMF2P7OF";
var publicKey = "GBTM4HIIOGLORZEVMYCELCYGV445C3GPFKLWJRVHT46ZBJLSHCVEVEOJ";
var ENVCryptoSecret = '4da12d0d-8b0e-4b0a-8b0a-8b0e4b0a8b0e';
var resolvers = {
    Query: {
        user: function (_, _a, info) {
            var username = _a.username;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getUserByUsername(username)];
                        case 1: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        }
    },
    Mutation: {
        signup: function (_, _a, info) {
            var username = _a.username;
            return __awaiter(this, void 0, void 0, function () {
                var user, keypair, secret, data;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            if (user) {
                                return [2 /*return*/, user];
                            }
                            keypair = stellar_sdk_1.Keypair.random();
                            secret = crypto_js_1.AES.encrypt(keypair.secret(), ENVCryptoSecret).toString();
                            data = {
                                username: username,
                                stellarAccount: keypair.publicKey(),
                                stellarSeed: secret,
                            };
                            return [4 /*yield*/, createUser(data)];
                        case 2:
                            user = _b.sent();
                            /*
                              In a production app, you don't want to block to do this
                              operation or have the keys to create accounts in this same
                              app. Use something like AWS lambda, or a separate system to
                              provision the Stellar account.
                            */
                            return [4 /*yield*/, utils_1.createAccountInLedger(keypair.publicKey())
                                /** we connot using Trustline to XML
                                await createTrustline(keypair)
                                await allowTrust(keypair.publicKey())
                                */
                            ];
                        case 3:
                            /*
                              In a production app, you don't want to block to do this
                              operation or have the keys to create accounts in this same
                              app. Use something like AWS lambda, or a separate system to
                              provision the Stellar account.
                            */
                            _b.sent();
                            /** we connot using Trustline to XML
                            await createTrustline(keypair)
                            await allowTrust(keypair.publicKey())
                            */
                            return [4 /*yield*/, utils_1.payment(
                                // keypair for issuing account - no bueno, we'll replace this later
                                stellar_sdk_1.Keypair.fromSecret(secretKey), keypair.publicKey(), '10')];
                        case 4:
                            /** we connot using Trustline to XML
                            await createTrustline(keypair)
                            await allowTrust(keypair.publicKey())
                            */
                            _b.sent();
                            return [4 /*yield*/, getUserByUsername(username)];
                        case 5: return [2 /*return*/, _b.sent()];
                    }
                });
            });
        },
        /*
          For production apps don't rely  on the API to send you the senderUsername!
    
          It should be based on the Auth/session token.
        */
        payment: function (_, _a, info) {
            var amount = _a.amount, senderUsername = _a.senderUsername, recipientUsername = _a.recipientUsername, memo = _a.memo;
            return __awaiter(this, void 0, void 0, function () {
                var result, sender, recipient, signerKeys, hash, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getUsersByUsernameArray([senderUsername, recipientUsername])];
                        case 1:
                            result = _b.sent();
                            if (!Array.isArray(result)) {
                                throw new Error('Invalid result data');
                            }
                            sender = result.find(function (u) { return u.username === senderUsername; });
                            recipient = result.find(function (u) { return u.username === recipientUsername; });
                            signerKeys = stellar_sdk_1.Keypair.fromSecret(
                            // Use something like KMS in production
                            crypto_js_1.AES.decrypt(sender.stellarSeed, ENVCryptoSecret).toString(crypto_js_1.enc.Utf8));
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, utils_1.payment(signerKeys, recipient.stellarAccount, amount)];
                        case 3:
                            hash = (_b.sent()).hash;
                            return [2 /*return*/, { id: hash }];
                        case 4:
                            e_1 = _b.sent();
                            console.log("failure " + e_1);
                            throw e_1;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        credit: function (_, _a, info) {
            var amount = _a.amount, username = _a.username;
            return __awaiter(this, void 0, void 0, function () {
                var user, hash, e_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                throw new Error('User not found');
                            }
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, utils_1.payment(
                                // keypair for issuing account - no bueno
                                stellar_sdk_1.Keypair.fromSecret(secretKey), user.stellarAccount, amount)];
                        case 3:
                            hash = (_b.sent()).hash;
                            return [2 /*return*/, { id: hash }];
                        case 4:
                            e_2 = _b.sent();
                            console.log("failure " + e_2);
                            throw e_2;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        },
        debit: function (_, _a, info) {
            var amount = _a.amount, username = _a.username;
            return __awaiter(this, void 0, void 0, function () {
                var user, keypair, issuingAccount, hash, e_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                throw new Error('User not found');
                            }
                            keypair = stellar_sdk_1.Keypair.fromSecret(crypto_js_1.AES.decrypt(user.stellarSeed, ENVCryptoSecret).toString(crypto_js_1.enc.Utf8));
                            issuingAccount = publicKey;
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, utils_1.payment(keypair, issuingAccount, amount)];
                        case 3:
                            hash = (_b.sent()).hash;
                            console.log("account " + keypair.publicKey() + " debited - now transfer real money to " + username + " bank account");
                            return [2 /*return*/, { id: hash }];
                        case 4:
                            e_3 = _b.sent();
                            console.log("failure " + e_3);
                            throw e_3;
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }
    },
};
var db = new sqlite3.Database(':memory:');
db.run("\n  CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY,\n    username TEXT,\n    stellarAccount TEXT,\n    stellarSeed TEXT\n  )\n");
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
                        if (err)
                            reject(err);
                        resolve(row);
                    });
                })];
        });
    });
}
function createUser(data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    db.run('INSERT INTO users (username, stellarAccount, stellarSeed) VALUES (?, ?, ?)', [data.username, data.stellarAccount, data.stellarSeed], function (err) {
                        if (err)
                            reject(err);
                        resolve({ id: this.lastID });
                    });
                })];
        });
    });
}
function getUsersByUsernameArray(usernames) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var placeholders = usernames.map(function () { return '?'; }).join(',');
                    var query = "SELECT * FROM users WHERE username IN (" + placeholders + ")";
                    db.all(query, usernames, function (err, rows) {
                        if (err)
                            reject(err);
                        resolve(rows);
                    });
                })];
        });
    });
}
var server = new graphql_yoga_1.GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers: resolvers,
    context: function (req) { return (__assign({}, req, { db: db })); },
});
server.start(function () { return console.log('Server is running on http://localhost:4000'); });
//# sourceMappingURL=index.js.map
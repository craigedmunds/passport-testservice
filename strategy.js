var util = require('util')
  , OAuthStrategy = require('passport-oauth').OAuthStrategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {

  this._server = options.serverRoot;

  options = options || {};
  options.requestTokenURL = options.requestTokenURL || this._server + '/oauth/request_token';
  options.accessTokenURL = options.accessTokenURL || this._server + '/oauth/access_token';
  options.userAuthorizationURL = options.userAuthorizationURL || this._server + '/oauth/authorize';
  options.sessionKey = options.sessionKey || 'oauth:testservice';

  OAuthStrategy.call(this, options, verify);
  this.name = 'testservice';

  //geddy.log.debug('passport-testservice Strategy constructor this :' + util.inspect(this));
}

/**
 * Inherit from `OAuthStrategy`.
 */
util.inherits(Strategy, OAuthStrategy);

Strategy.prototype.userQuery = function(path, token, tokenSecret, done) {

  var url = this._server + "/api/v2/users" + path;
  
  // geddy.log.debug('userQuery server URL : ' + url);
  // geddy.log.debug('userQuery token : ' + token + ' tokenSecret : ' + tokenSecret);
  //geddy.log.debug('userQuery this._oauth : ' + util.inspect(this._oauth));

  this._oauth.get(url, token, tokenSecret, function (err, body, res) {
    

    // geddy.log.debug('userQuery err : ' + util.inspect(err));
    // geddy.log.debug('userQuery res : ' + util.inspect(res));
    // geddy.log.debug('userQuery body : ' + body);

    if (err) { return done(new InternalOAuthError('failed to fetch query', err)); }
    
    try {

      
      // var json = JSON.parse(body);
    
      done(null, { raw : body, json : JSON.parse(body)});
    } catch(e) {
      done(e);
    }
  });
}

Strategy.prototype.passThrough = function(url, token, tokenSecret, done) {

  var root = this._server + "/api/v2";

  //Safety check
  if (url.indexOf(root) != 0) {
    return done(new InternalOAuthError('Invalid URL for this strategy', null));
  }
  
  this._oauth.get(url, token, tokenSecret, function (err, body, res) {
    
  if (err) { return done(new InternalOAuthError('failed to fetch query', err)); }
    
    try {
      done(err, res, body);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
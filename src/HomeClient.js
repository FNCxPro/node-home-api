const { HomeDevice } = require('./')

/**
 * @typedef {Object} HomeClientOptions
 * @prop {String} ip - IP address of the Google Home to control
 */
class HomeClient {
  /**
   * Construct a home client
   * @param {HomeClientOptions} options - Options to use to initialize the client
   */
  constructor(options) {
    /**
     * The client's options
     * @type {HomeClientOptions}
     */
    this.options = options

    /**
     * The IP to use to connect to
     * @type {String}
     */
    this.ip = this.options.ip

    /**
     * The HomeDevice
     * @type {HomeDevice}
     */
    this.device = new HomeDevice(this.ip)
  }
}

module.exports = HomeClient
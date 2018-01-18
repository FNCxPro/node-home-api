const axios = require('axios')
const moment = require('moment')

class HomeDevice {
  /**
   * Home device
   * @param {String} ip - IP of the Google Home device
   * @param {Boolean} [test = false] - In testing?
   */
  constructor(ip, test = false) {
    /**
     * IP of the Google Home device
     * @type {String}
     */
    this.ip = ip

    /**
     * Is the device class in test
     */
    this.test = test

    /**
     * Ping interval to check if home is online
     * @type {Number}
     */
    this.pingTimer = !test ? setInterval(this.ping.bind(this), 1000) : 0 // So we don't hold the test up

    /**
     * Whether the device is connected to the home device
     * @type {Boolean}
     */
    this.connected = false

    /**
     * Time of the last ping
     * @type {moment}
     */
    this.lastPing = null

    /**
     * Last ping's /setup/eureka_info response
     * @type {Object}
     */
    this.lastPingData = {}

    this.ping()
  }

  /**
   * Device online check handler
   */
  async ping() {
    const resp = await this.request('/setup/eureka_info?options=version,name,build_info,device_info,net,wifi,setup,settings,opt_in,opencast,multizone,proxy,night_mode_params,user_eq,room_equalizer')
    if (typeof resp !== 'object') {
      this.lastPing = moment()
      this.lastPingData = resp
      this.connected = false
      return this.disconnect()
    } else {
      this.connected = resp.connected
      this.lastPing = moment()
      this.lastPingData = resp
    }
  }

  disconnect() {
    clearInterval(this.pingTimer)
    this.connected = false
  }

  /**
   * 
   * @param {String} [method = 'GET'] - HTTP method to use
   * @param {String} endpoint - Endpoint to call
   * @param {Object} [body] - Body of the request (if method == post) 
   * @param {Boolean} [test = false] - Whether the request is being run in tests (to return specific variables)
   */
  async request(method = 'GET', endpoint, body = {}, test = false) {
    if (typeof endpoint === 'undefined') {
      endpoint = method
      method = 'GET'
    }
    if (endpoint.startsWith('/')) endpoint = endpoint.slice(1)
    try {
      const resp = await axios({
        method: method,
        url: `http://${this.ip}:8008/${endpoint}`,
        data: body
      })
      if (test) return {
        status: resp.status,
        body: resp.data,
        error: false
      }
      return resp.data || resp.status
    } catch(err) {
      if (test) return {
        status: resp.status,
        body: resp.data,
        error: true
      }
      return resp.data || resp.status
    }
    
  }
}

module.exports = HomeDevice
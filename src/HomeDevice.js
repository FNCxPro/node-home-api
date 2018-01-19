const axios = require('axios')
const moment = require('moment')

/**
 * @typedef {Object} DeviceVersionInfo
 * @prop {String} systemBuildNumber - Build number
 * @prop {String} releaseTrack - Track of release
 * @prop {String} castBuildRev - Cast build revision
 * @prop {Number} previewChannelState - Preview channel state
 * @prop {Boolean} preivewChannel - In preview channel
 */

/**
 * @typedef {Object} DeviceIdentifiers
 * @prop {String} hotspotMAC - MAC address of the Wi-Fi setup network
 * @prop {String} macAddress - MAC address of the Wi-Fi card in the Home
 * @prop {String} cloudDeviceId - Cloud device id?
 * @prop {String} umaClientId - UMA Client Id?
 */

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

    /**
     * Device name
     * @type {String}
     */
    this.name = null

    /**
     * Device version info
     * @type {DeviceVersionInfo}
     */
    this.version = {}

    /**
     * Device time zone
     * @type {String}
     */
    this.timezone = null

    /**
     * Device identifiers (unique)
     * @type {DeviceIdentifiers}
     */
    this.identifiers = {}

    this.ping()
  }

  /**
   * Device online check handler
   */
  async ping() {
    const resp = await this.request('/setup/eureka_info?params=version,name,build_info,device_info,net,wifi,setup,settings,opt_in,opencast,multizone,proxy,night_mode_params,user_eq,room_equalizer&options=detail')
    if (typeof resp !== 'object') {
      this.lastPing = moment()
      this.lastPingData = resp
      this.connected = false
      this.disconnect()
    } else {
      this.connected = true
      this.lastPing = moment()
      this.lastPingData = resp
      this.updateMeta(resp)
    }
    return this.connected
  }

  /**
   * Update the metadata on the class
   * @param {Object} data - Update data
   */
  updateMeta(data) {
    this.name = data.name

    this.version = {
      systemBuildNumber: data.build_info.system_build_number,
      releaseTrack: data.build_info.release_track,
      castBuildRev: data.build_info.cast_build_revision,
      previewChannelState: data.build_info.preview_channel_state,
      previewChannel: data.opt_in.preview_channel
    }

    this.timezone = data.settings.timezone

    this.identifiers = {
      hotspotMAC: data.device_info.hotspot_bssid,
      macAddress: data.device_info.mac_address,
      cloudDeviceId: data.device_info.cloud_device_id,
      umaClientId: data.device_info.uma_client_id
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
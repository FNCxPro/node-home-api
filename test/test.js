const should = require('chai').should()

const ip = '192.168.7.94'
const { HomeClient, HomeDevice } = require('../')

describe('HomeDevice', () => {
  const device = new HomeDevice(ip, true)
  describe('request()', () => {
    it('should work when GET requesting /setup/eureka_info', async () => {
      const resp = await device.request('GET', '/setup/eureka_info?options=version,name', {}, true)
      resp.status.should.equal(200)
      resp.error.should.equal(false)
    })
    it('should have identifiers, version info and a name on the class', async () => {
      await device.ping()
      device.connected.should.equal(true)

      device.name.should.be.a('string')
      
      device.version.should.be.a('object')
      device.version.castBuildRev.should.be.a('string')
      device.version.previewChannel.should.be.a('boolean')
      device.version.previewChannelState.should.be.a('number')
      device.version.releaseTrack.should.be.a('string')
      device.version.systemBuildNumber.should.be.a('string')

      device.identifiers.should.be.a('object')
      device.identifiers.cloudDeviceId.should.be.a('string')
      device.identifiers.hotspotMAC.should.be.a('string')
      device.identifiers.macAddress.should.be.a('string')
      device.identifiers.umaClientId.should.be.a('string')
    })
  })
})
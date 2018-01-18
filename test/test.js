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
  })
})
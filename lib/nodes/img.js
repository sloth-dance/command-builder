'use strict'

const Joi = require('joi')
const BaseNode = require('../base-node')
const { converter } = require('../utils')

class Img extends BaseNode {
  get schema () {
    return Joi.object({
      name: 'img',
      attributes: Joi.object({
        format: Joi.string().valid('bmp', 'png', 'jpg', 'jpeg').required(),
        align: Joi.string().valid('left', 'center', 'right'),
        size: Joi.string().valid('normal', 'wide', 'high', 'wide-high')
      }),
      children: Joi.string().required()
    })
  }

  get defaultAttributes () {
    return {
      align: 'center',
      size: 'wide-high'
    }
  }

  async open () {
    this.attributes = Object.assign(this.defaultAttributes, this.attributes)
    this.applyStyle(this.attributes)
  }

  async printContent () {
    const content = this.children
    const { format, size } = this.attributes

    return new Promise((resolve, reject) => {
      this.commander.send('rasterBase64', content, format, size, (err, adapter) => {
        if (err) {
          return reject(err)
        }

        resolve(adapter)
      })
    })
  }

  async close () {}

  applyStyle (attributes) {
    const adapterType = this.type

    Object.keys(attributes).forEach(attr => {
      const value = attributes[attr]

      switch (attr) {
        case 'align':
          this.commander.send('align', converter(adapterType, attr, value))
          break
        case 'size':
          this.setAttribute('size', converter(adapterType, attr, value))
          break
      }
    })
  }
}

module.exports = Img

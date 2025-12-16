import { sm4 } from 'sm-crypto'
import { Base64 } from 'js-base64'

import cryptoConfig from './crypto'
const { key, iv } = cryptoConfig

export class Sm4Crypto {
  constructor(config) {
    this.validateConfig(config)
    this.config = config

    if (config.mode === 'cbc' && config.iv) {
      this.ivBytes = this.stringToBytes(config.iv)
    }
  }

  stringToBytes(str) {
    const bytes = []
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i))
    }
    return new Uint8Array(bytes)
  }

  validateConfig(config) {
    if (![16, 24, 32].includes(config.key.length)) {
      throw new Error(`SM4密钥长度必须为16/24/32字节，当前为${config.key.length}字节`)
    }
    if (config.mode === 'cbc') {
      if (!config.iv) throw new Error('CBC模式下必须提供IV')
      if (config.iv.length !== 16) throw new Error('CBC模式下IV必须为16字节字符串')
    }
  }

  encrypt(plainText) {
    if (typeof plainText !== 'string') throw new Error('SM4加密输入必须为字符串')
    try {
      const keyBytes = this.stringToBytes(this.config.key)
      const options = this.config.mode === 'cbc' ? { mode: 'cbc', iv: this.ivBytes } : { mode: 'ecb' }

      return sm4.encrypt(plainText, keyBytes, options)
    } catch (error) {
      console.error('SM4加密失败:', error)
      throw new Error('加密过程出错，请检查配置或输入')
    }
  }
  
  decrypt(cipherText) {
    if (typeof cipherText !== 'string') throw new Error('SM4解密输入必须为字符串')
    try {
      const keyBytes = this.stringToBytes(this.config.key)
      const options = this.config.mode === 'cbc' ? { mode: 'cbc', iv: this.ivBytes } : { mode: 'ecb' }

      return sm4.decrypt(cipherText, keyBytes, options)
    } catch (error) {
      console.error('SM4解密失败:', error)
      throw new Error('解密过程出错，请检查配置或输入')
    }
  }
  
  hexToBase64(hex) {
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
    let binary = ''
    bytes.forEach((b) => (binary += String.fromCharCode(b)))
    return Base64.fromUint8Array(bytes)
  }
  
  base64ToHex(base64) {
    const bytes = Base64.toUint8Array(base64)
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  encryptToBase64(plainText) {
    if (!plainText) return plainText
    const hex = this.encrypt(plainText)
    return this.hexToBase64(hex)
  }
  
  decryptFromBase64(base64Text) {
    const hex = this.base64ToHex(base64Text)
    return this.decrypt(hex)
  }
}

export function encrypt2Base64(password) {
  const sm4Crypto = new Sm4Crypto({ key, iv, mode: 'cbc' })
  return sm4Crypto.encryptToBase64(password)
}

export function decryptFromBase64(base64Text) {
  const sm4Crypto = new Sm4Crypto({ key, iv, mode: 'cbc' })
  return sm4Crypto.decryptFromBase64(base64Text)
}
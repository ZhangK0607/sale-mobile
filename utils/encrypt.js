import { JSEncrypt } from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair
const publicKey =
  'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBANc0yPKHzyVQpOEwZlZMqB00wvQ6ZNj2\n' +
  'lqtm4g8Jx4MBLEm2poG2Uuq6i0PDah7iO1Z9TitmkVMTwa2j6mP4fa8CAwEAAQ=='

const privateKey =
  'MIIBUwIBADANBgkqhkiG9w0BAQEFAASCAT0wggE5AgEAAkEA1zTI8ofPJVCk4TBm\n' +
  'VkyoHTTC9Dpk2PaWq2biDwnHgwEsSbamgbZS6rqLQ8NqHuI7Vn1OK2aRUxPBraPq\n' +
  'Y/h9rwIDAQABAkBX3OgyBPqwzHUUr5MIpvF4QyNZXUHxRvQK9M1UwHRhamgYT70N\n' +
  'E/u27ucxZsTIt/wMwObTJvjx1BVosM5RW+G5AiEA+vZ2Qjs8cHRSpztvXy0W+d0x\n' +
  'g2It5I4pIrGGMPKLejsCIQDbhpfCbBEcp0Vq4oIKvSo07HO4wppA+Rt/5G8sVrOf\n' +
  'HQIgAeFU03w0ILeOYvhcBj+FO4v/sfdLVroF7t+bnMREbT8CIExFfSDNzzw3WcUD\n' +
  'Ic99Xda5eJNu+Y0tf8J1qbKsBQh5AiAKKRG+skLOos7lkHZ5OZhaQ8aTalaSTb+h\n' +
  'yeY47Sjn7A=='

// 加密
export const encrypt = (txt) => {
  if (!txt) return ''
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export const decrypt = (txt) => {
  if (!txt) return ''
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}
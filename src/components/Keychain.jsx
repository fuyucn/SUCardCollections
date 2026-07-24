import './Keychain.css'

export default function Keychain() {
  return (
    <div className="keychain-ornament" title="拼豆钥匙链挂件 · Perler Bead Keychain">
      {/* 固定钉 */}
      <div className="keychain-pin" />

      {/* 金属环 */}
      <div className="keychain-ring" />

      {/* 链节 */}
      <div className="keychain-chain">
        <div className="keychain-link" />
        <div className="keychain-link" />
        <div className="keychain-link" />
      </div>

      {/* 拼豆卡牌 */}
      <div className="keychain-card">
        <img
          src="/images/perler-keychain.png"
          alt="拼豆钥匙链"
          loading="lazy"
        />
      </div>

      {/* 标签 */}
      <span className="keychain-label">PERLER</span>
    </div>
  )
}

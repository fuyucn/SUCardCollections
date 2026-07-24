import './Keychain.css'

/**
 * 拼豆钥匙链挂件 — 可复用组件
 * @param {string} image  挂饰图片路径
 * @param {string} label  底部标签文字
 * @param {number} swingDelay  摇摆动画延迟 (秒)
 * @param {number} cardWidth  卡牌宽度 (px)，默认 80
 * @param {string} className  额外 class（如 'fixed-ornament' 用于固定定位）
 */
export default function Keychain({
  image,
  label = '',
  swingDelay = 0,
  cardWidth = 80,
  className = '',
}) {
  return (
    <div
      className={`keychain-ornament ${className}`}
      style={{ animationDelay: `${swingDelay}s` }}
      title={`${label} · 拼豆钥匙链`}
    >
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

      {/* 卡牌挂饰 */}
      <div className="keychain-card" style={{ width: cardWidth }}>
        <img src={image} alt={label || '拼豆钥匙链'} loading="lazy" />
      </div>

      {/* 标签 */}
      {label && <span className="keychain-label">{label}</span>}
    </div>
  )
}

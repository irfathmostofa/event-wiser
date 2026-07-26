import "./Divider.css";

export default function Divider() {
  return (
    <div className="divider" aria-hidden="true">
      <span className="divider-line" />
      <span className="divider-mark">✦</span>
      <span className="divider-line" />
    </div>
  );
}

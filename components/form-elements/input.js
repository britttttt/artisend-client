export function Input({ id, type = "text", placeholder = "", refEl = undefined, label = undefined, onChangeEvent, value, addlClass = "", children }) {
  return (
    <div className={`field ${addlClass}`}>
     <h3>{label && <label className="label">{label}</label>}</h3>
      <div className="control">
        <input
          id={id}
          placeholder={placeholder}
          className="input"
          type={type}
          ref={refEl}
          value={value}
          onChange={onChangeEvent}
        ></input>
      </div>
      {children}
    </div>
  )
}

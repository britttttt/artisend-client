export function Textarea({ id, placeholder = "", refEl = undefined, label = undefined, onChangeEvent, addlClass = "" }) {
  return (
    <div className="field">
      <h3>{label && <label htmlFor={id} className="label">{label}</label>}</h3>
      <div className="control">
        <textarea
          id={id}
          className={`textarea ${addlClass}`}
          placeholder={placeholder}
          ref={refEl}
          onChange={onChangeEvent}
          rows="5" cols="50"
        ></textarea>
      </div>
    </div>
  );
}
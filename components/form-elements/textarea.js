export function Textarea({ id, placeholder = "", refEl = undefined, label = undefined, onChangeEvent, addlClass = "" }) {
  return (
    <div className="field">
      {label && <label htmlFor={id} className="label">{label}</label>}
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
export const TagSelector = ({ label, options, selected, onChange }) => {
  function addItem(id) {
    if (!selected.includes(id)) {
      onChange([...selected, id])
    }
  }

  function removeItem(id) {
    onChange(selected.filter(s => s !== id))
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <select onChange={(e) => addItem(parseInt(e.target.value))}>
        <option value="">-- Select --</option>
        {options
          .filter(opt => !selected.includes(opt.id))
          .map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
      </select>

      <div className="tags">
        {selected.map(id => {
          const opt = options.find(o => o.id === id)
          return (
            <span key={id} className="tag is-info">
              {opt?.label}
              <button
                type="button"
                className="delete is-small"
                onClick={() => removeItem(id)}
              ></button>
            </span>
          )
        })}
      </div>
    </div>
  )
}
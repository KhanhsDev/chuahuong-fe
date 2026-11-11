import { ErrorMessage, Field } from 'formik';

const PasswordField = ({
  name,
  label,
  placeholder,
  show,
  onToggle,
  hasError,
}: {
  name: string;
  label: string;
  placeholder: string;
  show: boolean;
  onToggle: () => void;
  hasError: boolean;
}) => {
  const inputClass = (hasError: boolean, extra = '') =>
    `h-11 w-full rounded-lg border px-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 ${extra} ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;
  return (
    <div className="grid gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <Field
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          className={inputClass(hasError, 'pr-14')}
        />
        {/* <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-emerald-700"
        >
          {show ? "Ẩn" : "Hiện"}
        </button> */}
      </div>
      <ErrorMessage name={name} component="p" className="text-xs text-red-600" />
    </div>
  );
};
export default PasswordField;

export const objectToFormData = (
  data: Record<string, any>,
  form?: FormData,
  namespace?: string
): FormData => {
  const formData = form || new FormData();

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const formKey = namespace ? `${namespace}[${key}]` : key;
      const value = data[key];

      if (value instanceof Date) {
        formData.append(formKey, value.toISOString());
      } else if (value instanceof File) {
        formData.append(formKey, value);
      } else if (
        typeof value === "object" &&
        value !== null &&
        !(value instanceof File)
      ) {
        // Recursively process nested objects or arrays
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
  }

  return formData;
};

const template = (text, placeholder, submitButton, cancelButton) => {
  const submitButtonTemplate = submitButton
    ? `<button type="submits" class="form-control" id="alertSubmit">${submitButton}</button>`
    : '';
  const cancelButtonTemplate = cancelButton
    ? `<button type="button" class="form-control" id="alertCancel">${cancelButton}</button>`
    : '';
  const inputTemplate = placeholder !== null
    ? `<input placeholder="${placeholder}" autocomplete="off" type="text" class="form-control" id="alertValue"/>`
    : '';
  const templates = `
<div class="alert">
  <div class="text">${text}</div>
  <form>
    ${inputTemplate}
    <div>${cancelButtonTemplate}${submitButtonTemplate}</div>
  </form>
</div>
`;
  return templates;
};

const dialog = (onSubmit, onCancel, template) => {
  let resolver;
  const promise = new Promise(resolve => resolver = resolve);
  const container = document.getElementById('appendToBodyContainer')
  const elem = document.createElement('div');
  elem.classList.add('alertContainer');
  elem.innerHTML = template;
  container.appendChild(elem);
  const alertValueElem = document.getElementById('alertValue')
  if (alertValueElem) {
    console.log('alertValueElem.focus();');
    alertValueElem.focus();
  } else {
    const alertSubmitElem = document.getElementById('alertSubmit')
    alertSubmitElem && alertSubmitElem.focus();
  }
  const alertCancel = document.getElementById('alertCancel');
  alertCancel && alertCancel.addEventListener('click', () => {
    resolver(onCancel && onCancel());
    elem.remove();
  });
  const alertSubmit = document.getElementById('alertSubmit');
  alertSubmit && alertSubmit.addEventListener('click', () => {
    resolver(onSubmit && onSubmit())
    elem.remove();
  });
  return promise;
}

export const prompt = (text, placeholder) =>
  dialog(
    () => document.getElementById('alertValue').value,
    () => null,
    template(text, placeholder || 'Enter…', "Submit", "Cancel"));

export const alert = text =>
  dialog(null, null, template(text, null, "Okay", null));

export const confirm = (text, placeholder) =>
  dialog(
    () => true,
    () => false,
    template(text, null, "Submit", "Cancel"));

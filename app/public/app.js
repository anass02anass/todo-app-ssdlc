'use strict';

const API = '/api/todos';

async function load() {
  const res = await fetch(API);
  const items = await res.json();
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  items.forEach(item => {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!item.completed;
    cb.addEventListener('change', () => toggle(item.id, cb.checked));
    const span = document.createElement('span');
    span.textContent = item.name; // textContent evita XSS
    if (item.completed) span.classList.add('done');
    const btn = document.createElement('button');
    btn.textContent = 'Eliminar';
    btn.addEventListener('click', () => remove(item.id));
    li.append(cb, span, btn);
    ul.appendChild(li);
  });
}

document.getElementById('form').addEventListener('submit', async e => {
  e.preventDefault();
  const input = document.getElementById('input');
  const name = input.value.trim();
  if (!name) return;
  await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  input.value = '';
  load();
});

async function toggle(id, completed) {
  await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  load();
}

async function remove(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  load();
}

load();

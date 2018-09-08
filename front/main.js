var listElement;

window.onload = () => {
  listElement = document.querySelector("#todo-list");
  loadList().catch(err => {
    alert(err);
  });
};

function insertItem() {
  if (event.keyCode !== 13) return;
  let inputValue = event.target.value;
  event.target.value = "";

  fetch("https://simple-todo-list-api.appspot.com/lists", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      todo: inputValue
    })
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      if (text === "OK") {
        loadList();
      }
    });
}

function loadList() {
  return fetch("https://simple-todo-list-api.appspot.com/lists")
    .then(response => {
      return response.json();
    })
    .then(lists => {
      listElement.innerHTML = "";
      for (let list of lists.result) {
        let item = document.createElement("tr");
        if (list.checked) item.classList.add("checked");
        let todo = document.createElement("td");
        todo.innerHTML = list.todo;

        let checked = document.createElement("td");
        let checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.checked = list.checked;
        checkbox.addEventListener("click", () => {
          itemChecked(list.id);
        });

        checked.appendChild(checkbox);
        item.appendChild(todo);
        item.appendChild(checked);
        listElement.appendChild(item);
      }
    });
}

function itemChecked(id) {
  fetch(`https://simple-todo-list-api.appspot.com/lists/${id}`, {
    method: "PATCH"
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      if (text === "OK") {
        loadList();
      }
    });
}

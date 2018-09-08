var listElement;

window.onload = () => {
  listElement = document.querySelector("#todo-list");
  loadList().catch(err => {
    alert(err);
  });
};

function insertItem() {
  if (event.keyCode !== 13) return;
  let input = document.querySelector("#newItem");

  fetch("http://localhost:3000/lists", {
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      todo: input.value
    })
  })
    .then(response => {
      return response.text();
    })
    .then(text => {
      if (text === "OK") {
        input.value = "";
        loadList();
      }
    });
}

function loadList() {
  return fetch("http://localhost:3000/lists")
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
  fetch(`http://localhost:3000/lists/${id}`, {
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
